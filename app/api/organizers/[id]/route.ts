import { NextResponse } from 'next/server';
import { getDb, normalizeDocument, toObjectId } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  try {
    const { organization_name, bio, website } = await request.json();
    const db = await getDb();
    const result = await db.collection('organizers').findOneAndUpdate(
      { _id: toObjectId(id) }, { $set: { organization_name: organization_name || '', bio: bio || '', website: website || '' } }, { returnDocument: 'after' }
    );
    if (!result) return NextResponse.json({ message: 'Organizador não encontrado.' }, { status: 404 });
    return NextResponse.json(normalizeDocument(result));
  } catch (error) { return NextResponse.json({ message: 'Erro interno' }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  const db = await getDb();
  await db.collection('organizers').deleteOne({ _id: toObjectId(id) });
  return NextResponse.json({ success: true });
}
