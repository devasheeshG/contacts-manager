on run argv
    -- Check if we have offset and limit arguments
    set startIndex to 1
    set batchSize to 0
    
    if (count of argv) > 0 then
        set startIndex to (item 1 of argv) as integer
    end if
    
    if (count of argv) > 1 then
        set batchSize to (item 2 of argv) as integer
    end if
    
    tell application "Contacts"
        set contactList to {}
        set allPeople to people
        set totalCount to count of allPeople
        
        -- Calculate end index
        if batchSize is 0 then
            set endIndex to totalCount
        else
            set endIndex to startIndex + batchSize - 1
            if endIndex > totalCount then
                set endIndex to totalCount
            end if
        end if
        
        -- Return total count as first item
        set output to totalCount as string
        
        -- Process only the requested batch
        repeat with i from startIndex to endIndex
            try
                set p to item i of allPeople
                set contactName to name of p
                set contactID to id of p
                set phoneValues to ""
                set emailValues to ""
                set companyValue to ""
                
                -- Get all phone numbers
                try
                    set phoneList to phones of p
                    if (count of phoneList) > 0 then
                        set phoneNumbers to {}
                        repeat with ph in phoneList
                            try
                                set rawLabel to label of ph as string
                                set phoneNum to value of ph
                                
                                -- Clean up the label format
                                set phoneLabel to rawLabel
                                if rawLabel contains "$!<" and rawLabel contains ">!$" then
                                    try
                                        set AppleScript's text item delimiters to "$!<"
                                        set tempParts to text items of rawLabel
                                        if (count of tempParts) > 1 then
                                            set tempLabel to item 2 of tempParts
                                            set AppleScript's text item delimiters to ">!$"
                                            set labelParts to text items of tempLabel
                                            if (count of labelParts) > 0 then
                                                set phoneLabel to item 1 of labelParts
                                            end if
                                        end if
                                        set AppleScript's text item delimiters to ""
                                    on error
                                        set phoneLabel to "phone"
                                        set AppleScript's text item delimiters to ""
                                    end try
                                end if
                                
                                set end of phoneNumbers to phoneLabel & ":" & phoneNum
                            end try
                        end repeat
                        -- Join phone numbers with semicolon separator
                        set AppleScript's text item delimiters to ";"
                        set phoneValues to phoneNumbers as string
                        set AppleScript's text item delimiters to ""
                    end if
                end try
                
                -- Get all email addresses
                try
                    set emailList to emails of p
                    if (count of emailList) > 0 then
                        set emailAddresses to {}
                        repeat with em in emailList
                            try
                                set rawLabel to label of em as string
                                set emailAddr to value of em
                                
                                -- Clean up the label format
                                set emailLabel to rawLabel
                                if rawLabel contains "$!<" and rawLabel contains ">!$" then
                                    try
                                        set AppleScript's text item delimiters to "$!<"
                                        set tempParts to text items of rawLabel
                                        if (count of tempParts) > 1 then
                                            set tempLabel to item 2 of tempParts
                                            set AppleScript's text item delimiters to ">!$"
                                            set labelParts to text items of tempLabel
                                            if (count of labelParts) > 0 then
                                                set emailLabel to item 1 of labelParts
                                            end if
                                        end if
                                        set AppleScript's text item delimiters to ""
                                    on error
                                        set emailLabel to "email"
                                        set AppleScript's text item delimiters to ""
                                    end try
                                end if
                                
                                set end of emailAddresses to emailLabel & ":" & emailAddr
                            end try
                        end repeat
                        -- Join emails with semicolon separator
                        set AppleScript's text item delimiters to ";"
                        set emailValues to emailAddresses as string
                        set AppleScript's text item delimiters to ""
                    end if
                end try
                
                -- Get company/organization
                try
                    set companyValue to organization of p
                end try
                
                -- Use a unique delimiter (|||) to separate fields
                set output to output & "|||" & contactName & "|||" & contactID & "|||" & phoneValues & "|||" & emailValues & "|||" & companyValue
            on error
                -- Skip contacts without names
            end try
        end repeat
        
        return output
    end tell
end run

