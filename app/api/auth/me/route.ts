import { NextResponse } from 'next/server';
import { getDb, normalizeDocument, toObjectId } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const userId = authenticate(request);
    if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });

    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ _id: toObjectId(userId) });
    
    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ user: normalizeDocument(user) });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
