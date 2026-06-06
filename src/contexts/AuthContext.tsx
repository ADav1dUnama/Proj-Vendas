import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { mockDb } from '../lib/mockDb';

interface User {
  id: string;
  email: string;
  created_at: string;
  user_metadata: {
    username: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = mockDb.getUser() as User | null;
    setUser(savedUser);
    setLoading(false);
  }, []);

  async function signUp(email: string, _password: string, username: string) { // eslint-disable-line @typescript-eslint/no-unused-vars
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      created_at: new Date().toISOString(),
      user_metadata: { username }
    };
    mockDb.setUser(newUser);
    setUser(newUser);
  }

  async function signIn(email: string, _password: string) { // eslint-disable-line @typescript-eslint/no-unused-vars
    // Para mock, aceitamos qualquer login
    const user: User = {
      id: crypto.randomUUID(),
      email,
      created_at: new Date().toISOString(),
      user_metadata: { username: email.split('@')[0] }
    };
    mockDb.setUser(user);
    setUser(user);
  }

  async function signOut() {
    mockDb.clearUser();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
