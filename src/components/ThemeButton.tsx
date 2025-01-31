// ThemeButton.jsx
import React, { useState, useEffect } from 'react';
import { useNotification } from './useNotification';
;

function ThemeButton() {

  const { notify } = useNotification()

  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Carga el tema desde localStorage al inicializar el estado
    const storedTheme = localStorage.getItem('theme');
    return storedTheme === 'dark';
  });

  useEffect(() => {
    // Aplica el tema actual y guarda en localStorage
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
  }, [isDarkMode]);

  const handleToggle = () => {
    setIsDarkMode(prevMode => !prevMode);
    showNotification();
  };

  const showNotification = () => {

    if(document.documentElement.getAttribute('data-theme') == 'light'){
      notify('Cambiando a tema oscuro', 2000, 'info')
    }
    else{
      notify('Cambiando a tema claro', 2000, 'info')
    }

  }

  return (
    <label htmlFor="theme" className="theme theme-button">
      <span className="theme__toggle-wrap">
        <input
          id="theme"
          className="theme__toggle"
          type="checkbox"
          role="switch"
          checked={isDarkMode}
          onChange={handleToggle}
        />
        <span className="theme__icon">
          <span className="theme__icon-part"></span>
          <span className="theme__icon-part"></span>
          <span className="theme__icon-part"></span>
          <span className="theme__icon-part"></span>
          <span className="theme__icon-part"></span>
          <span className="theme__icon-part"></span>
          <span className="theme__icon-part"></span>
          <span className="theme__icon-part"></span>
          <span className="theme__icon-part"></span>
        </span>
      </span>
    </label>
  );
}

export default ThemeButton;
