import React from 'react';

interface ThemeSelectorProps {
  theme: string;
  setTheme: (theme: string) => void;
}

const themes = {
  'default-dark': 'Default Dark',
  'oled-black': 'OLED Black',
  'vscode-dark': 'VS Code Dark',
};

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ theme, setTheme }) => {
  return (
    <div className="relative">
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md py-1 px-2 text-sm appearance-none focus:outline-none focus:ring-2 ring-offset-2 ring-offset-[var(--bg-primary)] focus:ring-[var(--accent-primary)]"
        aria-label="Select theme"
      >
        {Object.entries(themes).map(([key, name]) => (
          <option key={key} value={key}>{name}</option>
        ))}
      </select>
    </div>
  );
};
