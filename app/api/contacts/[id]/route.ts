import { exec } from "child_process";
import { promisify } from "util";
import { NextRequest, NextResponse } from "next/server";

const execAsync = promisify(exec);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: contactId } = await params;
    const { stdout } = await execAsync(
      `osascript delete_contact.scpt "${contactId}"`,
    );

    const result = stdout.trim();
    if (result.startsWith("Success")) {
      return NextResponse.json({ success: true, message: result });
    } else {
      return NextResponse.json(
        { success: false, message: result },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete contact" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: contactId } = await params;
    const body = await request.json();
    const { name, company, phone, phoneIndex, email, emailIndex } = body;

    let scriptArgs = `"${contactId}"`;
    scriptArgs +=
      name !== undefined ? ` "${name.replace(/"/g, '\\"')}"` : ` ""`;
    scriptArgs +=
      company !== undefined ? ` "${company.replace(/"/g, '\\"')}"` : ` ""`;
    scriptArgs +=
      phone !== undefined ? ` "${phone.replace(/"/g, '\\"')}"` : ` ""`;
    scriptArgs += phoneIndex !== undefined ? ` "${phoneIndex}"` : ` "0"`;
    scriptArgs +=
      email !== undefined ? ` "${email.replace(/"/g, '\\"')}"` : ` ""`;
    scriptArgs += emailIndex !== undefined ? ` "${emailIndex}"` : ` "0"`;

    const { stdout } = await execAsync(
      `osascript update_contact.scpt ${scriptArgs}`,
    );

    const result = stdout.trim();
    if (result.startsWith("Success")) {
      return NextResponse.json({ success: true, message: result });
    } else {
      return NextResponse.json(
        { success: false, message: result },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update contact" },
      { status: 500 },
    );
  }
}
