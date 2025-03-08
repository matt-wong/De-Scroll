function limitSuggestedVideos() {
  console.log(window.location.hostname);
	
  if (window.location.hostname === 'www.youtube.com' && window.location.pathname === '/'){
    const suggestionsContainer = document.querySelector('#page-manager.ytd-app');
    if (suggestionsContainer) {
  	  suggestionsContainer.style.display = 'none'
    } 
  }
  
    const suggestionsContainer = document.querySelector('main#main-content');
    if (suggestionsContainer) {
		console.log("reddit found");
  	  suggestionsContainer.style.display = 'none'
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