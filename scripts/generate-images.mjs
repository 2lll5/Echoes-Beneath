import fs from "node:fs";
import path from "node:path";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY is required to generate GPT Image 2 assets.");
  process.exit(1);
}

const configPath = path.join(process.cwd(), "public", "art", "prompts.json");
const outputDir = path.join(process.cwd(), "public", "art");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
fs.mkdirSync(outputDir, { recursive: true });

for (const scene of config.scenes) {
  const outputPath = path.join(outputDir, `${scene.id}.png`);
  if (fs.existsSync(outputPath) && !process.env.FORCE_REGENERATE) {
    console.log(`Skip existing ${scene.id}`);
    continue;
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: config.model || "gpt-image-2",
      prompt: `${config.sharedStyle}\n\nScene: ${scene.prompt}`,
      size: config.size || "1536x1024",
      quality: config.quality || "high",
      output_format: "png"
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Image generation failed for ${scene.id}: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  const base64 = payload.data?.[0]?.b64_json || payload.data?.[0]?.b64;
  const imageUrl = payload.data?.[0]?.url;

  if (base64) {
    fs.writeFileSync(outputPath, Buffer.from(base64, "base64"));
  } else if (imageUrl) {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) throw new Error(`Could not download generated image for ${scene.id}`);
    fs.writeFileSync(outputPath, Buffer.from(await imageResponse.arrayBuffer()));
  } else {
    throw new Error(`No image payload returned for ${scene.id}`);
  }

  console.log(`Generated ${scene.id}`);
}
