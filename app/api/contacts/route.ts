import { exec } from "child_process";
import { promisify } from "util";
import { NextRequest, NextResponse } from "next/server";

const execAsync = promisify(exec);

interface Phone {
  label: string;
  number: string;
}

interface Email {
  label: string;
  address: string;
}

interface Contact {
  name: string;
  id: string;
  phones: Phone[];
  emails: Email[];
  company: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get("start") || "1";
    const limit = searchParams.get("limit") || "100";

    const { stdout } = await execAsync(
      `osascript get_contacts.scpt ${start} ${limit}`,
    );

    const rawOutput = stdout.trim();
    const contacts: Contact[] = [];
    let totalCount = 0;

    if (rawOutput) {
      // Split by the unique delimiter |||
      const items = rawOutput.split("|||");

      if (items.length > 0) {
        totalCount = parseInt(items[0]) || 0;

        // Parse contacts starting from index 1
        // Format: totalCount|||name1|||id1|||phones1|||emails1|||company1|||name2|||id2|||phones2|||emails2|||company2|||...
        for (let i = 1; i < items.length; i += 5) {
          if (items[i] && items[i + 1]) {
            const phoneData = items[i + 2] ? items[i + 2].trim() : "";
            const emailData = items[i + 3] ? items[i + 3].trim() : "";
            const companyData = items[i + 4] ? items[i + 4].trim() : "";

            // Parse phones
            const phones: Phone[] = [];
            if (phoneData) {
              const phonePairs = phoneData.split(";");
              for (const pair of phonePairs) {
                const [label, number] = pair.split(":");
                if (number) {
                  phones.push({
                    label: label ? label.trim() : "phone",
                    number: number.trim(),
                  });
                }
              }
            }

            // Parse emails
            const emails: Email[] = [];
            if (emailData) {
              const emailPairs = emailData.split(";");
              for (const pair of emailPairs) {
                const [label, address] = pair.split(":");
                if (address) {
                  emails.push({
                    label: label ? label.trim() : "email",
                    address: address.trim(),
                  });
                }
              }
            }

            contacts.push({
              name: items[i].trim(),
              id: items[i + 1].trim(),
              phones,
              emails,
              company: companyData,
            });
          }
        }
      }
    }

    return NextResponse.json({
      contacts,
      totalCount,
      start: parseInt(start),
      limit: parseInt(limit),
      hasMore: parseInt(start) + contacts.length < totalCount,
    });
  } catch (error) {
    console.error("Error getting contacts:", error);
    return NextResponse.json(
      { error: "Failed to get contacts" },
      { status: 500 },
    );
  }
}
