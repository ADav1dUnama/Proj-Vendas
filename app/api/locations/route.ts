import { NextResponse } from 'next/server';
import { getDb, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const db = await getDb();
  const docs = await db.collection('locations').find().sort({ name: 1 }).toArray();
  return NextResponse.json(docs.map(normalizeDocument));
}

export async function POST(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  try {
    const { name, address, city, state, zip_code } = await request.json();
    if (!name || !address || !city || !state || !zip_code) return NextResponse.json({ message: 'Dados completos do local são obrigatórios.' }, { status: 400 });
    const db = await getDb();
    const result = await db.collection('locations').insertOne({ name, address, city, state, zip_code, created_at: new Date().toISOString() });
    const doc = await db.collection('locations').findOne({ _id: result.insertedId });
    return NextResponse.json(normalizeDocument(doc), { status: 201 });
  } catch (error) { return NextResponse.json({ message: 'Erro interno' }, { status: 500 }); }
}
