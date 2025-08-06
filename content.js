function limitSuggestedVideos() {
  console.log(window.location.hostname);

  if (/youtube\.com$/.test(window.location.hostname)) {
    const secondaryColumn = document.querySelector('#secondary');
    if (secondaryColumn) {
      console.log("Secondary column found");
      secondaryColumn.style.display = 'none';
    }
    
    // Hide all elements with id "dismissible"
    const dismissibleElements = document.querySelectorAll('#dismissible');
    dismissibleElements.forEach(element => {
      element.style.display = 'none';
    });
  }

  
}

// Run the function when the page loads and when the user navigates
window.addEventListener('load', () => {
  console.log("Page loaded.");
  limitSuggestedVideos();
});

window.addEventListener('yt-navigate-finish', () => {
  console.log("Navigation finished.");
  limitSuggestedVideos();
});

// Add more YouTube-specific event listeners for dynamic content
window.addEventListener('yt-page-data-updated', () => {
  console.log("YouTube page data updated.");
  limitSuggestedVideos();
});

// Listen for YouTube's custom navigation events
window.addEventListener('yt-navigate-start', () => {
  console.log("YouTube navigation started.");
  // Small delay to ensure content is loaded
  setTimeout(limitSuggestedVideos, 100);
});

// Use MutationObserver to watch for DOM changes
const observer = new MutationObserver((mutations) => {
  let shouldRun = false;
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      // Check if any added nodes contain content we want to hide
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.id === 'contents' || 
              node.querySelector('#contents') || 
              node.querySelector('#page-manager.ytd-app') ||
              node.querySelector('main#main-content')) {
            shouldRun = true;
          }
        }
      });
    }
  });
  
  if (shouldRun) {
    console.log("DOM changes detected, running limitSuggestedVideos.");
    limitSuggestedVideos();
  }
});

// Start observing when the page loads
window.addEventListener('load', () => {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

