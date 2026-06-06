import { NextResponse } from 'next/server';
import { getDb, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const db = await getDb();
  const docs = await db.collection('sales').find().sort({ created_at: -1 }).toArray();
  return NextResponse.json(docs.map(normalizeDocument));
}

export async function POST(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  try {
    const { food_id, payment_method } = await request.json();
    if (!food_id || !payment_method) return NextResponse.json({ message: 'Dados inválidos da venda.' }, { status: 400 });
    
    const db = await getDb();
    const result = await db.collection('sales').insertOne({
      food_id, payment_method, created_at: new Date().toISOString()
    });
    const doc = await db.collection('sales').findOne({ _id: result.insertedId });
    return NextResponse.json(normalizeDocument(doc), { status: 201 });
  } catch (error) { return NextResponse.json({ message: 'Erro interno' }, { status: 500 }); }
}
