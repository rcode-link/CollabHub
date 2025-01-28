import { onMounted, ref } from "vue";
export interface iTabCooridination {
    tabId: string;
    active: boolean;
    date: number;
    event: "update" | "closed";
}

export default () => {
    const tabId = Math.random().toString(36).substring(2, 15);
    const notificationChannel = new BroadcastChannel("tab-coordination");
    const activeTabs = ref<iTabCooridination[]>([]);
    const hasFocus = document.hasFocus();

    const tab = {
        tabId,
        active: hasFocus,
        date: Date.now(),
        event: "update",
    } as iTabCooridination;
    activeTabs.value.push(tab);
    notificationChannel.postMessage(tab);

    notificationChannel.addEventListener("message", (msg) => {
        const { tabId: msgTabId, event } = msg.data as iTabCooridination;
        const tabIndex = activeTabs.value.findIndex(
            (obj: iTabCooridination) => obj.tabId === msgTabId
        );

        if (tabIndex > -1) {
            activeTabs.value.splice(tabIndex, 1);
        }

        if (event === "closed") {
            return;
        }

        console.log(activeTabs.value);
        activeTabs.value.push(msg.data as iTabCooridination);
    });

    document.onfocus = () => {
        notificationChannel.postMessage({
            tabId,
            active: true,
            date: Date.now(),
            event: "update",
        });
    };

    document.onblur = () => {
        notificationChannel.postMessage({
            tabId,
            active: false,
            date: Date.now(),
            event: "update",
        });
    };

    window.addEventListener("unload", function (event) {
        console.log("unload");
        notificationChannel.postMessage({
            tabId,
            active: false,
            date: Date.now(),
            event: "closed",
        });
    });

    const shouldINotifify = () => {
        //there is active tab no need to send notificaion
        if (activeTabs.value.find((obj) => obj.active == true)) {
            return false;
        }
        const activeTab = activeTabs.value.reduce((a, b) =>
            a.date > b.date ? a : b
        );

        return activeTab.tabId === tabId;
    };

    return {
        shouldINotifify,
    };
};
