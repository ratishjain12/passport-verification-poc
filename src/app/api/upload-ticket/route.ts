import { NextResponse } from "next/server";
import { OpenAI } from "openai";

// Initialize OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use environment variable for security
});

// Function to extract flight ticket details
async function extractFlightTicketDetails(ticketBase64: string): Promise<{
  passengerName: string;
  flightNumber: string;
  departure: string;
  arrival: string;
}> {
  const aiResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an AI that extracts flight ticket details from images. Always return the extracted details in the following format:
                  Extract the following details:  
                  - **Passenger Name**  
                  - **Flight Number**  
                  - **Departure Airport / City**  
                  - **Arrival Airport / City**  

                  ### **Response format:**  
                  \`\`\`json  
                  {
                    "passengerName": "John Doe",
                    "flightNumber": "AI101",
                    "departure": "New York (JFK)",
                    "arrival": "London (LHR)"
                  }  
                  \`\`\`  

                  Return **only** this JSON and nothing else.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract details from this flight ticket image.",
          },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${ticketBase64}` },
          },
        ],
      },
    ],
  });

  const aiResponseText = aiResponse.choices[0]?.message?.content || "";
  console.log("🛫 Raw AI Response:", aiResponseText);

  // Ensure JSON format is clean and parse correctly
  let cleanedResponse = aiResponseText.replace(/```json|```/g, "").trim();
  cleanedResponse = cleanedResponse.replace(/^json\s*/, "").trim();

  if (!cleanedResponse.startsWith("{")) {
    throw new Error("Invalid JSON format: Expected JSON object.");
  }

  return JSON.parse(cleanedResponse);
}

// API Route Handler
export async function POST(req: Request) {
  try {
    // ✅ Extract form data
    const formData = await req.formData();
    const ticketImage = formData.get("ticketImage") as File;
    const passportDetails = JSON.parse(
      formData.get("passportDetails") as string
    );

    if (!ticketImage) {
      return NextResponse.json(
        { success: false, error: "No flight ticket image provided." },
        { status: 400 }
      );
    }

    // ✅ Read file as buffer and convert to base64
    const ticketBuffer = Buffer.from(await ticketImage.arrayBuffer());
    const ticketBase64 = ticketBuffer.toString("base64");

    // ✅ Extract ticket details using OpenAI GPT-4o
    const extractedData = await extractFlightTicketDetails(ticketBase64);
    console.log("🛫 Extracted Ticket Details:", extractedData);

    if (!extractedData.passengerName) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not extract passenger name from flight ticket.",
        },
        { status: 400 }
      );
    }

    // ✅ Validate extracted name with passport name
    const passportName = passportDetails.name.toLowerCase();
    const extractedName = extractedData.passengerName.toLowerCase(); // Fix here

    const nameMatch = passportName
      .split(" ")
      .every((part: string) => extractedName.includes(part));

    if (!nameMatch) {
      return NextResponse.json(
        {
          success: false,
          error: "Passenger name does not match passport details.",
        },
        { status: 400 }
      );
    }

    // ✅ If validation passes
    return NextResponse.json({
      success: true,
      message: "Flight ticket successfully verified.",
      ticketDetails: extractedData,
    });
  } catch (error) {
    console.error("❌ Processing Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to verify flight ticket, please ensure you uploading correct image of the ticket.",
      },
      { status: 500 }
    );
  }
}
