"use client";
import { useState } from 'react';
import { X, Download } from 'lucide-react';

interface ReceiptViewerProps {
  url: string;
  filename?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ReceiptViewer({ url, filename, className = "", children }: ReceiptViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isDataUrl = url.startsWith('data:');

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isDataUrl) {
      // For data URLs, open in modal or download
      setIsOpen(true);
    } else {
      // For regular URLs, open in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = () => {
    if (isDataUrl) {
      // Create a download link for data URLs
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'receipt.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For regular URLs, create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || '';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      {children ? (
        <span onClick={handleClick} className={className} style={{ cursor: 'pointer' }}>
          {children}
        </span>
      ) : (
        <a
          href={url}
          onClick={handleClick}
          target={isDataUrl ? undefined : "_blank"}
          rel="noopener noreferrer"
          className={className}
        >
          <Download className="w-4 h-4" />
        </a>
      )}

      {/* Modal for data URLs */}
      {isOpen && isDataUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Receipt</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-neutral-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {url.startsWith('data:image') ? (
                <img src={url} alt="Receipt" className="max-w-full h-auto mx-auto" />
              ) : url.startsWith('data:application/pdf') ? (
                <iframe
                  src={url}
                  className="w-full h-full min-h-[600px]"
                  title="Receipt PDF"
                />
              ) : (
                <iframe
                  src={url}
                  className="w-full h-full min-h-[600px]"
                  title="Receipt"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
