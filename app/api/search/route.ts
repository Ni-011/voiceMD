import { db } from "@/lib/db";
import { patientTable } from "@/lib/db/schema";
import { and, eq, ilike } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") as string;
    const doctorId = searchParams.get("doctorId") as string;
    if (!name || !doctorId) {
      return NextResponse.json(
        { error: "Name and patientId are required" },
        { status: 400 }
      );
    }
    console.log(name);

    const patient = await db
      .select()
      .from(patientTable)
      .where(
        and(
          ilike(patientTable.name, `%${name}%`), // Partial case-insensitive match
          eq(patientTable.doctorId, doctorId) // Assuming doctorId is a column
        )
      );
    console.log(patient);

    return NextResponse.json(patient, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
