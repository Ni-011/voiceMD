import { db } from "@/lib/db";
import { patientTable, visitsTable } from "@/lib/db/schema";
import { generate } from "@/lib/gemni_api/genAi";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const prompt_visits = `
  Extract the following visit information from the text in English in JSON format strictly:
  - diagnosis 
  - prescriptions
  - precautions

  Format:
  - diagnosis should be a JSON array containing multiple diagnoses if available.
  - prescriptions should be a JSON array containing details of prescribed medications if available in the format strictly({nameofmedicine:string, frequency:string}).
  - precautions should be a JSON array containing details of precautions if available.
  - If any information is not present, return [] for that field.
`;

export async function POST(req: NextRequest) {
  try {
    const { text, patientId } = await req.json();
    if (!text || !patientId) {
      return NextResponse.json(
        { error: "Text and patientId are required." },
        { status: 400 }
      );
    }
    const patient = await db
      .select()
      .from(patientTable)
      .where(eq(patientTable.id, patientId));

    if (!patient.length) {
      return NextResponse.json(
        { error: "Patient not found." },
        { status: 404 }
      );
    }
    const visit_info = await generate(text, prompt_visits);
    if (!visit_info) {
      return NextResponse.json(
        { error: "No visit information found." },
        { status: 404 }
      );
    }

    const new_visit = await db.insert(visitsTable).values({
      patientId: patientId,
      diagnosis: visit_info.diagnosis,
      prescriptions: visit_info.prescriptions,
      precautions: visit_info.precautions,
    });
    return NextResponse.json(new_visit, { status: 200 });
  } catch (err) {
    console.log("An error occurred: ", err);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId") as string;
    const visitId = searchParams.get("visitId") as string;
    if (!patientId) {
      return NextResponse.json(
        { error: "PatientId is required." },
        { status: 400 }
      );
    }
    if (visitId) {
      const visit = await db
        .select()
        .from(visitsTable)
        .where(
          and(eq(visitsTable.patientId, patientId), eq(visitsTable.id, visitId))
        );

      return NextResponse.json(visit, { status: 200 });
    }
    const visits = await db
      .select()
      .from(visitsTable)
      .where(eq(visitsTable.patientId, patientId));
    return NextResponse.json(visits, { status: 200 });
  } catch (err) {
    console.log("An error occurred: ", err);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  }
}
