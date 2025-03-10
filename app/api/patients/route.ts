import { db } from "@/lib/db";
import { patientTable } from "@/lib/db/schema";
import { generate, patientIn } from "@/lib/gemni_api/genAi";
import { and, count, eq, or } from "drizzle-orm";
// import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

const prompt_info = `
  Extract the following personal information from the text in english in json format strictly:
  - name
  - age
  - gender
  - phone
  - email
  - medicalHistory(should be in json format can contain these fields(disease(array of string), active_med(array of string), BP, deficiencies(array of string)))

  If any information is not present, return null for that field.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // ✅ Correct way to get JSON body in App Router

    if (!body?.text || !body?.doctorId) {
      return NextResponse.json(
        { error: "Please provide text/Doctor Id." },
        { status: 400 }
      );
    }

    const patient_info: patientIn = await generate(body.text, prompt_info);
    if (!patient_info) {
      return NextResponse.json(
        { error: "No patient information found." },
        { status: 404 }
      );
    }

    const ifPatientAvailable = await db
      .select()
      .from(patientTable)
      .where(
        or(
          and(
            eq(patientTable.phone, patient_info?.phone),
            eq(patientTable.name, patient_info.name)
          ),
          and(
            eq(patientTable.email, patient_info?.email),
            eq(patientTable.name, patient_info.name)
          )
        )
      );

    if (ifPatientAvailable.length > 0) {
      return NextResponse.json(
        { error: "Patient already exists." },
        { status: 409 }
      );
    }

    const new_patient = await db
      .insert(patientTable)
      .values({
        name: patient_info.name,
        age: patient_info.age,
        gender: patient_info.gender,
        phone: patient_info.phone,
        email: patient_info.email,
        medicalHistory: patient_info.medicalHistory,
        doctorId: body?.doctorId,
      })
      .returning();

    return NextResponse.json(new_patient, { status: 200 }); // ✅ Correct response format
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Request failed, please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    if (patientId) {
      const patient = await db
        .select()
        .from(patientTable)
        .where(eq(patientTable.id, patientId));

      if (patient.length > 0) {
        return NextResponse.json(patient[0], { status: 200 });
      } else {
        return NextResponse.json(
          { error: "Patient not found." },
          { status: 404 }
        );
      }
    }

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const totalPatients = await db
      .select({ count: count() })
      .from(patientTable);
    const totalRecords = totalPatients[0]?.count || 0;

    const patients = await db
      .select()
      .from(patientTable)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      data: patients,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Request failed, please try again." },
      { status: 500 }
    );
  }
}
