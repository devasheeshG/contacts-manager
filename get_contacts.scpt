tell application "Contacts"
    set contactList to {}
    repeat with p in people
        try
            set contactName to name of p
            set contactID to id of p
            set phoneValue to ""
            set phoneList to phones of p
            if (count of phoneList) > 0 then
                set phoneValue to value of item 1 of phoneList
                repeat with ph in phoneList
                    try
                        set theLabel to label of ph as string
                        if theLabel is "mobile" or theLabel is "Mobile" then
                            set phoneValue to value of ph
                            exit repeat
                        end if
                    end try
                end repeat
            end if
            set end of contactList to {contactName, contactID, phoneValue}
        on error
            -- Skip contacts without names
        end try
    end repeat
    return contactList
end tell
