"use client";

import { useState, useEffect, useCallback } from "react";
import ContactDisplay from "./components/ContactDisplay";
import Navigation from "./components/Navigation";
import Controls from "./components/Controls";
import StatusMessage from "./components/StatusMessage";
import type {
  Contact,
  DeletionQueueItem,
  StatusMessage as StatusMessageType,
} from "./types";

export type { Contact, Phone, Email } from "./types";

interface Filter {
  id: string;
  type: "text" | "phone";
  mode: "include" | "exclude";
  value: string;
}

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deletionQueue, setDeletionQueue] = useState<DeletionQueueItem[]>([]);
  const [deletedContactIds, setDeletedContactIds] = useState<Set<string>>(new Set());
  const [totalContactCount, setTotalContactCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessages, setStatusMessages] = useState<StatusMessageType[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const showMessage = useCallback(
    (text: string, type: StatusMessageType["type"], id?: string) => {
      const messageId = id || `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setStatusMessages((prev) => [
        ...prev,
        { message: text, type, id: messageId },
      ]);
    },
    []
  );
  const applyFilters = useCallback((contactList: Contact[]) => {
    if (filters.length === 0) return contactList;

    return contactList.filter((contact) => {
      // Check each filter
      for (const filter of filters) {
        if (filter.type === "text") {
          // Text filter: check name and company
          const searchText = filter.value.toLowerCase();
          const nameMatch = contact.name.toLowerCase().includes(searchText);
          const companyMatch = contact.company?.toLowerCase().includes(searchText);
          const hasMatch = nameMatch || companyMatch;

          if (filter.mode === "include" && !hasMatch) {
            return false; // Include filter: contact must match
          }
          if (filter.mode === "exclude" && hasMatch) {
            return false; // Exclude filter: contact must NOT match
          }
        } else if (filter.type === "phone") {
          // Phone filter: check if any phone number contains the pattern
          const phonePattern = filter.value.replace(/\s/g, ""); // Remove spaces
          const hasPhoneMatch = contact.phones?.some((phone) =>
            phone.number.replace(/\s/g, "").includes(phonePattern)
          );

          if (filter.mode === "include" && !hasPhoneMatch) {
            return false; // Include filter: must have matching phone
          }
          if (filter.mode === "exclude" && hasPhoneMatch) {
            return false; // Exclude filter: must NOT have matching phone
          }
        }
      }
      return true; // Passed all filters
    });
  }, [filters]);

  const addFilter = useCallback((type: "text" | "phone", mode: "include" | "exclude", value: string) => {
    if (!value.trim()) return;
    
    const newFilter: Filter = {
      id: `filter-${Date.now()}`,
      type,
      mode,
      value: value.trim(),
    };
    setFilters((prev) => [...prev, newFilter]);
  }, []);

  const removeFilter = useCallback((id: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const loadBatch = useCallback(async (start: number, limit: number) => {
    const response = await fetch(`/api/contacts?start=${start}&limit=${limit}`);
    if (!response.ok) throw new Error("Failed to load contacts");

    const data = await response.json();

    if (start === 1) {
      setContacts(data.contacts);
      setTotalContactCount(data.totalCount);
    } else {
      setContacts((prev) => [...prev, ...data.contacts]);
    }

    return data;
  }, []);

  const loadRemainingContacts = useCallback(
    async (total: number) => {
      try {
        const batchSize = 100;
        let nextStart = 101;

        while (nextStart <= total) {
          const data = await loadBatch(nextStart, batchSize);
          nextStart += data.contacts.length;
          await new Promise((resolve) => setTimeout(resolve, 100));
          if (!data.hasMore) break;
        }
      } catch (error) {
        console.error("Error loading remaining contacts:", error);
      }
    },
    [loadBatch],
  );

  const loadContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await loadBatch(1, 100);
      // Load remaining contacts in background
      if (data.totalCount > 100) {
        loadRemainingContacts(data.totalCount);
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
      showMessage("Error loading contacts", "error");
    } finally {
      setIsLoading(false);
    }
  }, [loadBatch, loadRemainingContacts, showMessage]);

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const processDeletionQueue = useCallback(async () => {
    if (deletionQueue.length === 0) return;

    const deletionsToProcess = [...deletionQueue];
    setDeletionQueue([]);

    let successCount = 0;
    for (const item of deletionsToProcess) {
      try {
        const response = await fetch(
          `/api/contacts/${encodeURIComponent(item.contact.id)}`,
          {
            method: "DELETE",
          },
        );

        const result = await response.json();

        if (result.success) {
          successCount++;
          setContacts((prev) => {
            const newContacts = prev.filter((c) => c.id !== item.contact.id);
            return newContacts;
          });
          // Remove the pending message
          setStatusMessages((prev) => prev.filter((m) => m.id !== item.id));
        }
      } catch (error) {
        console.error("Error deleting contact:", error);
      }
    }

    if (successCount > 0) {
      const successId = `success-${Date.now()}`;
      showMessage(`Deleted ${successCount} contact(s)`, "success", successId);
    } else {
      const errorId = `error-${Date.now()}`;
      showMessage("Failed to delete contacts", "error", errorId);
    }
  }, [deletionQueue, showMessage]);

  const deleteContact = useCallback(() => {
    if (currentIndex >= contacts.length) return;

    const contact = contacts[currentIndex];
    
    // Skip if already deleted or in deletion queue
    if (deletedContactIds.has(contact.id) || 
        deletionQueue.some(item => item.contact.id === contact.id)) {
      return;
    }
    
    const deletionId = `delete-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create timeout for this specific deletion
    const timeout = setTimeout(async () => {
      try {
        // Delete the contact
        const response = await fetch(`/api/contacts/${encodeURIComponent(contact.id)}`, {
          method: "DELETE",
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Mark as deleted but don't remove from array
          setDeletedContactIds((prev) => new Set([...prev, contact.id]));
          setStatusMessages((prev) => prev.filter((m) => m.id !== deletionId));
          setDeletionQueue((prev) => prev.filter((i) => i.id !== deletionId));
          const successId = `success-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          setStatusMessages((prev) => [...prev, { 
            message: `Deleted ${contact.name}`, 
            type: "success" as const, 
            id: successId 
          }]);
          setTimeout(() => {
            setStatusMessages((prev) => prev.filter((m) => m.id !== successId));
          }, 3000);
        } else {
          setStatusMessages((prev) => prev.filter((m) => m.id !== deletionId));
          setDeletionQueue((prev) => prev.filter((i) => i.id !== deletionId));
          const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          setStatusMessages((prev) => [...prev, { 
            message: `Failed to delete ${contact.name}: ${result.message}`, 
            type: "error" as const, 
            id: errorId 
          }]);
          setTimeout(() => {
            setStatusMessages((prev) => prev.filter((m) => m.id !== errorId));
          }, 3000);
        }
      } catch (error) {
        console.error("Error deleting contact:", error);
        setStatusMessages((prev) => prev.filter((m) => m.id !== deletionId));
        setDeletionQueue((prev) => prev.filter((i) => i.id !== deletionId));
        const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setStatusMessages((prev) => [...prev, { 
          message: `Error deleting ${contact.name}`, 
          type: "error" as const, 
          id: errorId 
        }]);
        setTimeout(() => {
          setStatusMessages((prev) => prev.filter((m) => m.id !== errorId));
        }, 3000);
      }
    }, 5000);

    setDeletionQueue((prev) => [
      ...prev,
      { contact, index: currentIndex, timeout, id: deletionId },
    ]);
    showMessage(`Deleting ${contact.name} in 5 seconds...`, "pending", deletionId);

    // Move to next contact (skip deleted ones and filtered-out ones)
    const filtered = applyFilters(contacts);
    let nextIndex = currentIndex + 1;
    while (nextIndex < contacts.length && 
           (deletedContactIds.has(contacts[nextIndex].id) ||
            !filtered.some(c => c.id === contacts[nextIndex].id))) {
      nextIndex++;
    }
    setCurrentIndex(Math.min(nextIndex, contacts.length - 1));
  }, [currentIndex, contacts, deletedContactIds, deletionQueue, showMessage, applyFilters]);

  const undoDeletion = useCallback((id?: string) => {
    if (!id) {
      // Undo all if no specific ID provided
      deletionQueue.forEach((item) => clearTimeout(item.timeout));
      setDeletionQueue([]);
      setStatusMessages((prev) => prev.filter((m) => m.type !== "pending"));
      const successId = `success-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      showMessage("Undone all pending deletions", "success", successId);
      return;
    }

    // Undo specific deletion
    setDeletionQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        clearTimeout(item.timeout);
        setStatusMessages((msgs) => msgs.filter((m) => m.id !== id));
        const successId = `success-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        showMessage(`Undone deletion of ${item.contact.name}`, "success", successId);
      }
      return prev.filter((i) => i.id !== id);
    });
  }, [deletionQueue, showMessage]);

  const skipContact = useCallback(() => {
    if (currentIndex >= contacts.length - 1) return;
    const filtered = applyFilters(contacts);
    let nextIndex = currentIndex + 1;
    // Skip deleted contacts and filtered-out contacts
    while (nextIndex < contacts.length && 
           (deletedContactIds.has(contacts[nextIndex].id) || 
            !filtered.some(c => c.id === contacts[nextIndex].id))) {
      nextIndex++;
    }
    setCurrentIndex(Math.min(nextIndex, contacts.length - 1));
  }, [currentIndex, contacts.length, deletedContactIds, contacts, applyFilters]);

  const previousContact = useCallback(() => {
    if (currentIndex <= 0) return;
    const filtered = applyFilters(contacts);
    let prevIndex = currentIndex - 1;
    // Skip deleted contacts and filtered-out contacts
    while (prevIndex >= 0 && 
           (deletedContactIds.has(contacts[prevIndex].id) ||
            !filtered.some(c => c.id === contacts[prevIndex].id))) {
      prevIndex--;
    }
    setCurrentIndex(Math.max(0, prevIndex));
  }, [currentIndex, deletedContactIds, contacts, applyFilters]);

  const nextContact = useCallback(() => {
    if (currentIndex >= contacts.length - 1) return;
    const filtered = applyFilters(contacts);
    let nextIndex = currentIndex + 1;
    // Skip deleted contacts and filtered-out contacts
    while (nextIndex < contacts.length && 
           (deletedContactIds.has(contacts[nextIndex].id) ||
            !filtered.some(c => c.id === contacts[nextIndex].id))) {
      nextIndex++;
    }
    setCurrentIndex(Math.min(nextIndex, contacts.length - 1));
  }, [currentIndex, contacts.length, deletedContactIds, contacts, applyFilters]);

  const jumpToContact = useCallback(
    (targetNumber: number) => {
      if (targetNumber < 1 || targetNumber > contacts.length) {
        showMessage(
          `Please enter a number between 1 and ${contacts.length}`,
          "error",
        );
        return;
      }

      setCurrentIndex(targetNumber - 1);
      showMessage(`Jumped to contact #${targetNumber}`, "success");
    },
    [contacts.length, showMessage],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (event.key.toLowerCase() === "d") {
        deleteContact();
      } else if (event.key.toLowerCase() === "s") {
        skipContact();
      } else if (event.key === "ArrowLeft") {
        previousContact();
      } else if (event.key === "ArrowRight") {
        nextContact();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteContact, skipContact, previousContact, nextContact]);

  // Auto-skip deleted contacts and filtered-out contacts when index or filters change
  useEffect(() => {
    if (contacts.length === 0) return;
    
    const filtered = applyFilters(contacts);
    const currentIsDeleted = contacts[currentIndex] && deletedContactIds.has(contacts[currentIndex].id);
    const currentIsFiltered = contacts[currentIndex] && !filtered.some(c => c.id === contacts[currentIndex].id);
    
    // If current contact is deleted or filtered out, move to next valid contact
    if (currentIsDeleted || currentIsFiltered) {
      let nextIndex = currentIndex + 1;
      while (nextIndex < contacts.length && 
             (deletedContactIds.has(contacts[nextIndex].id) ||
              !filtered.some(c => c.id === contacts[nextIndex].id))) {
        nextIndex++;
      }
      if (nextIndex < contacts.length) {
        setCurrentIndex(nextIndex);
      } else {
        // All contacts after this are deleted/filtered, try going backwards
        let prevIndex = currentIndex - 1;
        while (prevIndex >= 0 && 
               (deletedContactIds.has(contacts[prevIndex].id) ||
                !filtered.some(c => c.id === contacts[prevIndex].id))) {
          prevIndex--;
        }
        setCurrentIndex(Math.max(0, prevIndex));
      }
    }
  }, [currentIndex, contacts, deletedContactIds, filters, applyFilters]);

  // Apply filters to get the visible contacts
  const filteredContacts = applyFilters(contacts);
  const visibleContacts = filteredContacts.filter(c => !deletedContactIds.has(c.id));
  
  const currentContact = contacts[currentIndex];
  const isCurrentContactVisible = currentContact && 
    !deletedContactIds.has(currentContact.id) &&
    filteredContacts.some(c => c.id === currentContact.id);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Filter Panel */}
        {showFilterPanel && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">🔍 Filters</h2>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Add Filter Form */}
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <select
                  id="filterType"
                  className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500"
                  defaultValue="text"
                >
                  <option value="text">Text (Name/Company)</option>
                  <option value="phone">Phone Number</option>
                </select>
                <select
                  id="filterMode"
                  className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500"
                  defaultValue="include"
                >
                  <option value="include">Include</option>
                  <option value="exclude">Exclude</option>
                </select>
                <input
                  type="text"
                  id="filterValue"
                  placeholder="Enter value..."
                  className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const type = (document.getElementById("filterType") as HTMLSelectElement).value as "text" | "phone";
                      const mode = (document.getElementById("filterMode") as HTMLSelectElement).value as "include" | "exclude";
                      const value = (e.target as HTMLInputElement).value;
                      addFilter(type, mode, value);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const type = (document.getElementById("filterType") as HTMLSelectElement).value as "text" | "phone";
                    const mode = (document.getElementById("filterMode") as HTMLSelectElement).value as "include" | "exclude";
                    const value = (document.getElementById("filterValue") as HTMLInputElement).value;
                    addFilter(type, mode, value);
                    (document.getElementById("filterValue") as HTMLInputElement).value = "";
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-all"
                >
                  + Add Filter
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {filters.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">Active Filters:</h3>
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.map((filter) => (
                    <div
                      key={filter.id}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                        filter.mode === "include"
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : "bg-red-100 text-red-800 border border-red-300"
                      }`}
                    >
                      <span className="font-semibold">
                        {filter.type === "text" ? "Name/Company" : "Phone"}
                      </span>
                      <span>{filter.mode === "include" ? "Includes" : "Excludes"}</span>
                      <span className="font-mono bg-white/50 px-2 py-0.5 rounded">
                        {filter.value}
                      </span>
                      <button
                        onClick={() => removeFilter(filter.id)}
                        className="ml-1 hover:bg-white/50 rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  Showing {visibleContacts.length} of {contacts.length - deletedContactIds.size} contacts
                </div>
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📇 Contact Manager
              </h1>
              <p className="text-sm text-gray-600">
                Review and manage your contacts. Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">D</kbd> to delete,{" "}
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">S</kbd> to skip.
              </p>
            </div>
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                showFilterPanel || filters.length > 0
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title="Toggle filters"
            >
              🔍 {filters.length > 0 && `(${filters.length})`}
            </button>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                    Loading...
                  </span>
                ) : contacts.length === 0 ? (
                  "No contacts found"
                ) : (
                  <>
                    Contact {currentIndex + 1} of {contacts.length}
                    {filters.length > 0 && ` (${visibleContacts.length} match filters)`}
                  </>
                )}
              </span>
              {!isLoading && totalContactCount > 0 && contacts.length < totalContactCount && (
                <span className="text-xs text-gray-500">
                  Loading {totalContactCount} total...
                </span>
              )}
            </div>
            {!isLoading && contacts.length > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / contacts.length) * 100}%`,
                  }}
                ></div>
              </div>
            )}
          </div>

          <Navigation
            currentIndex={currentIndex}
            totalContacts={totalContactCount || contacts.length}
            loadedCount={contacts.length}
            onPrevious={previousContact}
            onNext={nextContact}
            onJump={jumpToContact}
            disabled={isLoading || contacts.length === 0}
          />
        </div>

        {/* Contact Card */}
        {isCurrentContactVisible ? (
          <ContactDisplay
            contact={currentContact}
            onUpdate={(updatedContact: Contact) => {
              setContacts((prev) => {
                const newContacts = [...prev];
                newContacts[currentIndex] = updatedContact;
                return newContacts;
              });
            }}
            onMessage={(message: string, type: "success" | "error") => {
              const id = `${type}-${Date.now()}`;
              showMessage(message, type, id);
            }}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center text-gray-500">
            {isLoading ? "Loading your contacts..." : filters.length > 0 ? "No contacts match the current filters" : "No contacts to review"}
          </div>
        )}

        <Controls
          onDelete={deleteContact}
          onSkip={skipContact}
          disabled={isLoading || !currentContact}
        />

        <StatusMessage messages={statusMessages} onUndo={undoDeletion} />
      </div>

      {/* Keyboard Shortcuts Helper */}
      <div className="fixed bottom-3 right-3 bg-black/80 text-white px-3 py-2 rounded-lg text-xs shadow-lg">
        <div className="font-medium mb-1">Shortcuts:</div>
        <div className="space-y-0.5">
          <div>D = Delete</div>
          <div>S = Skip</div>
          <div>← → = Navigate</div>
        </div>
      </div>
    </main>
  );
}

