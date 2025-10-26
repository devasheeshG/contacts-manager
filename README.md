# Contact Manager - Next.js Edition

A modern contact management app for macOS with hot reload, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- ✨ **Modern Stack**: Next.js 14, TypeScript, Tailwind CSS
- 🔥 **Hot Reload**: Instant updates during development
- ⚡ **Batch Loading**: Fast initial load with progressive background loading
- 📱 **Full Contact Details**: Name, company, phones (all), emails (all)
- ⌨️ **Keyboard Shortcuts**: Navigate with D, S, and arrow keys
- 🎯 **Smart Navigation**: Jump to any contact, undo deletions
- 📝 **Inline Editing**: Edit names, phones, emails, and company
- 🎨 **Beautiful UI**: Clean design with Tailwind CSS

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features in Detail

### Contact Information Displayed

- **Name** - Editable with inline editing
- **Company** - Displayed if available
- **Phone Numbers** - All phone numbers with labels (mobile, home, work, etc.)
- **Email Addresses** - All email addresses with labels
- **Edit Any Field** - Click the ✏️ icon next to any field

### Keyboard Shortcuts

- `D` - Delete contact (with 5-second undo window)
- `S` - Skip to next contact
- `←` - Previous contact
- `→` - Next contact
- `Enter` - Jump to contact (when in jump field)

### Smart Features

- **Batch Loading**: First 100 contacts load immediately, rest load in background
- **Undo Deletion**: 5-second window to undo any deletion
- **Queue System**: Delete multiple contacts, undo all with one click
- **Jump Navigation**: Type a number and jump directly to that contact
- **Progress Indicator**: Shows current position and total contacts

## Project Structure

```plaintext
contact-manager/
├── app/
│   ├── api/
│   │   └── contacts/
│   │       ├── route.ts          # GET contacts API
│   │       └── [id]/route.ts     # DELETE/PATCH contact API
│   ├── globals.css               # Tailwind styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page component
├── components/
│   ├── ContactDisplay.tsx        # Contact card with editing
│   ├── Navigation.tsx            # Navigation controls
│   ├── Controls.tsx              # Delete/Skip buttons
│   └── StatusMessage.tsx         # Status messages & undo
├── get_contacts.scpt             # AppleScript to fetch contacts
├── delete_contact.scpt           # AppleScript to delete contacts
├── update_contact.scpt           # AppleScript to update contacts
└── package.json
```

## AppleScript Integration

The app uses three AppleScript files to interact with macOS Contacts:

1. **get_contacts.scpt** - Fetches contacts with all details (name, company, phones, emails)
2. **delete_contact.scpt** - Deletes a contact by ID
3. **update_contact.scpt** - Updates contact name or phone

## Development

- Hot reload is enabled - any changes to files will update immediately
- TypeScript provides type safety
- Tailwind CSS for rapid UI development

## Building for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **AppleScript** - macOS Contacts integration

## License

MIT
