// Mock of react-markdown
const ReactMarkdown = ({ children }) => {
  return <div data-testid="markdown">{children}</div>;
};

module.exports = ReactMarkdown;