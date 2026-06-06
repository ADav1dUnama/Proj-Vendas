import { NextResponse } from 'next/server';
import { getDb, normalizeDocument, toObjectId } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  try {
    const { status } = await request.json();
    if (!status) return NextResponse.json({ message: 'Status é obrigatório para atualizar participação.' }, { status: 400 });
    const db = await getDb();
    const result = await db.collection('participations').findOneAndUpdate(
      { _id: toObjectId(id) }, { $set: { status } }, { returnDocument: 'after' }
    );
    if (!result) return NextResponse.json({ message: 'Participação não encontrada.' }, { status: 404 });
    return NextResponse.json(normalizeDocument(result));
  } catch (error) { return NextResponse.json({ message: 'Erro interno' }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  const db = await getDb();
  await db.collection('participations').deleteOne({ _id: toObjectId(id) });
  return NextResponse.json({ success: true });
}
