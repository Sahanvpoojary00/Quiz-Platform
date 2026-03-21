import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value;
    
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const users = await prisma.user.findMany({
      where: { 
        role: 'USER',
        qualified: true,
        isEliminated: false
      }
    });
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Qualified users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
