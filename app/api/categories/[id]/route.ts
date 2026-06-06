import { NextResponse } from 'next/server';
import { getDb, normalizeDocument, toObjectId } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  try {
    const { name, description } = await request.json();
    if (!name) return NextResponse.json({ message: 'Nome da categoria é obrigatório.' }, { status: 400 });
    const db = await getDb();
    const result = await db.collection('categories').findOneAndUpdate(
      { _id: toObjectId(id) }, { $set: { name, description: description || '' } }, { returnDocument: 'after' }
    );
    if (!result) return NextResponse.json({ message: 'Categoria não encontrada.' }, { status: 404 });
    return NextResponse.json(normalizeDocument(result));
  } catch (error) { return NextResponse.json({ message: 'Erro interno' }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  const db = await getDb();
  await db.collection('categories').deleteOne({ _id: toObjectId(id) });
  return NextResponse.json({ success: true });
}
