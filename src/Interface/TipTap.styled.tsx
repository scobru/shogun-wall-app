import styled from 'styled-components'

export const TipTapStyled = styled.div`
   button {
      background: var(--surface);
      color: var(--text-primary);
      border: 1px solid var(--border);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      font-family: var(--font-sans);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-right: var(--space-1);
      margin-bottom: var(--space-1);

      &:hover {
         background: var(--surface-hover);
         border-color: var(--border-hover);
         transform: translateY(-1px);
      }

      &.is-active {
         background: var(--accent);
         color: white;
         border-color: var(--accent);
      }

      &:focus {
         outline: 2px solid var(--accent);
         outline-offset: 2px;
      }
   }

   .ProseMirror {
      border-radius: var(--radius-lg);
      background: var(--surface);
      border: 1px solid var(--border);
      margin-top: var(--space-3);
      padding: var(--space-4);
      font-family: var(--font-sans);
      color: var(--text-primary);
      transition: all 0.2s ease;
      min-height: 120px;

      &:focus {
         outline: none;
         border-color: var(--accent);
         box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
      }

      p.is-editor-empty:first-child::before {
         color: var(--text-muted);
         content: attr(data-placeholder);
         float: left;
         height: 0;
         pointer-events: none;
         font-style: italic;
      }

      > * + * {
         margin-top: var(--space-3);
      }

      ul, ol {
         padding: 0 var(--space-4);
         margin: var(--space-2) 0;
      }

      li {
         margin: var(--space-1) 0;
      }

      h1, h2, h3, h4, h5, h6 {
         line-height: 1.2;
         font-weight: 600;
         color: var(--text-primary);
         margin: var(--space-4) 0 var(--space-2) 0;
      }

      h1 { font-size: 2rem; }
      h2 { font-size: 1.75rem; }
      h3 { font-size: 1.5rem; }
      h4 { font-size: 1.25rem; }
      h5 { font-size: 1.125rem; }
      h6 { font-size: 1rem; }

      code {
         background: var(--background-secondary);
         color: var(--text-primary);
         padding: var(--space-1) var(--space-2);
         border-radius: var(--radius-sm);
         font-family: var(--font-mono);
         font-size: 0.9em;
      }

      pre {
         background: var(--background-secondary);
         color: var(--text-primary);
         font-family: var(--font-mono);
         padding: var(--space-4);
         border-radius: var(--radius-lg);
         overflow-x: auto;
         margin: var(--space-4) 0;

         code {
            color: inherit;
            padding: 0;
            background: none;
            font-size: 0.9rem;
         }
      }

      img {
         max-width: 100%;
         height: auto;
         border-radius: var(--radius-md);
         margin: var(--space-2) 0;
      }

      blockquote {
         padding-left: var(--space-4);
         border-left: 3px solid var(--accent);
         margin: var(--space-4) 0;
         font-style: italic;
         color: var(--text-secondary);
      }

      hr {
         border: none;
         border-top: 1px solid var(--border);
         margin: var(--space-6) 0;
      }

      p {
         line-height: 1.6;
         margin: var(--space-2) 0;
      }

      strong {
         font-weight: 600;
      }

      em {
         font-style: italic;
      }

      a {
         color: var(--accent);
         text-decoration: none;
         transition: color 0.2s ease;

         &:hover {
            color: var(--accent-hover);
            text-decoration: underline;
         }
      }
   }
`
