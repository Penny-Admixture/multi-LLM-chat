import React from 'react';
import type { Source } from '../types';

interface SourceCardProps {
  source: Source;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source }) => {
  return (
    <a
      href={source.uri}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-[var(--bg-tertiary)] hover:bg-[var(--bg-interactive)]/80 p-2 rounded-md transition-colors duration-200"
    >
      <p className="text-xs text-blue-300 truncate font-medium">{source.title}</p>
      <p className="text-xs text-[var(--text-muted)] truncate">{source.uri}</p>
    </a>
  );
};
