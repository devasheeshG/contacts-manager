const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Get all contacts
app.get('/api/contacts', (req, res) => {
    exec('osascript get_contacts.scpt', (error, stdout, stderr) => {
        if (error) {
            console.error('Error getting contacts:', error);
            return res.status(500).json({ error: 'Failed to get contacts' });
        }
        
        // Parse AppleScript output
        const rawOutput = stdout.trim();
        const contacts = [];
        
        if (rawOutput) {
            try {
                // AppleScript returns format like: {"Name 1", "ID1", "Phone1", "Name 2", "ID2", "Phone2", ...}
                const cleanOutput = rawOutput.replace(/^\{|\}$/g, '').replace(/"/g, '');
                const items = cleanOutput.split(', ');
                
                for (let i = 0; i < items.length; i += 3) {
                    if (items[i] && items[i + 1]) {
                        contacts.push({
                            name: items[i].trim(),
                            id: items[i + 1].trim(),
                            phone: items[i + 2] ? items[i + 2].trim() : ''
                        });
                    }
                }
            } catch (parseError) {
                console.error('Error parsing contacts:', parseError);
                return res.status(500).json({ error: 'Failed to parse contacts' });
            }
        }
        
        res.json(contacts);
    });
});

// Delete a contact
app.delete('/api/contacts/:id', (req, res) => {
    const contactId = req.params.id;
    
    exec(`osascript delete_contact.scpt "${contactId}"`, (error, stdout, stderr) => {
        if (error) {
            console.error('Error deleting contact:', error);
            return res.status(500).json({ error: 'Failed to delete contact' });
        }
        
        const result = stdout.trim();
        if (result.startsWith('Success')) {
            res.json({ success: true, message: result });
        } else {
            res.status(500).json({ success: false, message: result });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Contact Manager server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});