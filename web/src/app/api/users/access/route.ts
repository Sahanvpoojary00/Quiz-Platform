import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value;
    
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { userId, canWriteQuiz } = await req.json();
    
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { canWriteQuiz }
    });
    
    return NextResponse.json({ user: updated });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
