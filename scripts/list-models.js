import https from 'https';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is not set.");
  console.error("Usage: GEMINI_API_KEY=your_api_key node scripts/list-models.js");
  process.exit(1);
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`API request failed: ${res.statusCode} ${res.statusMessage}`));
        }
      });
    }).on('error', reject);
  });
}

async function listModels() {
  try {
    console.log("Fetching available models from Google AI API...\n");
    
    // Use the REST API to list models
    const data = await httpsGet(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const models = data.models || [];
    
    console.log(`Found ${models.length} models:\n`);
    
    // Filter and display models
    const flashModels = [];
    const proModels = [];
    const otherModels = [];
    
    for (const model of models) {
      const info = {
        name: model.name,
        displayName: model.displayName,
        description: model.description,
        supportedGenerationMethods: model.supportedGenerationMethods || [],
      };
      
      if (model.name.includes('flash')) {
        flashModels.push(info);
      } else if (model.name.includes('pro')) {
        proModels.push(info);
      } else {
        otherModels.push(info);
      }
    }
    
    // Display Flash models (latest and fastest)
    if (flashModels.length > 0) {
      console.log("=== FLASH MODELS (Fast & Efficient) ===");
      flashModels.forEach(model => {
        console.log(`\nModel: ${model.name}`);
        console.log(`Display Name: ${model.displayName}`);
        console.log(`Description: ${model.description}`);
        console.log(`Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
      });
      console.log("\n");
    }
    
    // Display Pro models
    if (proModels.length > 0) {
      console.log("=== PRO MODELS ===");
      proModels.forEach(model => {
        console.log(`\nModel: ${model.name}`);
        console.log(`Display Name: ${model.displayName}`);
        console.log(`Description: ${model.description}`);
        console.log(`Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
      });
      console.log("\n");
    }
    
    // Display other models
    if (otherModels.length > 0) {
      console.log("=== OTHER MODELS ===");
      otherModels.forEach(model => {
        console.log(`\nModel: ${model.name}`);
        console.log(`Display Name: ${model.displayName}`);
        console.log(`Description: ${model.description}`);
        console.log(`Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
      });
    }
    
    // Recommendation
    console.log("\n=== RECOMMENDATION ===");
    if (flashModels.length > 0) {
      const latestFlash = flashModels[flashModels.length - 1];
      console.log(`For the chatbot, recommend using: ${latestFlash.name}`);
      console.log(`This is a flash model that offers fast responses with good quality.`);
    }
    console.log(`\nCurrent model in use: gemini-2.5-flash`);
    console.log(`This model provides the best balance of speed and quality for the chatbot.`);
    
  } catch (error) {
    console.error("Error listing models:", error.message);
    if (error.message.includes('API key')) {
      console.error("\nPlease ensure the API key is valid and has the necessary permissions.");
    }
  }
}

listModels();
