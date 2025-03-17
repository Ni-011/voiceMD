import { db } from "@/lib/db";
import { patientTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, status } = body;

    if (!patientId || !status) {
      return NextResponse.json(
        { error: "Patient ID and status are required." },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["Active", "Inactive", "Discharged"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status. Must be one of: Active, Inactive, Discharged",
        },
        { status: 400 }
      );
    }

    // Update the patient
    const result = await db
      .update(patientTable)
      .set({
        status,
      })
      .where(eq(patientTable.id, patientId))
      .returning({
        id: patientTable.id,
        name: patientTable.name,
        status: patientTable.status,
      });

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Patient not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Patient status updated successfully",
      patient: result[0],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Request failed, please try again." },
      { status: 500 }
    );
  }
}
