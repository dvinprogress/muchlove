import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check for API key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('GROQ_API_KEY is not set in environment variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error: Missing API key' },
        { status: 500 }
      );
    }

    // Parse FormData
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const language = formData.get('language') as string | null;

    // Validate audio file
    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Check file size
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size exceeds 25MB limit (${(audioFile.size / 1024 / 1024).toFixed(2)}MB)` },
        { status: 400 }
      );
    }

    // Prepare FormData for Groq API
    const groqFormData = new FormData();
    groqFormData.append('file', audioFile);
    groqFormData.append('model', 'whisper-large-v3-turbo');
    groqFormData.append('response_format', 'json');

    if (language) {
      groqFormData.append('language', language);
    }

    // Call Groq API
    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: groqFormData,
    });

    // Handle Groq API errors
    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', {
        status: groqResponse.status,
        statusText: groqResponse.statusText,
        error: errorText,
      });

      return NextResponse.json(
        {
          success: false,
          error: `Transcription service error: ${groqResponse.status} ${groqResponse.statusText}`
        },
        { status: groqResponse.status }
      );
    }

    // Parse successful response
    const result = await groqResponse.json() as { text: string };

    if (!result.text) {
      console.error('Groq API returned empty transcription');
      return NextResponse.json(
        { success: false, error: 'Empty transcription received' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transcription: result.text,
    });

  } catch (error) {
    console.error('Transcription error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during transcription'
      },
      { status: 500 }
    );
  }
}
