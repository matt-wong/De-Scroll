const spentTimerDisplay = document.getElementById("spentTimer");
const remainingTimerDisplay = document.getElementById("remainingTimer");
const lastResetDateDisplay = document.getElementById("lastResetDate");
let timeLimit = 30 * 60 * 1000; // 30 minutes default but will be updated from storage

        // Fetch time spent from storage
        chrome.storage.local.get(["timeLimit"], (data) => {
            timeLimit = data.timeLimit || 30 * 60 * 1000;
        });

document.getElementById("toggleCSS").addEventListener("change", toggleCSS);

document.addEventListener("DOMContentLoaded", () => {
    setInterval(setTimerValue, 1000);
});

// Helper function to get current date string (YYYY-MM-DD)
function getTodayDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

async function setTimerValue(){
        // Fetch time spent from storage (with automatic date-based reset)
        const data = await chrome.storage.local.get(["timeSpent", "lastResetDate"]);
        const timeSpent = data.timeSpent;
        const lastResetDate = data.lastResetDate;

        const minutesSpent = Math.floor(timeSpent / 60000);
        const secondsSpent = Math.floor((timeSpent % 60000) / 1000);
        const timeRemaining = timeLimit - timeSpent;
        const remainingMinutes = Math.max(0, Math.floor(timeRemaining / 60000));
        const remainingSeconds = Math.max(0, Math.floor((timeRemaining % 60000) / 1000));

        spentTimerDisplay.innerText = `Time Spent: ${minutesSpent || 0}:${(secondsSpent || 0).toString().padStart(2, '0')}`;
        remainingTimerDisplay.innerText = `Time Remaining: ${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        lastResetDateDisplay.innerText = `Last Reset: ${lastResetDate}`;
}

// Apply or remove custom CSS
function toggleCSS(event) {
    const enabled = event.target.checked;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;

        if (enabled) {
            console.log('Yes!');
            chrome.scripting.insertCSS({
                target: { tabId: tabId },
                css: `
                body {
                    filter: grayscale(100%)
                }

                main {
                    display: none; /* Reduce visibility of interactive elements */
                }

                ytd-app {
                    opacity: 0;
                }
                `
            });
            // Set timeSpent to a high value to trigger limit, ensuring date is stored
            const today = getTodayDateString();
            chrome.storage.local.set({ timeSpent: 9999999, lastResetDate: today });
        } else {
            chrome.scripting.removeCSS({
                target: { tabId: tabId },
                css: `
                body {
                    filter: grayscale(0%);
                }

                main {
                    display: block;
                }

                ytd-app {
                    opacity: 1;
                }
                `
            });
        }
    });
}
