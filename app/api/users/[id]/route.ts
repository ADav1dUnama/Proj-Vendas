import { NextResponse } from 'next/server';
import { getDb, normalizeDocument, toObjectId } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  const db = await getDb();
  const user = await db.collection('users').findOne({ _id: toObjectId(id) });
  if (!user) return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
  return NextResponse.json(normalizeDocument(user));
}
