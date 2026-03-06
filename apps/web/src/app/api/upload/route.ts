import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { getUser } from '@/lib/auth-helpers';

// 5MB limit
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export async function POST(request: Request) {
  try {
    // 🛡️ Security: Require authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // 🛡️ Security: Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File too large' }, { status: 400 });
    }

    // 🛡️ Security: Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 🛡️ Security: Generate safe, random filename (prevent path traversal & XSS)
    const ext = path.extname(file.name).toLowerCase();
    // Re-verify extension based on MIME type to prevent extension spoofing
    const isSafeExt = ALLOWED_MIME_TYPES.some(type => {
      if (type === 'image/jpeg' && (ext === '.jpg' || ext === '.jpeg')) return true;
      if (type === 'image/png' && ext === '.png') return true;
      if (type === 'image/webp' && ext === '.webp') return true;
      if (type === 'application/pdf' && ext === '.pdf') return true;
      return false;
    });

    if (!isSafeExt) {
       return NextResponse.json({ success: false, error: 'Invalid file extension' }, { status: 400 });
    }

    const safeFilename = `${crypto.randomUUID()}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    const filepath = path.join(uploadDir, safeFilename);

    await writeFile(filepath, buffer);
    return NextResponse.json({ success: true, url: `/uploads/${safeFilename}` });
  } catch (error) {
    // 🛡️ Security: Log internally, but don't leak stack traces
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
