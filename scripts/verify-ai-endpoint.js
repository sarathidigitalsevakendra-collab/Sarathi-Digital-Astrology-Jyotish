
// Run with: node scripts/verify-ai-endpoint.js
// Node 18+ has native fetch.

async function verifyAIEndpoint() {
  console.log("🚀 Starting AI Endpoint Verification...");

  const mockChartData = {
    ascendant: 120, 
    planets: [
      { name: "Sun", sign: "Aries", house: 9, nakshatra: "Ashwini", isRetro: false, dignity: "Exalted" },
      { name: "Moon", sign: "Taurus", house: 10, nakshatra: "Rohini", isRetro: false, dignity: "Exalted" }
    ]
  };

  try {
    const response = await fetch("http://localhost:3000/api/ai/interpret", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chartData: mockChartData,
        prompt: "Please analyze my chart."
      })
    });

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error("Response body:", text);
      return;
    }

    console.log("✅ API Connection Successful! Status:", response.status);
    console.log("📡 Streaming response below:\n");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    console.log("test");
    while (true) {
      console.log("Reading chunk...");
      const { done, value } = await reader.read();
      if (done) {
        console.log("Stream reader reported DONE.");
        break;
      }
      console.log(`Received chunk (${value.length} bytes)`);
      process.stdout.write(decoder.decode(value));
    }
    console.log("\n\n✅ Stream Completed");

  } catch (error) {
    console.error("❌ Request Failed:", error);
    if (error.cause) console.error("Cause:", error.cause);
  }
}

verifyAIEndpoint();
