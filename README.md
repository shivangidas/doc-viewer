# Document Viewer Application

A web application that allows users to upload PDF or DOC files (through file upload or URL) and search for words within those documents. The application also highlights predefined key terms related to financial contexts.

## Features

- File upload for PDF and DOC/DOCX files
- Load documents from URLs
- Text extraction from documents
- Word search with highlighting
- Automatic highlighting of predefined key terms
- Mobile responsive design
- Page-by-page document viewing for PDFs

## Setup and Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/shivangidas/doc-viewer.git
   cd doc-viewer
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. To deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

## Project Structure

```
doc-viewer/
├── src/
│   ├── App.tsx           # Main application component
│   ├── App.css           # Styles for the application
│   ├── index.tsx         # Entry point
│   └── index.css         # Global styles
├── public/
│   └── index.html        # HTML template
└── package.json          # Dependencies and scripts
```

## Technologies Used

- React
- TypeScript
- PDF.js (via react-pdf) for PDF processing
- Mammoth.js for DOCX processing
- GitHub Pages for hosting

## Key Terms Highlighted

The application automatically highlights the following terms:

- breach
- dispute
- litigation
- covenant
- bad debts
- impaired
- impairment
- write off
- qualified
- adverse
- disclaimer of opinion

## Customization

To modify the list of key terms, edit the `KEY_TERMS` array in `App.tsx`.

## Known Limitations

- The URL-based document loading only works with CORS-enabled sources
- For large files, processing might take some time depending on the client's hardware
- Some complex document formatting might be lost during text extraction

## License

MIT License
