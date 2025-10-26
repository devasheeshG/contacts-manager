export interface Phone {
  label: string;
  number: string;
}

export interface Email {
  label: string;
  address: string;
}

export interface Contact {
  name: string;
  id: string;
  phones: Phone[];
  emails: Email[];
  company: string;
}

export interface DeletionQueueItem {
  contact: Contact;
  index: number;
  timeout: NodeJS.Timeout;
  id: string; // Unique ID for each deletion
}

export interface StatusMessage {
  message: string;
  type: "success" | "error" | "pending";
  id?: string; // For individual deletion messages
}
