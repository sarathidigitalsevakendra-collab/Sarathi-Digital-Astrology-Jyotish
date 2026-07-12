
const fs = require('fs');
const path = require('path');

// Read .env.local manually since we are running via node directly
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const match = envContent.match(/GOOGLE_GENERATIVE_AI_API_KEY="([^"]+)"/);
const key = match ? match[1] : null;

if (!key) {
  console.error("❌ Key not found in .env.local");
  process.exit(1);
}

console.log("Using Key:", key.substring(0, 5) + "...");

async function listModels() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    if (data.models) {
        data.models.forEach(m => console.log(m.name));
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.error(e);
  }
}

listModels();
