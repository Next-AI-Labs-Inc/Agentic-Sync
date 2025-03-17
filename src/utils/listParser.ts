/**
 * Utility functions for parsing and formatting list strings
 */

/**
 * Parses a string with numbered, bulleted, or plain line items into an array of strings
 * 
 * @param listString String containing list items separated by newlines
 * @returns Array of trimmed list items
 */
export function parseListString(listString: string | null | undefined): string[] {
  if (!listString) return [];
  
  return listString
    .split('\n')
    .map(line => {
      // Remove numbering (1. 2. etc.)
      const withoutNumbers = line.replace(/^\s*\d+\.\s*/, '');
      
      // Remove bullet points (-, *, •)
      const withoutBullets = withoutNumbers.replace(/^\s*[-*•]\s*/, '');
      
      return withoutBullets.trim();
    })
    .filter(Boolean); // Remove empty lines
}

/**
 * Formats an array of strings into a numbered list string
 * 
 * @param items Array of list items
 * @returns Formatted string with numbered items
 */
export function formatNumberedList(items: string[] | null | undefined): string {
  if (!items || !items.length) return '';
  
  return items
    .map((item, index) => `${index + 1}. ${item}`)
    .join('\n');
}

/**
 * Formats an array of strings into a bulleted list string
 * 
 * @param items Array of list items
 * @returns Formatted string with bulleted items
 */
export function formatBulletedList(items: string[] | null | undefined): string {
  if (!items || !items.length) return '';
  
  return items
    .map(item => `- ${item}`)
    .join('\n');
}

/**
 * Formats an array of strings into a plain list string (no bullets or numbers)
 * 
 * @param items Array of list items
 * @returns Formatted string with plain items
 */
export function formatPlainList(items: string[] | null | undefined): string {
  if (!items || !items.length) return '';
  
  return items.join('\n');
}