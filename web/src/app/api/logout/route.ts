import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear cookies by setting maxAge to 0
  response.cookies.set('user_id', '', { path: '/', maxAge: 0 });
  response.cookies.set('user_role', '', { path: '/', maxAge: 0 });
  
  return response;
}
