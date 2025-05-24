'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';

import { Logo } from '@/public/logo';

export default function Login() {
  const router = useRouter();

  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });
  const [formState, setFormState] = useState({
    error: '',
    loading: '',
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setFormState({ error: '', loading: true });

    try {
      const res = await fetch(`${process.env.API_DOMAIN}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formValues.email,
          senha: formValues.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormState({ error: data.erro || 'Erro no login', loading: false });
        return;
      }

      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err) {
      setFormState({ error: 'Erro de conexão', loading: false });
    }
  }

  return (
    <Container maxWidth='sm'>
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 3,
          p: 4,
          boxShadow: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Logo />

        <Typography
          component='h1'
          variant='h5'
          mb={2}
          fontWeight='bold'
          pr={2}
          color='primary.dark'
        >
          BluWare
        </Typography>

        {formState.error && <Alert severity='error'>{formState.error}</Alert>}

        <Box component='form' onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            label='Email'
            type='email'
            fullWidth
            required
            margin='normal'
            value={formValues.email}
            onChange={e =>
              setFormValues(prev => ({ ...prev, email: e.target.value }))
            }
            disabled={formState.loading}
          />
          <TextField
            label='Senha'
            type='password'
            fullWidth
            required
            margin='normal'
            value={formValues.password}
            onChange={e =>
              setFormValues(prev => ({ ...prev, password: e.target.value }))
            }
            disabled={formState.loading}
          />
          <Button
            type='submit'
            fullWidth
            variant='contained'
            sx={{ mt: 3, mb: 2 }}
            disabled={formState.loading}
            startIcon={formState.loading && <CircularProgress size={20} />}
          >
            {formState.loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Box>

        <Stack direction='row' spacing={1} alignItems='center'>
          <Typography variant='body2'>Não tem uma conta?</Typography>
          <Button
            component={Link}
            href='/register'
            variant='outlined'
            size='small'
            disabled={formState.loading}
          >
            Cadastre-se
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
