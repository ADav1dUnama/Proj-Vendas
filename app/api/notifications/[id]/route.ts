import { NextResponse } from 'next/server';
import { getDb, normalizeDocument, toObjectId } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  try {
    const { read } = await request.json();
    const db = await getDb();
    const result = await db.collection('notifications').findOneAndUpdate(
      { _id: toObjectId(id), user_id: userId }, { $set: { read: Boolean(read) } }, { returnDocument: 'after' }
    );
    if (!result) return NextResponse.json({ message: 'Notificação não encontrada.' }, { status: 404 });
    return NextResponse.json(normalizeDocument(result));
  } catch (error) { return NextResponse.json({ message: 'Erro interno' }, { status: 500 }); }
}
