import { db } from "@/lib/db";
import { patientTable } from "@/lib/db/schema";
// import { visitsTable } from "@/lib/db/schema";
// import { patientIn } from "@/lib/types";
import { generate } from "@/lib/gemni_api/genAi";
import { and, count, desc, eq, or, sql } from "drizzle-orm";
// import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

const prompt_info = `
  Extract the following personal information from the text in english in json format strictly:
  - medicalHistory(should be in json format can contain these fields(disease(array of string), active_med(array of string), BP, deficiencies(array of string)))
  - diagnosis 
  - prescriptions
  - precautions
  - condition
  - status
  - symptoms
  - extraPrescriptions

  Format:
  - diagnosis should be a JSON array containing multiple diagnoses if available.
  - prescriptions should be a JSON array containing details of prescribed medications if available in the format strictly([{nameofmedicine, frequency(options:- daily(default),weekly,monthly), dosage(represented by a number only), emptyStomach(options:- yes(default), no), duration(represented by a number only(1 default)), durationType(options: days,weeks(default),months)}]).
  - precautions should be a JSON array containing details of precautions if available.
  - If any information is not present, return [] for that field.
  - For condition you have to self evaluate the whole text and give a response in string, that what condition is person having as a problem(in few words(3-4)).
  - For status you have to self evaluate the whole text and give a response in string from these values namely(Active, Inactive, Discharged).
  - For symptoms you have to self evaluate the whole text and give a response in string for the symptoms and observation you think occur in patient from the given report from user(too necesssary to provide)
  - For extraPrescriptions scan for any left out additional prescriptions from the given report from user in a string(do not add something extra).

1. **Enhance the Data (except for condition, nameofmedicine, frequency, dosage, emptyStomach and status fields)**:
   - Expand each field into a detailed sentence EXCEPT for the "name" ,"gender", phone, email fields, which should remain untouched.
   - Use professional medical terminology.
   - Ensure the structure of the JSON remains the same (e.g., arrays stay as arrays, objects stay as objects).
   - Except BP all the fields in the medicalHistory should be an array from default no exceptions in that.
   - If some fields are empty or not present give a proper proper message for that field.

2. **Example Transformation**:
   - Input: "disease": ["arthritis", "diabetes"]
   - Output: "disease": ["Diagnosed with chronic arthritis", "Diagnosed with type 2 diabetes"]

3. **Formatting**:
   - Use proper capitalization and punctuation.
   - Keep the JSON structure clean and readable.

4. **Output**:
   - Return the enhanced JSON data in the same schema but with detailed sentences.
  If any information is not present, return null for that field.

5. **Note**:
   - If you find any words wrong please senitithe text before returning response like proper spelling (no mistakes) and proper formatting and punctuaution of the words.
   - Sanitizing the sentences is importnat so that it does display wrong medicines and other words.
   - If there is a typo in medicine name correct it.
   - Please do not hellucunate and apply it properly.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body?.text || !body?.doctorId) {
      return NextResponse.json(
        { error: "Please provide text/Doctor Id." },
        { status: 400 }
      );
    }

    const { name, age, gender, phone, email } = body;
    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    const patient_info = await generate(body.text, prompt_info);
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
            eq(patientTable.phone, phone),
            eq(sql`lower(${patientTable.name})`, name.toLowerCase()),
            eq(patientTable.doctorId, body.doctorId)
          ),
          and(
            eq(patientTable.email, email),
            eq(sql`lower(${patientTable.name})`, name.toLowerCase()),
            eq(patientTable.doctorId, body.doctorId)
          )
        )
      );

    if (ifPatientAvailable.length > 0) {
      await db
        .update(patientTable)
        .set({
          //   medicalHistory: patient_info.medicalHistory,
          lastVisit: new Date(),
        })
        .where(eq(patientTable.id, ifPatientAvailable[0]?.id));

      return NextResponse.json(
        {
          new_visit: {
            diagnosis: patient_info?.diagnosis,
            symptoms: patient_info?.symptoms,
            prescriptions: {
              prescribe_meds: patient_info?.prescriptions,
              precautions: patient_info?.precautions,
              extraPrescriptions: patient_info?.extraPrescriptions,
            },
            patientId: ifPatientAvailable[0]?.id,
          },
        },
        { status: 200 }
      );
    }

    const new_patient = await db
      .insert(patientTable)
      .values({
        name: name,
        age: age,
        gender: gender,
        phone: phone,
        email: email,
        medicalHistory: patient_info.medicalHistory,
        doctorId: body?.doctorId,
        lastVisit: new Date(),
        condition: patient_info?.condition,
        status: patient_info?.status,
      })
      .returning({
        id: patientTable.id,
        name: patientTable.name,
        status: patientTable.status,
        condition: patientTable.condition,
        age: patientTable.age,
        gender: patientTable.gender,
        lastVisit: patientTable.lastVisit,
      });

    return NextResponse.json(
      {
        new_patient: new_patient[0],
        new_visit: {
          diagnosis: patient_info?.diagnosis,
          sym_obs: patient_info?.sym_obs,
          prescriptions: {
            prescribe_meds: patient_info?.prescriptions,
            precautions: patient_info?.precautions,
            extraPrescriptions: patient_info?.extraPrescriptions,
          },
          patientId: new_patient[0]?.id,
        },
      },
      { status: 200 }
    );
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
    const doctorId = searchParams.get("doctorId");

    if (patientId) {
      const patient = await db
        .select()
        .from(patientTable)
        .where(eq(patientTable.id, patientId));

      if (patient.length > 0) {
        // const data = await generate(
        //   JSON.stringify(patient[0]),
        //   detailed_prompt
        // );
        return NextResponse.json(patient[0], { status: 200 });
      } else {
        return NextResponse.json(
          { error: "Patient not found." },
          { status: 404 }
        );
      }
    }

    if (!doctorId) {
      return NextResponse.json(
        { error: "Doctor id is required." },
        { status: 400 }
      );
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
      .where(eq(patientTable.doctorId, doctorId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(patientTable.lastVisit));

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
