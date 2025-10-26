on run argv
    set contactID to item 1 of argv
    set newName to item 2 of argv
    set newCompany to item 3 of argv
    set newPhone to item 4 of argv
    set phoneIndexStr to item 5 of argv
    set newEmail to item 6 of argv
    set emailIndexStr to item 7 of argv
    
    set phoneIndex to (phoneIndexStr as integer) + 1 -- Convert to 1-based index
    set emailIndex to (emailIndexStr as integer) + 1 -- Convert to 1-based index
    
    -- Check for deletion flags
    set deletePhone to false
    set deleteEmail to false
    if newPhone is "DELETE" then
        set deletePhone to true
    end if
    if newEmail is "DELETE" then
        set deleteEmail to true
    end if
    
    tell application "Contacts"
        try
            set thePerson to person id contactID
            
            -- Update name if provided
            if newName is not "" then
                -- Split the name into first and last name
                set AppleScript's text item delimiters to " "
                set nameComponents to text items of newName
                set AppleScript's text item delimiters to ""
                
                if (count of nameComponents) > 0 then
                    set first name of thePerson to item 1 of nameComponents
                    
                    if (count of nameComponents) > 1 then
                        set lastName to ""
                        repeat with i from 2 to count of nameComponents
                            if lastName is "" then
                                set lastName to item i of nameComponents
                            else
                                set lastName to lastName & " " & item i of nameComponents
                            end if
                        end repeat
                        set last name of thePerson to lastName
                    else
                        set last name of thePerson to ""
                    end if
                end if
            end if
            
            -- Update company if argument is provided (even if empty)
            if (count of argv) ≥ 3 then
                set organization of thePerson to newCompany
            end if
            
            -- Update or delete phone
            if deletePhone then
                -- Delete phone at the specified index
                set phoneList to phones of thePerson
                if phoneIndex ≤ (count of phoneList) then
                    delete item phoneIndex of phoneList
                end if
            else if newPhone is not "" then
                set phoneList to phones of thePerson
                if phoneIndex ≤ (count of phoneList) then
                    -- Update existing phone at the specified index
                    set value of item phoneIndex of phoneList to newPhone
                else
                    -- Add a new phone number
                    make new phone at end of phones of thePerson with properties {label:"mobile", value:newPhone}
                end if
            end if
            
            -- Update or delete email
            if deleteEmail then
                -- Delete email at the specified index
                set emailList to emails of thePerson
                if emailIndex ≤ (count of emailList) then
                    delete item emailIndex of emailList
                end if
            else if newEmail is not "" then
                set emailList to emails of thePerson
                if emailIndex ≤ (count of emailList) then
                    -- Update existing email at the specified index
                    set value of item emailIndex of emailList to newEmail
                else
                    -- Add a new email address
                    make new email at end of emails of thePerson with properties {label:"work", value:newEmail}
                end if
            end if
            
            save
            return "Success: Contact updated"
        on error errMsg
            return "Error: " & errMsg
        end try
    end tell
end run
