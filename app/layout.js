'use client';

import { Poppins } from 'next/font/google';

import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from '@/contexts/AuthContext';
import { SnackbarProvider } from '@/contexts/SnackBarContext';

const poppins = Poppins({ subsets: ['latin'], weight: '500' });

const theme = createTheme({
  palette: {
    mode: 'light',
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
});

export default function RootLayout({ children }) {
  return (
    <html lang='pt-BR' className={poppins.className}>
      <head>
        <title>Sistema de Estoque</title>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </head>
      <body>
        <AuthProvider>
          <SnackbarProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {children}
            </ThemeProvider>
          </SnackbarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
