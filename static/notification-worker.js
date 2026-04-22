const beNotificationChannel = new BroadcastChannel('be-notifications');
const portalNotificationChannel = new BroadcastChannel('portal-notifications');
const workerChannel = new BroadcastChannel('worker-channel');

let runningObjectEventPolling = false;
let runningPortalNotificationPolling = false;

workerChannel.addEventListener('message', (event) => {
    if (event.data && event.data.objectEventURL) {
        execObjectEventPolling(event.data.objectEventURL);
    }

    if (event.data && event.data.portalNotificationURL) {
        execPortalNotificationPolling(event.data.portalNotificationURL);
    }
});


// Object Events Polling

async function execObjectEventPolling(url) {
    if (url && !runningObjectEventPolling) {
        while (true) {
            runningObjectEventPolling = true;
            await waitForObjectEvents(url);
        }
    }
}

async function waitForObjectEvents(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'kix-requestid': Date.now()
            }
        });
        const result = await response?.json();

        if (Array.isArray(result?.notifications)) {
            beNotificationChannel.postMessage(result?.notifications);
        }

    } catch (e) {
        console.error(e);
    }
}

// Portal Notifications Polling

async function execPortalNotificationPolling(url) {
    if (url && !runningPortalNotificationPolling) {
        while (true) {
            runningPortalNotificationPolling = true;
            await waitForPortalNotifications(url);
        }
    }
}

async function waitForPortalNotifications(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'kix-requestid': Date.now()
            }
        });
        const result = await response?.json();

        if (result?.portalNotification) {
            portalNotificationChannel.postMessage(result?.portalNotification);
        }
    } catch (e) {
        console.error(e);
    }
}
