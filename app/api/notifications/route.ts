import { NextResponse } from 'next/server';
import { getDb, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  const userId = authenticate(request);
  if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const db = await getDb();
  const docs = await db.collection('notifications').find({ user_id: userId }).sort({ created_at: -1 }).toArray();
  return NextResponse.json(docs.map(normalizeDocument));
}

export async function POST(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  try {
    const { user_id, title, message } = await request.json();
    if (!user_id || !title || !message) return NextResponse.json({ message: 'Dados de notificação são obrigatórios.' }, { status: 400 });
    const db = await getDb();
    const result = await db.collection('notifications').insertOne({ user_id, title, message, read: false, created_at: new Date().toISOString() });
    const doc = await db.collection('notifications').findOne({ _id: result.insertedId });
    return NextResponse.json(normalizeDocument(doc), { status: 201 });
  } catch (error) { return NextResponse.json({ message: 'Erro interno' }, { status: 500 }); }
}
