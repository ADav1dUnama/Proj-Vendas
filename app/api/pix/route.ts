import { NextResponse } from 'next/server';
import { getDb, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const db = await getDb();
  const docs = await db.collection('pix_config').find().sort({ updated_at: -1 }).limit(1).toArray();
  return NextResponse.json(docs.length > 0 ? normalizeDocument(docs[0]) : null);
}

export async function POST(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  try {
    const { pixKey, merchantName } = await request.json();
    if (!pixKey || !merchantName) return NextResponse.json({ message: 'Dados inválidos do PIX.' }, { status: 400 });
    
    const db = await getDb();
    const result = await db.collection('pix_config').insertOne({
      pix_key: pixKey, merchant_name: merchantName, updated_at: new Date().toISOString()
    });
    const doc = await db.collection('pix_config').findOne({ _id: result.insertedId });
    return NextResponse.json(normalizeDocument(doc), { status: 201 });
  } catch (error) { return NextResponse.json({ message: 'Erro interno' }, { status: 500 }); }
}
