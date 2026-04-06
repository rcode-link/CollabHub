package com.collabhub.app;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;

import android.view.View;
import android.view.ViewGroup;

import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final int PERMISSION_REQUEST_CODE = 1001;
    private static final String CHANNEL_ID = "collabhub_notifications";
    private static final String PREFS_NAME = "collabhub_prefs";
    private int notificationId = 1000;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        createNotificationChannel();
        requestAppPermissions();
        startNtfyListener();

        WebView webView = getBridge().getWebView();

        // Apply window insets so WebView content stays below the status bar
        // and above the navigation bar (required for SDK 35+ edge-to-edge)
        View webViewParent = (View) webView.getParent();
        ViewCompat.setOnApplyWindowInsetsListener(webViewParent, (v, insets) -> {
            Insets systemBars = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
            );
            ViewGroup.MarginLayoutParams params = (ViewGroup.MarginLayoutParams) v.getLayoutParams();
            params.topMargin = systemBars.top;
            params.bottomMargin = systemBars.bottom;
            params.leftMargin = systemBars.left;
            params.rightMargin = systemBars.right;
            v.setLayoutParams(params);
            return WindowInsetsCompat.CONSUMED;
        });
        webViewParent.requestApplyInsets();

        // Enable media playback and getUserMedia for video calls
        WebSettings settings = webView.getSettings();
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);

        // Inject native bridge so remote pages can call into Android
        webView.addJavascriptInterface(new CollabHubBridge(), "CollabHubAndroid");

        // Grant WebView permission requests for camera/mic (video calls)
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> request.grant(request.getResources()));
            }
        });
    }

    /**
     * Start the ntfy SSE listener service if configured.
     */
    private void startNtfyListener() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        String server = prefs.getString("ntfyServer", null);
        String topic = prefs.getString("ntfyTopic", null);

        if (server != null && topic != null) {
            android.content.Intent intent = new android.content.Intent(this, NtfyListenerService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(intent);
            } else {
                startService(intent);
            }
        }
    }

    private void stopNtfyListener() {
        stopService(new android.content.Intent(this, NtfyListenerService.class));
    }

    /**
     * JavaScript interface exposed to the web page as window.CollabHubAndroid
     */
    public class CollabHubBridge {

        @JavascriptInterface
        public void showNotification(String title, String body) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
                    && ActivityCompat.checkSelfPermission(MainActivity.this,
                    Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                return;
            }

            NotificationCompat.Builder builder = new NotificationCompat.Builder(MainActivity.this, CHANNEL_ID)
                    .setSmallIcon(android.R.drawable.ic_dialog_info)
                    .setContentTitle(title)
                    .setContentText(body)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setAutoCancel(true)
                    .setVibrate(new long[]{0, 300, 200, 300});

            NotificationManagerCompat manager = NotificationManagerCompat.from(MainActivity.this);
            manager.notify(notificationId++, builder.build());
        }

        @JavascriptInterface
        public boolean hasNotificationPermission() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                return ContextCompat.checkSelfPermission(MainActivity.this,
                        Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
            }
            return true;
        }

        @JavascriptInterface
        public void requestNotificationPermission() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                ActivityCompat.requestPermissions(MainActivity.this,
                        new String[]{Manifest.permission.POST_NOTIFICATIONS},
                        PERMISSION_REQUEST_CODE);
            }
        }

        /**
         * Save server URL and auth token.
         */
        @JavascriptInterface
        public void saveCredentials(String serverUrl, String authToken) {
            getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
                    .edit()
                    .putString("serverUrl", serverUrl)
                    .putString("authToken", authToken)
                    .apply();
        }

        /**
         * Configure and start the ntfy SSE listener for push notifications.
         * Call from JS: CollabHubAndroid.startNtfy(ntfyServer, ntfyTopic)
         */
        @JavascriptInterface
        public void startNtfy(String ntfyServer, String ntfyTopic) {
            getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
                    .edit()
                    .putString("ntfyServer", ntfyServer)
                    .putString("ntfyTopic", ntfyTopic)
                    .apply();
            startNtfyListener();
        }

        /**
         * Clear stored credentials and stop ntfy listener (call on logout).
         */
        @JavascriptInterface
        public void clearCredentials() {
            stopNtfyListener();
            getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
                    .edit()
                    .clear()
                    .apply();
        }

        @JavascriptInterface
        public String getPlatform() {
            return "android";
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "CollabHub Notifications",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Chat messages, video calls, and other notifications");
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{0, 300, 200, 300});

            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }

    private void requestAppPermissions() {
        String[] permissions;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions = new String[]{
                    Manifest.permission.POST_NOTIFICATIONS,
                    Manifest.permission.CAMERA,
                    Manifest.permission.RECORD_AUDIO
            };
        } else {
            permissions = new String[]{
                    Manifest.permission.CAMERA,
                    Manifest.permission.RECORD_AUDIO
            };
        }

        boolean needsRequest = false;
        for (String perm : permissions) {
            if (ContextCompat.checkSelfPermission(this, perm) != PackageManager.PERMISSION_GRANTED) {
                needsRequest = true;
                break;
            }
        }

        if (needsRequest) {
            ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQUEST_CODE);
        }
    }
}
