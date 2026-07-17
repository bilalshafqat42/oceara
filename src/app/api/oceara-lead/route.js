export async function POST(request) {
  try {
    const body = await request.json();

    console.log("====================================");
    console.log("NEW OCEARA LEAD");
    console.log(body);
    console.log("====================================");

    const webhookUrl = process.env.ZAPIER_OCEARA_LEAD_WEBHOOK;

    if (webhookUrl) {
      const zapierResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const zapierResult = await zapierResponse.json().catch(() => null);

      if (!zapierResponse.ok) {
        console.error(
          "Zapier webhook responded with status:",
          zapierResponse.status,
          zapierResult,
        );
      } else {
        console.log("Zapier webhook accepted the lead:", zapierResult);
      }
    } else {
      console.warn(
        "ZAPIER_OCEARA_LEAD_WEBHOOK is not set — lead was not forwarded.",
      );
    }

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
