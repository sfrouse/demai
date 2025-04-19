import { OpenAI } from "openai";

export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(req: Request) {
  return new Response(JSON.stringify({ error: "No prompt found" }), {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    },
  });
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const prompt = formData.get("prompt") as string;
  if (!prompt) {
    return new Response(JSON.stringify({ error: "No prompt found" }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const imageRes = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "url",
    });

    // return Response.json({ imageUrl: response.data[0].url });

    const imageUrl = imageRes.data[0]?.url;
    if (!imageUrl) {
      throw new Error("Image URL is undefined");
    }
    const fileRes = await fetch(imageUrl);
    const arrayBuffer = await fileRes.arrayBuffer();

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Content-Type": "image/png",
        "Content-Disposition": 'inline; filename="image.png"',
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Image generation failed" }), {
      status: 500,
    });
  }
}
