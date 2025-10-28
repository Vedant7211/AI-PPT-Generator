import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    // Debug: Check if API key exists
    console.log('API Key exists:', !!process.env.GOOGLE_API_KEY);
    console.log('API Key prefix:', process.env.GOOGLE_API_KEY?.substring(0, 10));
    
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' }, 
        { status: 500 }
      );
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

    const promptWithFormat = `You are a helpful AI assistant that generates content for PowerPoint slides. Based on the following prompt, generate a JSON object with a 'slides' array. Each object in the 'slides' array should have a 'title' (string) and 'content' (array of strings for bullet points). Ensure the response is a valid JSON string. Prompt: ${prompt}`;

    const result = await model.generateContent(promptWithFormat);
    const response = result.response;
    let text = response.text();

    // If the text is wrapped in markdown, extract the JSON part
    if (text.startsWith('```json')) {
      text = text.substring(7, text.lastIndexOf('```'));
    } else if (text.startsWith('```')) {
      text = text.substring(3, text.lastIndexOf('```'));
    }

    // Attempt to parse the text as JSON
    let slidesData;
    try {
      slidesData = JSON.parse(text);
    } catch (parseError) {
      console.error("Error parsing AI response as JSON:", parseError);
      return NextResponse.json({ error: "AI response was not a valid JSON format." }, { status: 500 });
    }

    return NextResponse.json({ slides: slidesData.slides });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' }, 
      { status: 500 }
    );
  }
}