import styled from 'styled-components'
import { useEffect, useState } from 'react'

export const DarkToggle = () => {
   // State to hold the current theme
   const [theme, setTheme] = useState(() => {
      // Get the stored preference from localStorage
      const savedTheme = localStorage.getItem('theme') || 'light';
      const root = document.documentElement;
      root.setAttribute('data-theme', savedTheme);
      return savedTheme;
   });

   useEffect(() => {
      // Apply the theme on initial load
      const root = document.documentElement;
      root.setAttribute('data-theme', theme);
   }, [theme]);

   const toggleTheme = () => {
      const themes = ['light', 'dark'];
      const currentThemeIndex = themes.indexOf(theme);
      const nextThemeIndex = (currentThemeIndex + 1) % themes.length;
      const nextTheme = themes[nextThemeIndex];
      
      setTheme(nextTheme);

      // Store the preference in localStorage
      localStorage.setItem('theme', nextTheme);
   };

   return (
      <Dte>
         <button onClick={toggleTheme} className="theme-toggle-button">
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
         </button>
      </Dte>
   );
};

const Dte = styled.div`
   .theme-toggle-button {
      background: var(--win95-silver);
      color: var(--win95-black);
      border: 2px solid;
      border-color: var(--win95-light-gray) var(--win95-dark-gray) var(--win95-dark-gray) var(--win95-light-gray);
      padding: 4px 8px;
      font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif;
      font-size: 11px;
      cursor: pointer;
      min-height: 23px;
   }
`
