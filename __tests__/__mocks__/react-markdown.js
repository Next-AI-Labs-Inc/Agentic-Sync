// Mock of react-markdown
const React = require('react');

const ReactMarkdown = ({ children }) => {
  return React.createElement('div', { 'data-testid': 'markdown' }, children);
};

module.exports = ReactMarkdown;