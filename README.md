# De-Scroll

A browser extension designed to help you regain control of your online browsing experience by limiting distracting content on popular platforms like YouTube and Reddit.

## Features

- **YouTube Homepage Control**: Removes the endless stream of suggested videos from the YouTube homepage, helping you stay focused.
- **Reddit Feed Management**: Hides the main content feed on Reddit to prevent endless scrolling.
- **Simple Toggle**: Easy-to-use popup interface to enable/disable the extension's features.
- **Cross-platform**: Works on multiple websites to provide a consistent, distraction-free experience.

## Installation

1. Clone this repository or download the source code
2. Open your browser's extension management page
   - Chrome: Navigate to `chrome://extensions/`
   - Edge: Navigate to `edge://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the directory containing the extension files

## How It Works

De-Scroll works by intercepting and modifying the display of content feeds on supported websites. When activated, it:
- Hides the main content feed on YouTube's homepage
- Removes the infinite scroll feed on Reddit
- Maintains normal functionality for specific video/post pages

## Files

- `manifest.json`: Extension configuration and permissions
- `background.js`: Background service worker for extension functionality
- `content.js`: Content script that modifies webpage elements
- `popup.html/js`: User interface for controlling the extension
- `icon.png`: Extension icon

## Permissions

The extension requires the following permissions:
- `tabs`: To access and modify tab content
- `activeTab`: To interact with the current tab
- `storage`: To save user preferences
- `scripting`: To inject and run scripts
- `alarms`: For timing-based features
- `webNavigation`: To detect page navigation events

## Contributing

Feel free to submit issues and enhancement requests!

## License

[MIT License](LICENSE)

## Privacy

De-Scroll operates entirely locally on your machine and does not collect or transmit any user data.
