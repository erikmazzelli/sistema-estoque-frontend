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
  Snackbar,
  CircularProgress,
} from '@mui/material';

export default function Register() {
  const router = useRouter();

  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [formState, setFormState] = useState({
    error: '',
    loading: false,
    success: false,
  });

  const handleSubmit = async e => {
    e.preventDefault();
    setFormState({
      loading: 'true',
    });

    try {
      const res = await fetch(
        `${process.env.API_DOMAIN}:${process.env.API_PORT}/usuarios`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: formValues.name,
            email: formValues.email,
            senha: formValues.password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setFormState({
          error: data.erro || 'Erro ao cadastrar',
          loading: false,
        });
        return;
      }

      setFormState({ success: true, loading: false });

      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      setFormState({
        error: 'Erro de conexão',
        loading: false,
      });
    }
  };

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
        <Typography color='primary.dark' component='h1' variant='h5' mb={2}>
          Cadastre-se
        </Typography>
        <Box component='form' onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            label='Nome'
            fullWidth
            required
            margin='normal'
            value={formValues.name}
            onChange={e =>
              setFormValues(prev => ({ ...prev, name: e.target.value }))
            }
          />
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
          />

          {formState.error && <Alert severity='error'>{formState.error}</Alert>}

          {formState.success && (
            <Snackbar open autoHideDuration={1500}>
              <Alert severity='success' variant='filled' sx={{ width: '100%' }}>
                Cadastro realizado com sucesso! Redirecionando para o login...
              </Alert>
            </Snackbar>
          )}

          <Button
            type='submit'
            fullWidth
            variant='contained'
            sx={{ mt: 3, mb: 2 }}
            disabled={formState.loading || formState.success}
            startIcon={formState.loading && <CircularProgress size={20} />}
          >
            {formState.loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </Box>

        <Stack direction='row' spacing={1} alignItems='center'>
          <Typography variant='body2'>Já tem uma conta?</Typography>
          <Button
            component={Link}
            href='/login'
            variant='outlined'
            size='small'
            disabled={formState.loading || formState.success}
          >
            Entrar
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
