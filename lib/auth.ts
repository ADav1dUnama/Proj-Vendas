import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET ?? 'secret';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createToken(user: any) {
  return jwt.sign({ userId: user._id.toString() }, jwtSecret, { expiresIn: '7d' });
}

export function authenticate(request: Request) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}
