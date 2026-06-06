import { NextResponse } from 'next/server';
import { getDb, normalizeDocument } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  const db = await getDb();
  const url = new URL(request.url);
  const filter: any = {};
  if (url.searchParams.get('category_id')) filter.category_id = url.searchParams.get('category_id');
  if (url.searchParams.get('organizer_id')) filter.organizer_id = url.searchParams.get('organizer_id');
  if (url.searchParams.get('tag_id')) filter.tag_ids = url.searchParams.get('tag_id');
  
  const docs = await db.collection('events').find(filter).sort({ start_date: 1 }).toArray();
  return NextResponse.json(docs.map(normalizeDocument));
}

export async function POST(request: Request) {
  if (!authenticate(request)) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  try {
    const { title, description, organizer_id, location_id, category_id, tag_ids, start_date, end_date, price, capacity } = await request.json();
    if (!title || !description || !organizer_id || !location_id || !category_id || !Array.isArray(tag_ids) || !start_date || !end_date || typeof price !== 'number' || typeof capacity !== 'number') {
      return NextResponse.json({ message: 'Dados completos do evento são obrigatórios.' }, { status: 400 });
    }
    const db = await getDb();
    const result = await db.collection('events').insertOne({
      title, description, organizer_id, location_id, category_id, tag_ids, start_date, end_date, price, capacity, created_at: new Date().toISOString()
    });
    const doc = await db.collection('events').findOne({ _id: result.insertedId });
    return NextResponse.json(normalizeDocument(doc), { status: 201 });
  } catch (error) { return NextResponse.json({ message: 'Erro interno' }, { status: 500 }); }
}
