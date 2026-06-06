import { NextResponse } from 'next/server';
import { getDb, normalizeDocument, toObjectId } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  try {
    const { name, address, city, state, zip_code } = await request.json();
    if (!name || !address || !city || !state || !zip_code) return NextResponse.json({ message: 'Dados completos do local são obrigatórios.' }, { status: 400 });
    const db = await getDb();
    const result = await db.collection('locations').findOneAndUpdate(
      { _id: toObjectId(id) }, { $set: { name, address, city, state, zip_code } }, { returnDocument: 'after' }
    );
    if (!result) return NextResponse.json({ message: 'Local não encontrado.' }, { status: 404 });
    return NextResponse.json(normalizeDocument(result));
  } catch (error) { return NextResponse.json({ message: 'Erro interno' }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  const db = await getDb();
  await db.collection('locations').deleteOne({ _id: toObjectId(id) });
  return NextResponse.json({ success: true });
}
