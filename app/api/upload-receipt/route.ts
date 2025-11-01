import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
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
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `receipt_${timestamp}_${randomString}.${extension}`;

    // Check if we're on Vercel (use Blob Storage) or local (use filesystem)
    const isVercel = process.env.VERCEL === '1';
    
    if (isVercel) {
      // Use Vercel Blob Storage for production
      try {
        const blob = await put(`receipts/${filename}`, file, {
          access: 'public',
          contentType: file.type,
        });
        
        return NextResponse.json({ 
          url: blob.url,
          filename: filename
        }, { status: 200 });
      } catch (blobError: any) {
        console.error('Vercel Blob upload error:', blobError);
        // Fallback to base64 if Blob Storage fails (e.g., no BLOB_READ_WRITE_TOKEN set)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;
        
        console.warn('Falling back to base64 - set BLOB_READ_WRITE_TOKEN in Vercel for proper storage');
        return NextResponse.json({ 
          url: dataUrl,
          warning: 'Using base64 encoding. Set BLOB_READ_WRITE_TOKEN in Vercel for cloud storage.',
          filename: filename
        }, { status: 200 });
      }
    } else {
      // Local development - use public folder
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
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
