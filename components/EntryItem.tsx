
import React, { useState } from 'react';
import type { RecordingEntry } from '../types';
import { EditorModal } from './EditorModal';
import { TagIcon, ClockIcon, EditIcon } from './icons/Icons';


interface EntryItemProps {
  entry: RecordingEntry;
  onUpdate: (entry: RecordingEntry) => void;
  onDelete: (id: string) => void;
}

export const EntryItem: React.FC<EntryItemProps> = ({ entry, onUpdate, onDelete }) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} دقیقه و ${secs} ثانیه`;
  };

  const transcriptSnippet = entry.transcript.length > 150 
    ? entry.transcript.substring(0, 150) + '...' 
    : entry.transcript;

  return (
    <>
      <div className="bg-gray-800 rounded-lg p-5 shadow-md transition-all hover:bg-gray-700/50 border border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400">{formatDate(entry.createdAt)}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <ClockIcon />
                <span>{formatDuration(entry.duration)}</span>
            </div>
          </div>
          <button 
            onClick={() => setIsEditorOpen(true)}
            className="text-cyan-400 hover:text-cyan-300 p-2 rounded-full transition-colors"
            aria-label="ویرایش"
          >
            <EditIcon />
          </button>
        </div>

        <p className="mt-4 text-gray-300 leading-relaxed">{transcriptSnippet}</p>

        {entry.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <TagIcon />
            {entry.tags.map(tag => (
              <span key={tag} className="bg-gray-700 text-cyan-300 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      {isEditorOpen && (
        <EditorModal 
          isOpen={isEditorOpen} 
          onClose={() => setIsEditorOpen(false)} 
          entry={entry}
          onSave={onUpdate}
          onDelete={onDelete}
        />
      )}
    </>
  );
};
