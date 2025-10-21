import React, { useState, useEffect } from 'react';
import type { RecordingEntry } from '../types';
import { TAG_SUGGESTIONS } from '../constants';
import { TrashIcon, ClipboardIcon } from './icons/Icons';

interface EditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: RecordingEntry;
  onSave: (entry: RecordingEntry) => void;
  onDelete: (id: string) => void;
}

export const EditorModal: React.FC<EditorModalProps> = ({ isOpen, onClose, entry, onSave, onDelete }) => {
  const [transcript, setTranscript] = useState(entry.transcript);
  const [tags, setTags] = useState<string[]>(entry.tags);
  const [newTag, setNewTag] = useState('');
  const [showCopySuccess, setShowCopySuccess] = useState(false);


  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);
  
  const handleSave = () => {
    onSave({ ...entry, transcript, tags });
    onClose();
  };
  
  const handleDelete = () => {
    if (window.confirm("آیا از حذف این خاطره مطمئن هستید؟ این عمل غیرقابل بازگشت است.")) {
        onDelete(entry.id);
        onClose();
    }
  };

  const addTag = (tagToAdd: string) => {
    const formattedTag = tagToAdd.trim();
    if (!formattedTag) {
      return; // Do not add empty tags
    }
    if (tags.includes(formattedTag)) {
      alert(`تگ «${formattedTag}» از قبل وجود دارد.`);
      setNewTag('');
      return;
    }
    setTags([...tags, formattedTag]);
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    if (window.confirm(`آیا از حذف تگ «${tagToRemove}» مطمئن هستید؟`)) {
      setTags(tags.filter(tag => tag !== tagToRemove));
    }
  };
  
  const exportToText = () => {
    const date = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(entry.createdAt));
    const content = `
راننده‌نگار - خاطره ضبط شده
============================

تاریخ: ${date}
مدت زمان: ${Math.floor(entry.duration / 60)} دقیقه و ${entry.duration % 60} ثانیه
تگ‌ها: ${tags.join(', ') || 'بدون تگ'}

--- متن خاطره ---

${transcript}
    `;
    navigator.clipboard.writeText(content.trim());
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-cyan-400">ویرایش خاطره</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <div className="p-5 overflow-y-auto flex-grow">
            <label htmlFor="transcript" className="block text-sm font-medium text-gray-400 mb-2">متن رونویسی شده</label>
            <textarea
              id="transcript"
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              className="w-full h-48 bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              rows={10}
            />
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">تگ‌ها</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center bg-cyan-800/50 text-cyan-200 text-sm font-medium px-3 py-1 rounded-full">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ms-2 text-cyan-400 hover:text-white">&times;</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTag(newTag)}
                    placeholder="تگ جدید..."
                    list="tag-suggestions"
                    className="flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                  <datalist id="tag-suggestions">
                    {TAG_SUGGESTIONS.map(tag => <option key={tag} value={tag} />)}
                  </datalist>
                  <button onClick={() => addTag(newTag)} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md">افزودن</button>
              </div>
            </div>
        </div>

        <div className="p-5 border-t border-gray-700 flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-2">
                 <button onClick={exportToText} className={`flex items-center gap-2 ${showCopySuccess ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-700'} text-white font-bold py-2 px-4 rounded-md transition-colors`}>
                    <ClipboardIcon />
                    {showCopySuccess ? 'کپی شد!' : 'خروجی متنی'}
                </button>
                <button onClick={handleDelete} className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white font-bold py-2 px-4 rounded-md">
                    <TrashIcon />
                    <span>حذف</span>
                </button>
            </div>
            <div className="flex gap-2">
                <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md">انصراف</button>
                <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md">ذخیره تغییرات</button>
            </div>
        </div>
      </div>
    </div>
  );
};