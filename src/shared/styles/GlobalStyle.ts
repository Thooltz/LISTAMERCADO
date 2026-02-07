import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  :root {
    --color-primary: #6366f1;
    --color-primary-dark: #4f46e5;
    --color-primary-light: #818cf8;
    --color-secondary: #10b981;
    --color-danger: #ef4444;
    --color-warning: #f59e0b;
    --color-text: #1f2937;
    --color-text-light: #6b7280;
    --color-text-lighter: #9ca3af;
    --color-bg: #ffffff;
    --color-bg-secondary: #f9fafb;
    --color-bg-tertiary: #f3f4f6;
    --color-border: #e5e7eb;
    --color-border-light: #f3f4f6;
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;
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
    background-color: var(--color-bg);
    color: var(--color-text);
    transition: background-color 0.2s, color 0.2s;
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
