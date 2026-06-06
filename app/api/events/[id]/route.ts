import { NextResponse } from 'next/server';
import { getDb, normalizeDocument, toObjectId } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  try {
    const { title, description, organizer_id, location_id, category_id, tag_ids, start_date, end_date, price, capacity } = await request.json();
    if (!title || !description || !organizer_id || !location_id || !category_id || !Array.isArray(tag_ids) || !start_date || !end_date || typeof price !== 'number' || typeof capacity !== 'number') {
      return NextResponse.json({ message: 'Dados completos do evento são obrigatórios.' }, { status: 400 });
    }
    const db = await getDb();
    const result = await db.collection('events').findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: { title, description, organizer_id, location_id, category_id, tag_ids, start_date, end_date, price, capacity } },
      { returnDocument: 'after' }
    );
    if (!result) return NextResponse.json({ message: 'Evento não encontrado.' }, { status: 404 });
    return NextResponse.json(normalizeDocument(result));
  } catch (error) { return NextResponse.json({ message: 'Erro interno' }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const { id } = await params;
  const db = await getDb();
  await db.collection('events').deleteOne({ _id: toObjectId(id) });
  await db.collection('comments').deleteMany({ event_id: id });
  await db.collection('participations').deleteMany({ event_id: id });
  await db.collection('ratings').deleteMany({ event_id: id });
  return NextResponse.json({ success: true });
}
