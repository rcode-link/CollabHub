package com.collabhub.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Foreground service that listens to ntfy via Server-Sent Events (SSE).
 * Shows a persistent low-priority notification while running.
 * Reconnects automatically on connection loss with exponential backoff.
 */
public class NtfyListenerService extends Service {

    private static final String TAG = "NtfyListener";
    private static final String CHANNEL_ID = "collabhub_notifications";
    private static final String FOREGROUND_CHANNEL_ID = "collabhub_listener";
    private static final String PREFS_NAME = "collabhub_prefs";

    private volatile boolean running = false;
    private Thread listenerThread;
    private int notificationId = 2000;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannels();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String ntfyServer = getPrefs().getString("ntfyServer", null);
        String ntfyTopic = getPrefs().getString("ntfyTopic", null);

        if (ntfyServer == null || ntfyTopic == null) {
            Log.d(TAG, "No ntfy config, stopping service");
            stopSelf();
            return START_NOT_STICKY;
        }

        // Start as foreground service with a minimal persistent notification
        startForeground(1, buildForegroundNotification());

        // Start SSE listener
        running = true;
        startListening(ntfyServer, ntfyTopic);

        // Re-create if killed by the system
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        running = false;
        if (listenerThread != null) {
            listenerThread.interrupt();
        }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void startListening(String server, String topic) {
        if (listenerThread != null && listenerThread.isAlive()) {
            return;
        }

        listenerThread = new Thread(() -> {
            int backoff = 1000; // Start at 1s, max 60s
            final int maxBackoff = 60000;

            while (running) {
                HttpURLConnection conn = null;
                try {
                    String sseUrl = server + "/" + topic + "/sse";
                    Log.d(TAG, "Connecting to " + sseUrl);

                    URL url = new URL(sseUrl);
                    conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("GET");
                    conn.setRequestProperty("Accept", "text/event-stream");
                    conn.setConnectTimeout(15000);
                    conn.setReadTimeout(0); // No read timeout for SSE

                    int code = conn.getResponseCode();
                    if (code != 200) {
                        Log.w(TAG, "ntfy returned " + code);
                        throw new Exception("HTTP " + code);
                    }

                    // Connected successfully, reset backoff
                    backoff = 1000;

                    BufferedReader reader = new BufferedReader(
                            new InputStreamReader(conn.getInputStream()));
                    String line;
                    StringBuilder eventData = new StringBuilder();

                    while (running && (line = reader.readLine()) != null) {
                        if (line.startsWith("data: ")) {
                            eventData.append(line.substring(6));
                        } else if (line.isEmpty() && eventData.length() > 0) {
                            // End of event
                            handleEvent(eventData.toString());
                            eventData.setLength(0);
                        }
                    }
                    reader.close();

                } catch (Exception e) {
                    if (running) {
                        Log.w(TAG, "Connection lost, retrying in " + backoff + "ms", e);
                    }
                } finally {
                    if (conn != null) {
                        conn.disconnect();
                    }
                }

                // Reconnect with backoff
                if (running) {
                    try {
                        Thread.sleep(backoff);
                    } catch (InterruptedException e) {
                        break;
                    }
                    backoff = Math.min(backoff * 2, maxBackoff);
                }
            }
        }, "ntfy-sse-listener");
        listenerThread.start();
    }

    private void handleEvent(String data) {
        try {
            JSONObject json = new JSONObject(data);
            String event = json.optString("event", "");

            if (!"message".equals(event)) return;

            String title = json.optString("title", "CollabHub");
            String body = json.optString("message", "");
            String priority = json.optString("priority", "3");

            showNotification(title, body, Integer.parseInt(priority));

        } catch (Exception e) {
            Log.w(TAG, "Failed to parse ntfy event", e);
        }
    }

    private void showNotification(String title, String body, int priority) {
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        int androidPriority = priority >= 4
                ? NotificationCompat.PRIORITY_HIGH
                : NotificationCompat.PRIORITY_DEFAULT;

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle(title)
                .setContentText(body)
                .setPriority(androidPriority)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setVibrate(new long[]{0, 300, 200, 300});

        NotificationManagerCompat manager = NotificationManagerCompat.from(this);
        manager.notify(notificationId++, builder.build());
    }

    private Notification buildForegroundNotification() {
        Intent intent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        return new NotificationCompat.Builder(this, FOREGROUND_CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_popup_reminder)
                .setContentTitle("CollabHub")
                .setContentText("Connected — receiving notifications")
                .setPriority(NotificationCompat.PRIORITY_MIN)
                .setOngoing(true)
                .setContentIntent(pendingIntent)
                .build();
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);

            // Main notification channel
            NotificationChannel main = new NotificationChannel(
                    CHANNEL_ID,
                    "CollabHub Notifications",
                    NotificationManager.IMPORTANCE_HIGH
            );
            main.setDescription("Chat messages and video calls");
            main.enableVibration(true);
            manager.createNotificationChannel(main);

            // Low-priority foreground service channel
            NotificationChannel listener = new NotificationChannel(
                    FOREGROUND_CHANNEL_ID,
                    "Background Connection",
                    NotificationManager.IMPORTANCE_MIN
            );
            listener.setDescription("Keeps CollabHub connected for notifications");
            listener.setShowBadge(false);
            manager.createNotificationChannel(listener);
        }
    }

    private SharedPreferences getPrefs() {
        return getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
    }
}
