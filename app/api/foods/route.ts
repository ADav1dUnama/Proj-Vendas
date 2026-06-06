import { NextResponse } from 'next/server';
import { getDb, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const db = await getDb();
  const docs = await db.collection('foods').find().sort({ display_order: 1 }).toArray();
  return NextResponse.json(docs.map(normalizeDocument));
}

export async function POST(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  try {
    const { name, price, image_url, display_order } = await request.json();
    if (!name || typeof price !== 'number' || display_order === undefined) {
      return NextResponse.json({ message: 'Dados inválidos do produto.' }, { status: 400 });
    }
    const db = await getDb();
    const result = await db.collection('foods').insertOne({
      name, price, image_url: image_url || null, display_order, created_at: new Date().toISOString()
    });
    const doc = await db.collection('foods').findOne({ _id: result.insertedId });
    return NextResponse.json(normalizeDocument(doc), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
