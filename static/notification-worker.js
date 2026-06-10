const beNotificationChannel = new BroadcastChannel('be-notifications');
const portalNotificationChannel = new BroadcastChannel('portal-notifications');
const workerChannel = new BroadcastChannel('worker-channel');

let runningBENotificationPolling = false;
let runningPortalNotificationPolling = false;

let eventKey;
let beNotificationInterval;

let application;
let objectEventURL;

workerChannel.addEventListener('message', (event) => {
    if (event.data.forceNotificationLoad) {
        clearInterval(beNotificationInterval);
        runningBENotificationPolling = false;
        loadBENotifications();
        execObjectEventPolling();
    } else {
        application = event.data.application;

        if (event.data && event.data.objectEventURL) {
            objectEventURL = event.data.objectEventURL;
            execObjectEventPolling();
        }

        if (event.data && event.data.portalNotificationURL) {
            execPortalNotificationPolling(event.data.portalNotificationURL);
        }
    }
});


// Object Events Polling
async function execObjectEventPolling() {
    if (objectEventURL && !runningBENotificationPolling) {
        runningBENotificationPolling = true;
        beNotificationInterval = setInterval(() => loadBENotifications(), 5000);
    }
}

async function loadBENotifications() {
    try {
        const response = await fetch(`${objectEventURL}?eventKey=${eventKey}`, {
            credentials: "include",
            headers: {
                'kix-requestid': Date.now(),
                'kix-application': application
            },
        });

        if (response.status !== 200) {
            runningBENotificationPolling = false;
            clearInterval(beNotificationInterval);
        } else {
            const result = await response?.json();

            if (result?.eventKey) {
                eventKey = result.eventKey;
            }
            if (Array.isArray(result?.notifications)) {
                beNotificationChannel.postMessage(result?.notifications);
            }
        }

    } catch (e) {
        clearInterval(beNotificationInterval);
        runningBENotificationPolling = false;
        console.error(e);
    }
}

// Portal Notifications Polling

async function execPortalNotificationPolling(url) {
    if (url && !runningPortalNotificationPolling) {
        runningPortalNotificationPolling = true;

        while (true) {
            await waitForPortalNotifications(url);
            if (!runningBENotificationPolling) {
                break;
            }
        }
    }
}

async function waitForPortalNotifications(url) {
    try {
        const response = await fetch(url, {
            credentials: "include",
            headers: {
                'kix-requestid': Date.now(),
                'kix-application': application
            }
        });
        const result = await response?.json();

        if (response.status !== 200) {
            runningPortalNotificationPolling = false;
        } else if (result?.portalNotification) {
            portalNotificationChannel.postMessage(result?.portalNotification);
        }
    } catch (e) {
        runningPortalNotificationPolling = false;
        console.error(e);
    }
}
