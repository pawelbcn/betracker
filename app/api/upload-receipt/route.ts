import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type (images and PDFs)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images and PDFs are allowed.' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit.' }, { status: 400 });
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `receipt_${timestamp}_${randomString}.${extension}`;

    // Vercel serverless functions have read-only filesystem except /tmp
    // For production, we should use cloud storage, but for now use /tmp and return base64 or store URL differently
    const isVercel = process.env.VERCEL === '1';
    
    if (isVercel) {
      // On Vercel, use /tmp directory (only writable location)
      const tmpDir = '/tmp';
      const filepath = join(tmpDir, filename);
      await writeFile(filepath, buffer);
      
      // Return a data URL or note that file is in tmp (temporary)
      // For production, this should use Vercel Blob Storage
      console.warn('File saved to /tmp - this is temporary storage on Vercel. Consider using Vercel Blob Storage for production.');
      
      // For now, convert to base64 data URL as a workaround
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;
      
      return NextResponse.json({ 
        url: dataUrl,
        warning: 'File stored temporarily. For production, use cloud storage.',
        filename: filename
      }, { status: 200 });
    } else {
      // Local development - use public folder
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'receipts');
      if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true });
      }

      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);

      const receiptUrl = `/uploads/receipts/${filename}`;
      return NextResponse.json({ url: receiptUrl }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Error uploading file:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      syscall: error.syscall,
      path: error.path,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: 'Failed to upload file',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Check server logs for details'
    }, { status: 500 });
  }
}
