import { NextResponse } from 'next/server';
import { getDb, normalizeDocument, toObjectId } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  try {
    const { name, price, image_url } = await request.json();
    if (!name || typeof price !== 'number') return NextResponse.json({ message: 'Dados inválidos do produto.' }, { status: 400 });
    
    const db = await getDb();
    const result = await db.collection('foods').findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: { name, price, image_url: image_url || null } },
      { returnDocument: 'after' }
    );
    if (!result) return NextResponse.json({ message: 'Produto não encontrado.' }, { status: 404 });
    return NextResponse.json(normalizeDocument(result));
  } catch (error) { return NextResponse.json({ message: 'Erro interno' }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  const db = await getDb();
  await db.collection('foods').deleteOne({ _id: toObjectId(id) });
  await db.collection('sales').deleteMany({ food_id: id });
  return NextResponse.json({ success: true });
}
