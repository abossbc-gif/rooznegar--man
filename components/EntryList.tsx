
import React from 'react';
import type { RecordingEntry } from '../types';
import { EntryItem } from './EntryItem';

interface EntryListProps {
  entries: RecordingEntry[];
  onUpdateEntry: (entry: RecordingEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export const EntryList: React.FC<EntryListProps> = ({ entries, onUpdateEntry, onDeleteEntry }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">هنوز هیچ خاطره‌ای ضبط نشده است.</p>
        <p className="text-gray-600 text-sm mt-2">اولین تجربه خود را ضبط کنید!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-cyan-400 border-b-2 border-gray-700 pb-2">خاطرات ضبط شده</h2>
      <div className="space-y-4">
        {entries.map(entry => (
          <EntryItem key={entry.id} entry={entry} onUpdate={onUpdateEntry} onDelete={onDeleteEntry} />
        ))}
      </div>
    </div>
  );
};
