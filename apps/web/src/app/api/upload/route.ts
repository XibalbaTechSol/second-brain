import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { getUser } from '@/lib/auth-helpers';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(request: Request) {
  // Security: Authentication check
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
  }

  // Security: File size validation
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ success: false, error: 'File size exceeds limit' }, { status: 400 });
  }

  // Security: File type validation
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Save to public/uploads
  // Note: In production, use S3 or Blob Storage
  const filename = `${Date.now()}-${user.id}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  const filepath = path.join(uploadDir, filename);
  
  try {
    await writeFile(filepath, buffer);
    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error('Upload error:', error);
    // Security: Do not leak error details
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
