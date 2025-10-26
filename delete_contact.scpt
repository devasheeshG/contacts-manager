on run argv
    set contactID to item 1 of argv
    tell application "Contacts"
        try
            set targetPerson to person id contactID
            delete targetPerson
            save
            return "Success: Contact deleted"
        on error errMsg
            return "Error: " & errMsg
        end try
    end tell
end run