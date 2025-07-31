import React, { useState } from 'react';

const DevToolsNotice = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-2">💡 Development Tip</h3>
          <p className="text-xs mb-3">
            Install React DevTools for a better development experience:
          </p>
          <a
            href="https://react.dev/link/react-devtools"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline hover:text-blue-200 transition-colors"
          >
            Download React DevTools →
          </a>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 text-white hover:text-blue-200 transition-colors"
          aria-label="Close notice"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DevToolsNotice; 