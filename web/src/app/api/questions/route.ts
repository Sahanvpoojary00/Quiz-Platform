import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const round = searchParams.get('round');
    
    const where = round ? { round: parseInt(round) } : {};
    const questions = await prisma.question.findMany({ where });
    
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value;
    
    if (userRole === 'ADMIN') {
      return NextResponse.json({ questions });
    }
    
    const sanitizedQuestions = questions.map((q: any) => ({
      id: q.id,
      type: q.type,
      content: q.content,
      options: q.options,
      marks: q.marks,
      time_limit: q.time_limit,
      round: q.round
    }));
    
    return NextResponse.json({ questions: sanitizedQuestions });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value;
    if (userRole !== 'ADMIN') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { type, content, options, answer, test_cases, marks, time_limit, round } = body;
    const newQuestion = await prisma.question.create({
      data: { type, content, options, answer, test_cases, marks, time_limit, round: round ? parseInt(round) : null }
    });
    return NextResponse.json({ question: newQuestion });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value;
    if (userRole !== 'ADMIN') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, type, content, options, answer, test_cases, marks, time_limit, round } = body;
    
    const updated = await prisma.question.update({
      where: { id },
      data: { type, content, options, answer, test_cases, marks, time_limit, round: round ? parseInt(round) : null }
    });
    
    return NextResponse.json({ question: updated });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value;
    if (userRole !== 'ADMIN') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    await prisma.question.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
