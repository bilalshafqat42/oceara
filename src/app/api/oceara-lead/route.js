export async function POST(request) {
  try {
    const body = await request.json();

    console.log("====================================");
    console.log("NEW OCEARA CHATBOT LEAD");
    console.log(body);
    console.log("====================================");

    return Response.json(
      {
        success: true,
        reference: `OCE-${Date.now()}`,
        message: "Lead received successfully.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Oceara lead API error:", error);

    return Response.json(
      {
        success: false,
        message: "Invalid lead submission.",
      },
      {
        status: 400,
      },
    );
  }
}
