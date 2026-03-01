import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  :root {
    /* Cores primárias - Verde moderno */
    --color-primary: #22C55E;
    --color-primary-dark: #16A34A;
    --color-primary-light: #4ADE80;
    --color-primary-gradient: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
    --color-primary-gradient-hover: linear-gradient(135deg, #4ADE80 0%, #22C55E 100%);
    --color-primary-gradient-bright: linear-gradient(135deg, #4ADE80 0%, #22C55E 50%, #16A34A 100%);
    
    /* Cores secundárias - Azul accent */
    --color-secondary: #0EA5E9;
    --color-secondary-dark: #0284C7;
    --color-secondary-light: #38BDF8;
    --color-secondary-gradient: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
    
    /* Cores de estado */
    --color-danger: #EF4444;
    --color-danger-dark: #DC2626;
    --color-danger-gradient: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
    --color-warning: #F59E0B;
    --color-warning-dark: #D97706;
    --color-warning-gradient: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
    
    /* Backgrounds - Dark elegante */
    --color-bg: #0F172A;
    --color-bg-secondary: #111827;
    --color-bg-tertiary: #1E293B;
    --color-bg-gradient: linear-gradient(135deg, #0F172A 0%, #111827 50%, #1E293B 100%);
    --color-bg-gradient-vibrant: linear-gradient(135deg, #0F172A 0%, #111827 25%, #1E293B 50%, #111827 75%, #0F172A 100%);
    
    /* Surface - Cards */
    --color-surface: #111827;
    --color-surface-elevated: #1E293B;
    --color-bg-glass: rgba(17, 24, 39, 0.9);
    --color-bg-glass-strong: rgba(17, 24, 39, 0.95);
    
    /* Textos */
    --color-text: #F9FAFB;
    --color-text-light: #D1D5DB;
    --color-text-lighter: #9CA3AF;
    --color-text-secondary: #9CA3AF;
    
    /* Bordas */
    --color-border: #1E293B;
    --color-border-light: #334155;
    --color-border-dark: #0F172A;
    
    /* Sombras para dark mode */
    --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.5), 0 1px 2px -1px rgb(0 0 0 / 0.5);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.6), 0 4px 6px -4px rgb(0 0 0 / 0.6);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.7), 0 8px 10px -6px rgb(0 0 0 / 0.7);
    --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.8);
    --shadow-colored: 0 10px 25px -5px rgba(34, 197, 94, 0.3);
    --shadow-colored-lg: 0 20px 40px -10px rgba(34, 197, 94, 0.4);
    --shadow-colored-xl: 0 25px 50px -12px rgba(34, 197, 94, 0.5);
    --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(30, 41, 59, 0.5);
    --shadow-glass-strong: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(30, 41, 59, 0.6);
    
    /* Radius */
    --radius-sm: 0.5rem;
    --radius-md: 0.75rem;
    --radius-lg: 1rem;
    --radius-xl: 1.5rem;
    --radius-2xl: 2rem;
    --radius-full: 9999px;
    
    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;
    
    /* Transitions */
    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
    --transition-bounce: 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
    --transition-smooth: 300ms cubic-bezier(0.4, 0, 0.2, 1);
    
    /* Blur */
    --blur-sm: blur(4px);
    --blur-md: blur(10px);
    --blur-lg: blur(20px);
    --blur-xl: blur(40px);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
    background: var(--color-bg);
    background-image: var(--color-bg-gradient-vibrant);
    background-size: 200% 200%;
    animation: gradientShift 15s ease infinite;
    color: var(--color-text);
    transition: background-color var(--transition-base), color var(--transition-base);
    overflow-x: hidden;
  }

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  /* Safe area support para notches */
  @supports (padding: max(0px)) {
    body {
      padding-top: max(0px, env(safe-area-inset-top));
      padding-bottom: max(0px, env(safe-area-inset-bottom));
      padding-left: max(0px, env(safe-area-inset-left));
      padding-right: max(0px, env(safe-area-inset-right));
    }
  }

  /* Otimizações para mobile */
  @media (max-width: 768px) {
    html {
      font-size: 16px;
      -webkit-text-size-adjust: 100%;
      scroll-behavior: smooth;
    }

    body {
      font-size: 16px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Melhorar scroll em mobile */
    * {
      -webkit-overflow-scrolling: touch;
    }

    /* Melhorar performance de scroll */
    * {
      will-change: auto;
    }
  }

  /* Melhorias para telas muito pequenas */
  @media (max-width: 360px) {
    html {
      font-size: 15px;
    }
  }

  /* Prevenir zoom em inputs no iOS */
  @media screen and (max-width: 768px) {
    input[type="text"],
    input[type="email"],
    input[type="password"],
    input[type="number"],
    select,
    textarea {
      font-size: 16px !important;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  @keyframes slideInFromBottom {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
  }

  input, textarea {
    font-family: inherit;
    outline: none;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ul, ol {
    list-style: none;
  }
`
