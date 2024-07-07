importScripts("echo.iife.min.js");

self.onmessage = function (event) {
    const text = `HEY! Your task "safdasfgd" is now overdue.`;
    setInterval(() => {
        new Notification("To do list", {
            body: text,
        });
    }, 2000);
    // new Echo({
    //     broadcaster: "pusher",
    //     key: event.data.VITE_PUSHER_APP_KEY,
    //     cluster: event.data.VITE_PUSHER_APP_CLUSTER ?? "mt1",
    //     wsHost: event.data.VITE_PUSHER_HOST
    //         ? event.data.VITE_PUSHER_HOST
    //         : `ws-${event.data.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
    //     wsPort: event.data.VITE_PUSHER_PORT ?? 80,
    //     wssPort: event.data.VITE_PUSHER_PORT ?? 443,
    //     forceTLS: (event.data.VITE_PUSHER_SCHEME ?? "https") === "https",
    //     encrypted: true,
    //     enabledTransports: ["ws", "wss"],
    //     authEndpoint: "/api/v1/pusher/auth",
    //     auth: {
    //         headers: {
    //             Authorization: `Bearer ${localStorage.getItem("token")}`,
    //             "X-CSRF-TOKEN": document
    //                 .querySelector('[name="token"]')
    //                 .getAttribute("content"),
    //         },
    //     },
    // });
    console.log(event.data);
};
