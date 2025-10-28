import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${uuidv4()}.pptx`;
    const publicDirPath = path.join(process.cwd(), 'public', 'temp_pptx');
    const filePath = path.join(publicDirPath, filename);

    // Ensure the directory exists
    await require('fs/promises').mkdir(publicDirPath, { recursive: true });

    await writeFile(filePath, buffer);

    const publicUrl = `/temp_pptx/${filename}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('Error uploading PPTX:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload PPTX' },
      { status: 500 }
    );
  }
}

