import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto max-w-3xl p-4">
        <h1 className="text-2xl font-bold text-cyan-400 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.75 3.5C8.75 2.67157 9.42157 2 10.25 2H13.75C14.5784 2 15.25 2.67157 15.25 3.5V5.83394C16.5414 6.30752 17.5 7.52598 17.5 9V12.5C17.5 14.1569 16.1569 15.5 14.5 15.5H9.5C7.84315 15.5 6.5 14.1569 6.5 12.5V9C6.5 7.52598 7.45857 6.30752 8.75 5.83394V3.5ZM19.25 10V12.5C19.25 15.1234 17.1234 17.25 14.5 17.25H9.5C6.87665 17.25 4.75 15.1234 4.75 12.5V10H3.5C2.67157 10 2 10.6716 2 11.5V12.5C2 13.3284 2.67157 14 3.5 14H4.03201C4.3033 16.8927 6.64531 19.25 9.5 19.25H14.5C17.3547 19.25 19.6967 16.8927 19.968 14H20.5C21.3284 14 22 13.3284 22 12.5V11.5C22 10.6716 21.3284 10 20.5 10H19.25Z M12 20C10.8954 20 10 20.8954 10 22H14C14 20.8954 13.1046 20 12 20Z"></path>
          </svg>
          روزنگار من
        </h1>
      </div>
    </header>
  );
};