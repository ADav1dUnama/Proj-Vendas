import { NextResponse } from 'next/server';
import { getDb, normalizeDocument, toObjectId } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const db = await getDb();
  const docs = await db.collection('organizers').find().toArray();
  return NextResponse.json(docs.map(normalizeDocument));
}

export async function POST(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  try {
    const { user_id, organization_name, bio, website } = await request.json();
    if (!user_id) return NextResponse.json({ message: 'user_id do organizador é obrigatório.' }, { status: 400 });
    const db = await getDb();
    const user = await db.collection('users').findOne({ _id: toObjectId(user_id) });
    if (!user) return NextResponse.json({ message: 'Usuário não encontrado para organizador.' }, { status: 404 });
    const result = await db.collection('organizers').insertOne({ user_id, organization_name: organization_name || '', bio: bio || '', website: website || '', created_at: new Date().toISOString() });
    const doc = await db.collection('organizers').findOne({ _id: result.insertedId });
    return NextResponse.json(normalizeDocument(doc), { status: 201 });
  } catch (error) { return NextResponse.json({ message: 'Erro interno' }, { status: 500 }); }
}
