const https = require('https');
const fs = require('fs');
const path = require('path');

// Try to load from .env.local or .env if present
const envPaths = ['.env.local', '.env'];
let apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  for (const envFile of envPaths) {
    const fullPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const match = content.match(/GROQ_API_KEY=(.*)/);
      if (match && match[1]) {
        apiKey = match[1].trim();
        break;
      }
    }
  }
}

if (!apiKey) {
  console.error("Error: GROQ_API_KEY environment variable is missing.");
  console.error("Make sure it is set in your .env or .env.local file, or pass it inline:");
  console.error("GROQ_API_KEY='your_api_key' node scripts/check-groq-models.js");
  process.exit(1);
}

const options = {
  hostname: 'api.groq.com',
  path: '/openai/v1/models',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
};

console.log('Fetching supported models from Groq API...\n');

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.data) {
        console.log("Supported Groq Models:");
        parsed.data.sort((a, b) => a.id.localeCompare(b.id)).forEach(model => {
          console.log(`- ${model.id} (Owner: ${model.owned_by})`);
        });
        console.log("\nRecommended model for general tasks: llama-3.3-70b-versatile");
      } else {
        console.error("Failed to parse models. API Response:", parsed);
      }
    } catch (e) {
      console.error("Error parsing response:", e);
    }
  });
});

req.on('error', (e) => console.error("Request failed:", e));
req.end();
