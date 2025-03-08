const spentTimerDisplay = document.getElementById("spentTimer");
const remainingTimerDisplay = document.getElementById("remainingTimer");
let timeLimit = 30 * 60 * 1000; // 30 minutes default but will be updated from storage

        // Fetch time spent from storage
        chrome.storage.local.get(["timeLimit"], (data) => {
            timeLimit = data.timeLimit || 30 * 60 * 1000;
        });

document.getElementById("toggleCSS").addEventListener("change", toggleCSS);

document.addEventListener("DOMContentLoaded", () => {
    setInterval(setTimerValue, 1000);
});

function setTimerValue(){
        // Fetch time spent from storage
        chrome.storage.local.get(["timeSpent"], (data) => {

            const minutesSpent = Math.floor(data.timeSpent / 60000);
            const secondsSpent = Math.floor((data.timeSpent % 60000) / 1000);
            
            const timeRemaining = timeLimit - (data.timeSpent || 0);
            const remainingMinutes = Math.floor(timeRemaining / 60000);
            const remainingSeconds = Math.floor((timeRemaining % 60000) / 1000);

            spentTimerDisplay.innerText = `Time Spent: ${minutesSpent}:${secondsSpent.toString().padStart(2, '0')}`;
            remainingTimerDisplay.innerText = `Time Remaining: ${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        });
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
            chrome.storage.local.set({ timeSpent : 9999999 });
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
