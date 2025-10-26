"use client";

import { useState } from "react";
import type { Contact, Phone, Email } from "../types";

interface Props {
  contact: Contact;
  onUpdate: (contact: Contact) => void;
  onMessage: (message: string, type: "success" | "error") => void;
}

export default function ContactDisplay({
  contact,
  onUpdate,
  onMessage,
}: Props) {
  const [editingName, setEditingName] = useState(false);
  const [editingCompany, setEditingCompany] = useState(false);
  const [editingPhone, setEditingPhone] = useState<number | null>(null);
  const [editingEmail, setEditingEmail] = useState<number | null>(null);
  const [addingPhone, setAddingPhone] = useState(false);
  const [addingEmail, setAddingEmail] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [companyValue, setCompanyValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [emailValue, setEmailValue] = useState("");

  const handleEditName = () => {
    setEditingName(true);
    setNameValue(contact.name);
  };

  const handleSaveName = async () => {
    if (!nameValue.trim()) {
      onMessage("Name cannot be empty", "error");
      return;
    }

    try {
      const response = await fetch(
        `/api/contacts/${encodeURIComponent(contact.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: nameValue }),
        },
      );

      const result = await response.json();

      if (result.success) {
        onUpdate({ ...contact, name: nameValue });
        setEditingName(false);
        onMessage(`Updated name to "${nameValue}"`, "success");
      } else {
        onMessage(`Error updating name: ${result.message}`, "error");
      }
    } catch (error) {
      onMessage("Error updating name", "error");
    }
  };

  const handleEditCompany = () => {
    setEditingCompany(true);
    // Clear the field if it contains "missing value"
    const companyVal = contact.company || "";
    setCompanyValue(
      companyVal.toLowerCase() === "missing value" ? "" : companyVal
    );
  };

  const handleSaveCompany = async () => {
    try {
      const response = await fetch(
        `/api/contacts/${encodeURIComponent(contact.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company: companyValue }),
        },
      );

      const result = await response.json();

      if (result.success) {
        onUpdate({ ...contact, company: companyValue });
        setEditingCompany(false);
        onMessage(
          companyValue ? `Updated company to "${companyValue}"` : "Removed company",
          "success",
        );
      } else {
        onMessage(`Error updating company: ${result.message}`, "error");
      }
    } catch (error) {
      onMessage("Error updating company", "error");
    }
  };

  const handleEditPhone = (index: number) => {
    setEditingPhone(index);
    setPhoneValue(contact.phones?.[index]?.number || "");
  };

  const handleSavePhone = async (index: number) => {
    if (!phoneValue.trim()) {
      onMessage("Phone number cannot be empty", "error");
      return;
    }

    try {
      const response = await fetch(
        `/api/contacts/${encodeURIComponent(contact.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: phoneValue, phoneIndex: index }),
        },
      );

      const result = await response.json();

      if (result.success) {
        const updatedPhones = contact.phones ? [...contact.phones] : [];
        if (updatedPhones[index]) {
          updatedPhones[index] = { ...updatedPhones[index], number: phoneValue };
        }
        onUpdate({ ...contact, phones: updatedPhones });
        setEditingPhone(null);
        onMessage("Phone number updated", "success");
      } else {
        onMessage(`Error updating phone: ${result.message}`, "error");
      }
    } catch (error) {
      onMessage("Error updating phone", "error");
    }
  };

  const handleEditEmail = (index: number) => {
    setEditingEmail(index);
    setEmailValue(contact.emails?.[index]?.address || "");
  };

  const handleSaveEmail = async (index: number) => {
    if (!emailValue.trim()) {
      onMessage("Email address cannot be empty", "error");
      return;
    }

    try {
      const response = await fetch(
        `/api/contacts/${encodeURIComponent(contact.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailValue, emailIndex: index }),
        },
      );

      const result = await response.json();

      if (result.success) {
        const updatedEmails = contact.emails ? [...contact.emails] : [];
        if (updatedEmails[index]) {
          updatedEmails[index] = { ...updatedEmails[index], address: emailValue };
        }
        onUpdate({ ...contact, emails: updatedEmails });
        setEditingEmail(null);
        onMessage("Email address updated", "success");
      } else {
        onMessage(`Error updating email: ${result.message}`, "error");
      }
    } catch (error) {
      onMessage("Error updating email", "error");
    }
  };

  const handleDeletePhone = async (index: number) => {
    try {
      const response = await fetch(
        `/api/contacts/${encodeURIComponent(contact.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: "DELETE", phoneIndex: index }),
        },
      );

      const result = await response.json();

      if (result.success) {
        const updatedPhones = contact.phones ? [...contact.phones] : [];
        updatedPhones.splice(index, 1);
        onUpdate({ ...contact, phones: updatedPhones });
        onMessage("Phone number deleted", "success");
      } else {
        onMessage(`Error deleting phone: ${result.message}`, "error");
      }
    } catch (error) {
      onMessage("Error deleting phone", "error");
    }
  };

  const handleDeleteEmail = async (index: number) => {
    try {
      const response = await fetch(
        `/api/contacts/${encodeURIComponent(contact.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "DELETE", emailIndex: index }),
        },
      );

      const result = await response.json();

      if (result.success) {
        const updatedEmails = contact.emails ? [...contact.emails] : [];
        updatedEmails.splice(index, 1);
        onUpdate({ ...contact, emails: updatedEmails });
        onMessage("Email address deleted", "success");
      } else {
        onMessage(`Error deleting email: ${result.message}`, "error");
      }
    } catch (error) {
      onMessage("Error deleting email", "error");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      {/* Name */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b">
        <span className="text-xs font-semibold text-gray-500 uppercase w-20">Name</span>
        {editingName ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              className="text-lg text-gray-900 font-semibold border-2 border-blue-500 rounded px-3 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              autoFocus
              placeholder="Enter name"
            />
            <button
              onClick={handleSaveName}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Save
            </button>
            <button
              onClick={() => setEditingName(false)}
              className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 group">
            <span className="text-lg font-semibold text-gray-900">
              {contact.name}
            </span>
            <button
              onClick={handleEditName}
              className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 text-sm"
              title="Edit name"
            >
              ✏️
            </button>
          </div>
        )}
      </div>

      {/* Company */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b">
        <span className="text-xs font-semibold text-gray-500 uppercase w-20">Company</span>
        {editingCompany ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={companyValue}
              onChange={(e) => setCompanyValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveCompany()}
              className="text-base text-gray-900 border-2 border-blue-500 rounded px-3 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              autoFocus
              placeholder="Enter company name"
            />
            <button
              onClick={handleSaveCompany}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Save
            </button>
            <button
              onClick={() => setEditingCompany(false)}
              className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 group">
            {contact.company && contact.company.toLowerCase() !== "missing value" ? (
              <>
                <span className="text-base text-gray-900">{contact.company}</span>
                <button
                  onClick={handleEditCompany}
                  className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 text-sm"
                  title="Edit company"
                >
                  ✏️
                </button>
              </>
            ) : (
              <>
                <span className="text-base text-gray-400 italic">Missing</span>
                <button
                  onClick={handleEditCompany}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                >
                  + Add
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Phone Numbers */}
      <div className="mb-4 pb-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">Phones</span>
          {!addingPhone && (
            <button
              onClick={() => setAddingPhone(true)}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
            >
              + Add Phone
            </button>
          )}
        </div>
        {contact.phones && contact.phones.length > 0 ? (
          <div className="flex flex-col gap-2">
            {contact.phones.map((phone: Phone, index: number) => (
              <div key={index} className="flex items-center gap-2 group">
                <span className="text-xs text-gray-400 uppercase w-16 flex-shrink-0">
                  {phone.label}
                </span>
                {editingPhone === index ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="tel"
                      value={phoneValue}
                      onChange={(e) => setPhoneValue(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSavePhone(index)
                      }
                      className="text-base text-gray-900 border-2 border-blue-500 rounded px-3 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                      autoFocus
                      placeholder="Enter phone number"
                    />
                    <button
                      onClick={() => handleSavePhone(index)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingPhone(null)}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-base text-gray-900 flex-1">
                      {phone.number}
                    </span>
                    <button
                      onClick={() => handleEditPhone(index)}
                      className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 text-sm"
                      title="Edit phone"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeletePhone(index)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-sm"
                      title="Delete phone"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : !addingPhone ? (
          <span className="text-base text-gray-400 italic">Missing</span>
        ) : null}
        {addingPhone && (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="tel"
              value={phoneValue}
              onChange={(e) => setPhoneValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSavePhone(-1)}
              className="text-base text-gray-900 border-2 border-blue-500 rounded px-3 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              autoFocus
              placeholder="Enter phone number"
            />
            <button
              onClick={() => handleSavePhone(-1)}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Save
            </button>
            <button
              onClick={() => {
                setAddingPhone(false);
                setPhoneValue("");
              }}
              className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Email Addresses */}
      <div className="mb-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">Emails</span>
          {!addingEmail && (
            <button
              onClick={() => setAddingEmail(true)}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
            >
              + Add Email
            </button>
          )}
        </div>
        {contact.emails && contact.emails.length > 0 ? (
          <div className="flex flex-col gap-2">
            {contact.emails.map((email: Email, index: number) => (
              <div key={index} className="flex items-center gap-2 group">
                <span className="text-xs text-gray-400 uppercase w-16 flex-shrink-0">
                  {email.label}
                </span>
                {editingEmail === index ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="email"
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSaveEmail(index)
                      }
                      className="text-base text-gray-900 border-2 border-blue-500 rounded px-3 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                      autoFocus
                      placeholder="Enter email address"
                    />
                    <button
                      onClick={() => handleSaveEmail(index)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingEmail(null)}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-base text-gray-900 flex-1 break-all">
                      {email.address}
                    </span>
                    <button
                      onClick={() => handleEditEmail(index)}
                      className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 text-sm"
                      title="Edit email"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteEmail(index)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-sm"
                      title="Delete email"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : !addingEmail ? (
          <span className="text-base text-gray-400 italic">Missing</span>
        ) : null}
        {addingEmail && (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="email"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveEmail(-1)}
              className="text-base text-gray-900 border-2 border-blue-500 rounded px-3 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              autoFocus
              placeholder="Enter email address"
            />
            <button
              onClick={() => handleSaveEmail(-1)}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Save
            </button>
            <button
              onClick={() => {
                setAddingEmail(false);
                setEmailValue("");
              }}
              className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

