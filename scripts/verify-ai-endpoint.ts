
// @ts-nocheck
const fetch = require('node-fetch');

// If you are using Node 18+, fetch is native. 
// If running with ts-node, we might need to rely on native fetch or install node-fetch.
// Let's assume standard fetch is available or use a simple http request.

async function verifyAIEndpoint() {
  console.log("🚀 Starting AI Endpoint Verification...");

  const mockChartData = {
    ascendant: 120, // Leo rising (approx)
    planets: [
      { name: "Sun", sign: "Aries", house: 9, nakshatra: "Ashwini", isRetro: false, dignity: "Exalted" },
      { name: "Moon", sign: "Taurus", house: 10, nakshatra: "Rohini", isRetro: false, dignity: "Exalted" },
      { name: "Jupiter", sign: "Cancer", house: 12, nakshatra: "Pushya", isRetro: false, dignity: "Exalted" }
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
        prompt: "Please analyze my chart focusing on career."
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

    // Handle stream
    const reader = response.body; 
    // In Node 18+ native fetch, response.body is a ReadableStream. 
    // If we use 'node-fetch', it is a Node stream.
    if (reader && typeof reader.on === 'function') {
        // Node stream
        reader.on('data', (chunk) => {
            process.stdout.write(chunk.toString());
        });
        reader.on('end', () => console.log("\n\n✅ Stream Completed"));
    } else if (reader && reader.getReader) {
        // Web stream
        const webReader = reader.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await webReader.read();
            if (done) break;
            process.stdout.write(decoder.decode(value));
        }
        console.log("\n\n✅ Stream Completed");
    } else {
        // Fallback text
        const text = await response.text();
        console.log(text);
    }

  } catch (error) {
    console.error("❌ Request Failed:", error);
  }
}

verifyAIEndpoint();
