# Documentation Viewer System

The IX Tasks Documentation Viewer is a flexible markdown-based documentation system that automatically renders markdown files from both the project root and the `/docs` directory. This document explains how the system works and how to maintain it.

## Key Features

- **Automatic File Discovery**: Discovers markdown files from both the project root and `/docs` directory
- **Dynamic Navigation**: Sidebar navigation updates automatically when new documentation files are added
- **Direct Document Loading**: Custom document loading system for fast navigation between documents
- **Enhanced Markdown Styling**: Custom styling with improved readability for headings, code blocks, and lists
- **Error Handling**: Proper error handling for missing documents

## How It Works

### File Discovery and Routing

- The API endpoint `/api/docs` provides two functions:
  1. **Document Content**: `GET /api/docs?file=filename.md` returns the content of the specified markdown file
  2. **Document List**: `GET /api/docs?list=true` returns a list of all available markdown files

- The system searches for markdown files in:
  1. The project root directory (`/Users/jedi/react_projects/ix/tasks/*.md`)
  2. The docs directory (`/Users/jedi/react_projects/ix/tasks/docs/*.md`)

- Each file is automatically assigned a URL path based on its filename:
  - `README.md` → `/docs/readme`
  - `TASK_DOCUMENTATION.md` → `/docs/task-documentation`

### Navigation System

The navigation system uses a direct document loading approach rather than relying on Next.js routing:

1. When a user clicks a document link in the sidebar:
   - The document is loaded directly via API call
   - The URL is updated for bookmarking using `window.history.pushState()`
   - The document content is rendered immediately

This approach avoids potential routing issues that can occur with nested dynamic routes.

### Document Styling

Custom styling is applied to the markdown content to improve readability:

- Increased vertical spacing between headings and content
- Bottom borders on h1 and h2 headings
- Proper indentation for lists and code blocks
- Consistent spacing for paragraphs

## Adding New Documentation

To add new documentation to the system:

1. Create a markdown file in either:
   - The project root (`/Users/jedi/react_projects/ix/tasks/YOUR_DOC.md`)
   - The docs directory (`/Users/jedi/react_projects/ix/tasks/docs/YOUR_DOC.md`)

2. The file will automatically appear in the documentation sidebar the next time the page loads

3. The title in the sidebar is automatically generated from the filename:
   - Underscores and hyphens are converted to spaces
   - Each word is capitalized

## Technical Implementation

### Components

- **docs.tsx**: The main page component that handles document loading and rendering
- **api/docs.ts**: API endpoint that serves document content and the list of available documents

### Key Functions

- **loadDocumentDirectly**: Loads a document by filename without relying on routing
- **Document Discovery**: API logic that scans directories for markdown files
- **Markdown Rendering**: Uses `react-markdown` to render the content with custom styling

## Maintenance Notes

- **Adding Features**: When adding features to the documentation viewer, update this document
- **URL Structure**: The URL structure is `/docs/[filename]` (lowercase, without the .md extension)
- **Title Generation**: Document titles in the sidebar are automatically generated from filenames
- **Document Format**: Use standard GitHub-flavored markdown for compatibility

## Troubleshooting

If documents are not appearing or loading correctly:

1. Check browser console for error messages
2. Verify that markdown files have the `.md` extension
3. Ensure document references use the correct filename and path
4. Clear browser cache if URL changes are not reflecting properly