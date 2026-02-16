import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  :root {
    --color-primary: #6366f1;
    --color-primary-dark: #4f46e5;
    --color-primary-light: #818cf8;
    --color-primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --color-primary-gradient-hover: linear-gradient(135deg, #7c8ef0 0%, #8a5fb8 100%);
    --color-secondary: #10b981;
    --color-secondary-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
    --color-danger: #ef4444;
    --color-danger-gradient: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    --color-warning: #f59e0b;
    --color-text: #1a1a1a;
    --color-text-light: #6b7280;
    --color-text-lighter: #9ca3af;
    --color-bg: #ffffff;
    --color-bg-secondary: #f9fafb;
    --color-bg-tertiary: #f3f4f6;
    --color-bg-gradient: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 50%, #f8f9fa 100%);
    --color-bg-glass: rgba(255, 255, 255, 0.85);
    --color-border: #e5e7eb;
    --color-border-light: #f3f4f6;
    --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    --shadow-colored: 0 10px 25px -5px rgba(102, 126, 234, 0.3);
    --shadow-colored-lg: 0 20px 40px -10px rgba(102, 126, 234, 0.4);
    --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5);
    --radius-sm: 0.5rem;
    --radius-md: 0.75rem;
    --radius-lg: 1rem;
    --radius-xl: 1.5rem;
    --radius-2xl: 2rem;
    --radius-full: 9999px;
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;
    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
    --transition-bounce: 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
    --blur-sm: blur(4px);
    --blur-md: blur(10px);
    --blur-lg: blur(20px);
    --blur-xl: blur(40px);
  }

  [data-theme="dark"] {
    --color-text: #f9fafb;
    --color-text-light: #d1d5db;
    --color-text-lighter: #9ca3af;
    --color-bg: #111827;
    --color-bg-secondary: #1f2937;
    --color-bg-tertiary: #374151;
    --color-border: #374151;
    --color-border-light: #4b5563;
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
    background: var(--color-bg-gradient);
    color: var(--color-text);
    transition: background-color var(--transition-base), color var(--transition-base);
    overflow-x: hidden;
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
