import { db } from "@/lib/db";
import { patientTable, visitsTable } from "@/lib/db/schema";
import { generate } from "@/lib/gemni_api/genAi";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const prompt_visits = `
  You are a medical report generator. Your task is to take the provided JSON data and transform it into a more detailed and well-structured sentence format while keeping the original schema intact. Follow these steps:

1. **Enhance the Data**:
   - Expand each field into a detailed sentence.
   - Use professional medical terminology.
   - Ensure the structure of the JSON remains the same (e.g., arrays stay as arrays, objects stay as objects).

2. **Example Transformation**:
   - Input: "disease": ["arthritis", "diabetes"]
   - Output: "disease": ["Diagnosed with chronic arthritis", "Diagnosed with type 2 diabetes"]

3. **Formatting**:
   - Use proper capitalization and punctuation.
   - Keep the JSON structure clean and readable.

4. **Output**:
   - Return the enhanced JSON data in the same schema but with detailed sentences.
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
      if (!visit.length) {
        return NextResponse.json(
          { error: "Visit not found." },
          { status: 404 }
        );
      }
      //   const visit_info = await generate(
      //     JSON.stringify(visit[0]),
      //     prompt_visits
      //   );

      return NextResponse.json(visit[0], { status: 200 });
    }
    const visits = await db
      .select({ id: visitsTable.id, date: visitsTable.createdAt })
      .from(visitsTable)
      .where(eq(visitsTable.patientId, patientId));
    return NextResponse.json(visits, { status: 200 });
  } catch (err) {
    console.log("An error occurred: ", err);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  }
}
