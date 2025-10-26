# Contact Manager

A simple web-based contact manager for macOS that allows you to quickly review and delete contacts using keyboard shortcuts.

## Features

- Shows contacts one by one for easy review
- Press 'D' to delete the current contact
- Press 'S' to skip to the next contact
- Clean, modern web interface
- Uses AppleScript to interact with the macOS Contacts app

## Setup

1. Make sure you have Node.js installed on your Mac
2. Navigate to the contact-manager directory
3. Install dependencies: `npm install`
4. Start the server: `npm start`
5. Open your browser and go to `http://localhost:3000`

## Usage

1. The app will load all your contacts automatically
2. Review each contact displayed on screen
3. Use keyboard shortcuts:
   - Press 'D' to delete the current contact
   - Press 'S' to skip to the next contact
4. Or use the buttons on screen
5. Progress is shown at the top of the screen

## Important Notes

- **Backup your contacts first!** This app permanently deletes contacts from your macOS Contacts app
- You may need to grant permission for Terminal/Node.js to access your Contacts when first running the app
- The app works by executing AppleScript commands to interact with the Contacts app
- Deleted contacts cannot be easily recovered, so use with caution

## Files

- `server.js` - Node.js server that handles API requests and executes AppleScripts
- `get_contacts.scpt` - AppleScript to retrieve all contacts
- `delete_contact.scpt` - AppleScript to delete a specific contact
- `public/index.html` - Web interface for the contact manager

## Stopping the App

Press `Ctrl+C` in the terminal where you started the server to stop the application.
