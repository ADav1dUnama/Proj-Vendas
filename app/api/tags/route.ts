import { NextResponse } from 'next/server';
import { getDb, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const db = await getDb();
  const docs = await db.collection('tags').find().sort({ name: 1 }).toArray();
  return NextResponse.json(docs.map(normalizeDocument));
}

export async function POST(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  try {
    const { name } = await request.json();
    if (!name) return NextResponse.json({ message: 'Nome da tag é obrigatório.' }, { status: 400 });
    const db = await getDb();
    const result = await db.collection('tags').insertOne({ name, created_at: new Date().toISOString() });
    const doc = await db.collection('tags').findOne({ _id: result.insertedId });
    return NextResponse.json(normalizeDocument(doc), { status: 201 });
  } catch (error) { return NextResponse.json({ message: 'Erro interno' }, { status: 500 }); }
}
