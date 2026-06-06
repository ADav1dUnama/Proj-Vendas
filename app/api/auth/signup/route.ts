import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb, normalizeDocument } from '@/lib/db';
import { createToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json();
    if (!email || !password || !username) {
      return NextResponse.json({ message: 'Email, senha e nome são obrigatórios.' }, { status: 400 });
    }

    const db = await getDb();
    const users = db.collection('users');

    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: 'Email já cadastrado.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await users.insertOne({ email, username, password: hashedPassword, created_at: new Date().toISOString() });
    const user = await users.findOne({ _id: result.insertedId });
    const token = createToken(user);

    return NextResponse.json({ token, user: normalizeDocument(user) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
