import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      if (!password) {
        return NextResponse.json({ error: "Password required" }, { status: 400 });
      }
      // Auto-register for prototype purposes. If email contains 'admin', make them ADMIN.
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          password, 
          role: email.toLowerCase().includes("admin") ? "ADMIN" : "USER"
        }
      });
    } else if (user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const response = NextResponse.json({ user });
    
    // Set cookies explicitly using the response
    response.cookies.set('user_id', user.id, { path: '/', httpOnly: false, sameSite: 'lax' });
    response.cookies.set('user_role', user.role, { path: '/', httpOnly: false, sameSite: 'lax' });
    
    console.log(`User logged in: ${user.email}, ID set in cookie: ${user.id}`);
    return response;
  } catch (error) {
    console.error("Login route error detailed:", error);
    return NextResponse.json({ error: "Internal server error: " + (error as Error).message }, { status: 500 });
  }
}
