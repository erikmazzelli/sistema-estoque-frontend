import Image from 'next/image';

export function Logo({ width = 124, height = 124, variant = 'primary' }) {
  const STYLE_BY_VARIANT = {
    primary: {
      mixBlendMode: 'multiply',
    },
    secondary: {
      filter: 'invert(1) brightness(2)',
      mixBlendMode: 'screen',
    },
  };

  return (
    <Image
      src='/images/logo.png'
      alt='BluWare'
      width={width}
      height={height}
      style={STYLE_BY_VARIANT[variant]}
      priority
    />
  );
}
