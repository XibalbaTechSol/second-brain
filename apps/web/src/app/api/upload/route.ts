import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getUser } from '@/lib/auth-helpers';
import crypto from 'crypto';

// Security configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
]);

const MIME_TYPE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
  'text/plain': '.txt',
};

export async function POST(request: Request) {
  // 1. Authentication Check
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
  }

  // 2. File Size Validation
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ success: false, error: 'File size exceeds 5MB limit' }, { status: 400 });
  }

  // 3. File Type Validation
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Save to public/uploads
  // Note: In production, use S3 or Blob Storage
  const extension = MIME_TYPE_EXTENSIONS[file.type] || '';
  const filename = `${crypto.randomUUID()}${extension}`;
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  const filepath = path.join(uploadDir, filename);
  
  try {
    // 4. Directory Check
    await mkdir(uploadDir, { recursive: true });

    await writeFile(filepath, buffer);
    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
