'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Spin } from 'antd';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'editor' | null;

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// Timeout wrapper — nếu fetchRole không trả về trong 5s thì trả null
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

async function fetchRole(userId: string): Promise<UserRole> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return (data?.role as UserRole) ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Dùng onAuthStateChange duy nhất — nó fire INITIAL_SESSION ngay lập tức
    // thay thế cả getSession, tránh race condition
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const u = session?.user ?? null;
        setUser(u);

        if (u) {
          // Timeout 5s — nếu Supabase không trả về thì vẫn setLoading(false)
          const r = await withTimeout(fetchRole(u.id), 5000, null);
          setRole(r);
        } else {
          setRole(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== '/login') router.push('/login');
      if (user && pathname === '/login') router.push('/');
    }
  }, [user, loading, pathname, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, role, isAdmin: role === 'admin', loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}