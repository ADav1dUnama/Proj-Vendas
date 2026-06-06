import { NextResponse } from 'next/server';
import { getDb, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const db = await getDb();
  const url = new URL(request.url);
  const filter: any = {};
  if (url.searchParams.get('event_id')) filter.event_id = url.searchParams.get('event_id');
  const docs = await db.collection('comments').find(filter).sort({ created_at: -1 }).toArray();
  return NextResponse.json(docs.map(normalizeDocument));
}

export async function POST(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  try {
    const { event_id, user_id, content } = await request.json();
    if (!event_id || !user_id || !content) return NextResponse.json({ message: 'Dados do comentário são obrigatórios.' }, { status: 400 });
    const db = await getDb();
    const result = await db.collection('comments').insertOne({ event_id, user_id, content, created_at: new Date().toISOString() });
    const doc = await db.collection('comments').findOne({ _id: result.insertedId });
    return NextResponse.json(normalizeDocument(doc), { status: 201 });
  } catch (error) { return NextResponse.json({ message: 'Erro interno' }, { status: 500 }); }
}
