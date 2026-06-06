import jwt from 'jsonwebtoken';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('A variável de ambiente JWT_SECRET não está definida.');
    }
    // No desenvolvimento, avisar mas não necessariamente quebrar tudo imediatamente
    // se o arquivo .env ainda estiver sendo configurado.
    console.warn('Aviso: JWT_SECRET não está definida no ambiente.');
    return 'development_secret_only';
  }
  return secret;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createToken(user: any) {
  return jwt.sign({ userId: user._id.toString() }, getJwtSecret(), { expiresIn: '7d' });
}

export function authenticate(request: Request) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}
