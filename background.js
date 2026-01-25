console.log("🔄 Background script is alive1!");

const TIME_LIMIT = 5000; // 1 * 60 * 1000;
const TRACKED_SITES = [
    /^https?:\/\/(www\.)?youtube\.com\/feed\/subscriptions/,
    /^https?:\/\/(www\.)?youtube\.com\/?$/,
    /^https?:\/\/(www\.)?youtube\.ca\/?$/,
    /^https?:\/\/(www\.)?reddit\.com(\/r\/[^\/]+)?\/?$/
];
let trackingInterval = undefined;

chrome.storage.local.set({ timeLimit: TIME_LIMIT });

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        checkSiteAccess(tab);
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

// Helper function to get current date string (YYYY-MM-DD)
function getTodayDateString() {
    const today = new Date();
    // 2026-01-25T20:32:48.912Z
    const timestamp = today.toISOString();
    const withoutSeconds = timestamp.replace(/:\d{2}\.\d{3}Z$/, '');
    // strip the seconds and milliseconds
    return withoutSeconds;
}

// Get timeSpent, automatically resetting if date has changed
async function getTimeSpent() {
    const data = await chrome.storage.local.get(["timeSpent"]);
    return data.timeSpent || 0;
}

// Set timeSpent, ensuring date is stored
function setTimeSpent(timeSpent) {
    chrome.storage.local.set({ timeSpent });
}

async function checkSiteAccess(tab) {
    if (!TRACKED_SITES.some((pattern) => pattern.test(tab.url))) {
        console.log("NOT on a site that has a time limit")
        stopTracking();
        return;
    }

    // reset time spent if the date has changed
    const today = getTodayDateString();
    const lastResetDate = await chrome.storage.local.get("lastResetDate");

    if (lastResetDate?.lastResetDate !== today) {
        console.log("📅 New day detected, resetting timeSpent");
        chrome.storage.local.set({ timeSpent: 0, lastResetDate: today });
    }

    console.log("on a site that has a time limit")
    startTracking(tab.id);
}

function startTracking(tabId) {
    if (!!trackingInterval) { return; }

    chrome.action.setIcon({
        path: {
            "48": "icon-active.png"
        }
    });

    trackingInterval = setInterval(async () => {
        console.log("Tracking time");
        const timeSpent = await getTimeSpent();
        const newTimeSpent = timeSpent + 1000;

        setTimeSpent(newTimeSpent);

        if (newTimeSpent >= TIME_LIMIT) {
            clearInterval(trackingInterval);
            console.log("Ran out of time!")
            // Navigate to the extension's time limit page
            const redirectUrl = chrome.runtime.getURL("time-limit.html");
            chrome.tabs.update(tabId, { url: redirectUrl });
        }

        console.log('setting timespent' + newTimeSpent)
        const remainingSeconds = Math.floor((TIME_LIMIT - newTimeSpent) / 1000);
        const remainingMinutes = Math.floor(remainingSeconds / 60);
        const displaySeconds = remainingSeconds % 60;

        // Badge text is limited to 4 characters, so show just minutes or a compact format
        const badgeText = remainingMinutes > 0
            ? `${remainingMinutes}m`  // e.g., "5m" 
            : `${displaySeconds}s`;   // e.g., "30s" for under 1 minute

        chrome.action.setBadgeText({ text: badgeText });

    }, 1000);
}

function stopTracking() {

    chrome.action.setIcon({
        path: {
            "48": "icon.png"
        }
    });

    if (trackingInterval) {
        console.log("Stopping tracking");
        clearInterval(trackingInterval);
        trackingInterval = undefined;
    }
}

