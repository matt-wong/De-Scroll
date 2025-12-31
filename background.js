console.log("🔄 Background script is alive1!");

const TIME_LIMIT = 1 * 60 * 1000;
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
    return today.toISOString().split('T')[0];
}

// Get timeSpent, automatically resetting if date has changed
function getTimeSpent(callback) {
    chrome.storage.local.get(["timeSpent", "lastResetDate"], (data) => {
        const today = getTodayDateString();
        const lastResetDate = data.lastResetDate;
        
        // If date has changed, reset timeSpent
        if (lastResetDate !== today) {
            console.log("📅 New day detected, resetting timeSpent");
            chrome.storage.local.set({ timeSpent: 0, lastResetDate: today });
            callback(0);
        } else {
            callback(data.timeSpent || 0);
        }
    });
}

// Set timeSpent, ensuring date is stored
function setTimeSpent(timeSpent) {
    const today = getTodayDateString();
    chrome.storage.local.set({ timeSpent, lastResetDate: today });
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
    } else {
        console.log("SAMEDAY");
    }

    console.log("on a site that has a time limit")
    startTracking(tab.id);
}

function startTracking(tabId) {
    if (!!trackingInterval){return;}

    chrome.action.setIcon({
        path: {
        "48": "icon-active.png"
        }
    });

    trackingInterval = setInterval(() => {
        console.log("Tracking time");
        getTimeSpent((timeSpent) => {
            timeSpent = timeSpent + 1000;

            if (timeSpent >= TIME_LIMIT) {
                clearInterval(trackingInterval);
                console.log("Ran out of time!")
                // Navigate to the extension's time limit page
                const redirectUrl = chrome.runtime.getURL("time-limit.html");
                chrome.tabs.update(tabId, { url: redirectUrl });
            } else {
                console.log('setting timespent' + timeSpent)
                setTimeSpent(timeSpent);

                const remainingMinutes = (Math.floor((TIME_LIMIT - timeSpent)/ (1000)) - 1).toString();
                console.log(remainingMinutes);
                chrome.action?.setBadgeText({ text: remainingMinutes });
            }
        });
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

