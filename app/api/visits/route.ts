import { db } from "@/lib/db";
import { patientTable, visitsTable } from "@/lib/db/schema";
// import { generate } from "@/lib/gemni_api/genAi";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Comment out or remove unused variable
// const prompt_visits = `
//   You are a medical report generator. Your task is to take the provided JSON data and transform it into a more detailed and well-structured sentence format while keeping the original schema intact. Follow these steps:
//
// 1. **Enhance the Data**:
//    - Expand each field into a detailed sentence.
//    - Use professional medical terminology.
//    - Ensure the structure of the JSON remains the same (e.g., arrays stay as arrays, objects stay as objects).
//
// 2. **Example Transformation**:
//    - Input: "disease": ["arthritis", "diabetes"]
//    - Output: "disease": ["Diagnosed with chronic arthritis", "Diagnosed with type 2 diabetes"]
//
// 3. **Formatting**:
//    - Use proper capitalization and punctuation.
//    - Keep the JSON structure clean and readable.
//
// 4. **Output**:
//    - Return the enhanced JSON data in the same schema but with detailed sentences.
// `;

export async function POST(req: NextRequest) {
  try {
    // Clone the request to read it twice (once for logging)
    const reqClone = req.clone();

    // Parse the request body
    const requestBody = await req.json();

    // Handle both old and new formats
    // In the old format, precautions and prescribe_meds are at the top level
    // In the new format, they're nested inside a prescriptions object
    const {
      diagnosis,
      precautions: topLevelPrecautions,
      prescribe_meds: topLevelMeds,
      patientId,
      visitId,
      extraPrescriptions: topLevelExtraPrescriptions,
      prescriptions,
    } = requestBody;

    // Log entire request for debugging
    console.log("Complete request body:", await reqClone.text());

    // Ensure we have arrays even if they're not provided, handling both formats
    const safeData = {
      diagnosis: Array.isArray(diagnosis) ? diagnosis : [],
      precautions: Array.isArray(prescriptions?.precautions)
        ? prescriptions.precautions
        : Array.isArray(topLevelPrecautions)
        ? topLevelPrecautions
        : [],
      prescribe_meds: Array.isArray(prescriptions?.prescribe_meds)
        ? prescriptions.prescribe_meds
        : Array.isArray(topLevelMeds)
        ? topLevelMeds
        : [],
      patientId,
      visitId,
      extraPrescriptions:
        prescriptions?.extraPrescriptions || topLevelExtraPrescriptions || "",
    };

    console.log("Received POST request with sanitized data:", {
      patientId: safeData.patientId,
      visitId: safeData.visitId,
      diagnosisCount: safeData.diagnosis.length,
      precautionsCount: safeData.precautions.length,
      medicationsCount: safeData.prescribe_meds.length,
    });

    if (safeData.visitId) {
      console.log("Updating existing visit:", safeData.visitId);

      const visit = await db
        .update(visitsTable)
        .set({
          diagnosis: safeData.diagnosis,
          prescriptions: {
            prescribe_meds: safeData.prescribe_meds,
            precautions: safeData.precautions,
            extraPrescriptions: safeData.extraPrescriptions,
          },
        })
        .where(eq(visitsTable.id, safeData.visitId));

      return NextResponse.json(
        { message: "data updated successfully", visit },
        { status: 200 }
      );
    }
    if (!safeData.patientId) {
      console.error("Missing patientId in request");
      return NextResponse.json(
        { error: "PatientId is required." },
        { status: 400 }
      );
    }

    console.log("Checking if patient exists:", safeData.patientId);
    const patient = await db
      .select()
      .from(patientTable)
      .where(eq(patientTable.id, safeData.patientId));

    if (!patient.length) {
      console.error("Patient not found:", safeData.patientId);
      return NextResponse.json(
        { error: "Patient not found." },
        { status: 404 }
      );
    }

    console.log("Creating new visit for patient:", safeData.patientId);
    const new_visit = await db.insert(visitsTable).values({
      patientId: safeData.patientId,
      diagnosis: safeData.diagnosis,
      prescriptions: {
        prescribe_meds: safeData.prescribe_meds,
        precautions: safeData.precautions,
        extraPrescriptions: safeData.extraPrescriptions,
      },
    });

    console.log("Visit created successfully");
    return NextResponse.json(new_visit, { status: 200 });
  } catch (err) {
    console.error("Error in /api/visits POST:", err);
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
      .where(eq(visitsTable.patientId, patientId))
      .orderBy(desc(visitsTable.createdAt));
    return NextResponse.json(visits, { status: 200 });
  } catch (err) {
    console.log("An error occurred: ", err);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  }
}
