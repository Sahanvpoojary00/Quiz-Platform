import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { question_id, answer, time_taken } = await req.json();
    
    const question = await prisma.question.findUnique({ where: { id: question_id } });
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    let isCorrect = false;
    let finalScore = 0;
    
    if (question.type === 'CODING') {
      // Call external executor
      const executorUrl = process.env.EXECUTOR_URL || 'http://localhost:8000/run-code';
      const executionReq = await fetch(executorUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: answer, language: 'python' })
      });
      
      const executionRes = await executionReq.json();
      const output = executionRes.output?.trim();
      
      // Compare output to expected test case answer
      if (executionRes.returncode === 0 && output === question.test_cases?.trim()) {
        isCorrect = true;
      }
    } else {
      if (question.answer === answer) {
        isCorrect = true;
      }
    }
    
    if (isCorrect) finalScore = question.marks; // Use marks from question definition

    const submission = await prisma.submission.create({
      data: {
        user_id: userId,
        question_id,
        answer,
        score: finalScore,
        time_taken
      }
    });

    if (isCorrect) {
      await prisma.user.update({
        where: { id: userId },
        data: { score: { increment: finalScore } }
      });
    }

    return NextResponse.json({ submission, isCorrect });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
