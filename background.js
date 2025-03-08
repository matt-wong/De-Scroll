console.log("🔄 Background script is alive1!");

const TIME_LIMIT = 1 * 60 * 1000;
const TRACKED_SITES = [
    /^https?:\/\/(www\.)?youtube\.com\/feed\/subscriptions/,
    /^https?:\/\/(www\.)?reddit\.com(\/r\/[^\/]+)?\/?$/
];
let trackingInterval = undefined;

chrome.storage.local.set({ timeLimit: TIME_LIMIT });

chrome.alarms.create("resetDailyTime", { when: getMidnight(), periodInMinutes: 1440 });

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (TRACKED_SITES.some((pattern) => pattern.test(tab.url))) {
            startTracking(tab.id);
        } else {
            stopTracking();
        }
    });
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    chrome.tabs.get(details.tabId, (tab) => {
        checkSiteAccess(tab);
    });
});


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url || tab.url) {
        checkSiteAccess(tab);
    }
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "resetDailyTime") {
        chrome.storage.local.set({ timeSpent: 0 });
    }
});

function checkSiteAccess(tab) {
    if (!TRACKED_SITES.some((pattern) => pattern.test(tab.url))) {
        console.log("NOT on a site that has a time limit")
        stopTracking();
        return;
    }

    console.log("on a site that has a time limit")
    startTracking(tab.id);
}

function startTracking(tabId) {
    if (!!trackingInterval){return;}

    trackingInterval = setInterval(() => {
        console.log("Tracking time");
        chrome.storage.local.get(["timeSpent"], (data) => {
            let timeSpent = (data.timeSpent || 0) + 1000;

            if (timeSpent >= TIME_LIMIT) {
                clearInterval(trackingInterval);
                console.log("Ran out of time!")
                chrome.tabs.update(tabId, { url: "chrome://bookmarks/" });
            } else {
                console.log('setting timespent' + timeSpent)
                chrome.storage.local.set({ timeSpent });
            }
        });
    }, 1000);

    chrome.tabs.onRemoved.addListener((closedTabId) => {
        if (closedTabId === tabId) clearInterval(interval);
    });
}

function stopTracking() {
    if (trackingInterval) {
        console.log("Stopping tracking");
        clearInterval(trackingInterval);
        trackingInterval = undefined;
    }
}

function getMidnight() {
    let now = new Date();
    now.setHours(24, 0, 0, 0);
    return now.getTime();
}
