import React from 'react';

/**
 * Creates a clickable ID component that copies a reference to the clipboard
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - The ID to display and copy
 * @param {string} props.filePath - The file path to use in the reference
 * @param {string} props.className - Optional additional classes for styling
 * @returns {JSX.Element} - The clickable ID component
 */
export const ClickableId = ({
  id,
  filePath,
  className = "",
}: {
  id: string;
  filePath: string;
  className?: string;
}): JSX.Element => {
  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    
    // Create the reference message to copy to clipboard
    const clipboardMessage = `Regarding the component ${id} at path ${filePath}`;
    
    // Copy to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(clipboardMessage)
        .then(() => {
          const target = e.target as HTMLElement;
          const originalText = target.innerText;
          target.innerText = "Copied!";
          setTimeout(() => {
            target.innerText = originalText;
          }, 1000);
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
        });
    } else {
      console.error('Clipboard API not available');
    }
    
    // Prevent default action
    e.preventDefault();
  };

  return (
    <span
      id={id}
      className={`text-xs text-gray-400 px-2 py-1 rounded cursor-pointer hover:text-gray-600 inline-flex items-center ${className}`}
      onClick={handleClick}
    >
      {id}
    </span>
  );
};

export default ClickableId;