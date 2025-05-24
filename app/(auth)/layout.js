'use client';
import { useEffect, useState } from 'react';
import { Box, useTheme } from '@mui/material';

export default function AuthLayout({ children }) {
  const theme = useTheme();

  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    function handleMouseMove(e) {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
    }

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `radial-gradient(
          circle at ${mousePos.x}% ${mousePos.y}%,
          ${theme.palette.primary.main} 0%,
          ${theme.palette.primary.dark} 60%,
          #000 200%
        )`,
        transition: 'background 0.1s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </Box>
  );
}
