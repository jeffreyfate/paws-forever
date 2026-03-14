import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');
  const token = request.nextUrl.searchParams.get('token');

  const res = await fetch(
    `https://photospicker.googleapis.com/v1/mediaItems?sessionId=${sessionId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  return NextResponse.json(data);
}