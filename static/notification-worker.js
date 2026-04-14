const beNotificationChannel = new BroadcastChannel('be-notifications');
const portalNotificationChannel = new BroadcastChannel('portal-notifications');
const workerChannel = new BroadcastChannel('worker-channel');

let running = false;

workerChannel.addEventListener('message', (event) => {
    if (event.data && event.data.notificationURL) {
        execLongPolling(event.data.notificationURL);
    }
});

async function execLongPolling(url) {
    if (url && !running) {
        while (true) {
            running = true;
            await waitForNotifications(url);
        }
    }
}

async function waitForNotifications(url) {
    const response = await fetch(url, {}).catch((e) => {
        if (e.name !== 'AbortError') {
            console.error(e);
        }
    });

    try {
        const result = await response?.json();

        if (Array.isArray(result?.notifications)) {
            beNotificationChannel.postMessage(result?.notifications);
        } else if (result?.event) {
            portalNotificationChannel.postMessage(result?.event);
        }
    } catch (e) {
        console.error(e);
    }
}
