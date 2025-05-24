'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress, Stack, Typography } from '@mui/material';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      router.push('/login');
      return;
    }

    try {
      const [, payloadBase64] = token.split('.');
      const payload = JSON.parse(atob(payloadBase64));
      const exp = payload.exp;

      if (exp && Date.now() >= exp * 1000) {
        localStorage.removeItem('token');
        router.push('/login');
        setLoading(false);
        return;
      }

      setUser({
        name: payload.nome,
        id: payload.id,
        email: payload.email,
        token,
      });
    } catch (error) {
      console.error('Erro ao decodificar o token:', error);
      localStorage.removeItem('token');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, []);

  if (!hasMounted) return null;

  if (loading)
    return (
      <Stack
        direction='column'
        alignItems='center'
        justifyContent='center'
        sx={{
          width: '100vw',
          height: '100vh',
        }}
      >
        <CircularProgress />
        <Typography color='primary'>Carregando...</Typography>
      </Stack>
    );

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
