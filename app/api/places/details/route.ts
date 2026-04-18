import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  await requireSession();
  const { placeId, sessionToken } = await req.json();
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  if (!key || !placeId) return NextResponse.json({ address: '' });

  try {
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'formattedAddress,displayName',
        ...(sessionToken ? { 'X-Goog-SessionToken': sessionToken } : {}),
      },
    });
    if (!res.ok) return NextResponse.json({ address: '' });
    const json = await res.json();
    return NextResponse.json({
      address: json.formattedAddress || '',
      name: json.displayName?.text || '',
    });
  } catch {
    return NextResponse.json({ address: '' });
  }
}
