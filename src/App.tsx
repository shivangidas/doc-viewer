// src/App.tsx
import React, { useState, useRef } from 'react';
import { pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
import './App.css';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Key terms to highlight
const KEY_TERMS = [
    'breach',
    'dispute',
    'litigation',
    'covenant',
    'bad debts',
    'impaired',
    'impairment',
    'write off',
    'qualified',
    'adverse',
    'disclaimer of opinion',
];

interface DocumentText {
    text: string;
    pageNumber?: number;
}

const App = () => {
    const [documentText, setDocumentText] = useState<DocumentText[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [url, setUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [highlightKeyTerms, setHighlightKeyTerms] = useState<boolean>(true);
    const [fileName, setFileName] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Function to extract text from PDF
    const extractTextFromPDF = async (data: ArrayBuffer) => {
        try {
            setIsLoading(true);
            const pdf = await pdfjs.getDocument({ data }).promise;
            const totalPages = pdf.numPages;
            const textContent: DocumentText[] = [];

            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const content = await page.getTextContent();
                const pageText = content.items
                    .map((item: any) => item.str)
                    .join(' ');

                textContent.push({
                    text: pageText,
                    pageNumber: pageNum
                });
            }

            setDocumentText(textContent);
            setIsLoading(false);
        } catch (err) {
            console.error('Error extracting PDF text:', err);
            setError('Failed to extract text from PDF. Please try another file.');
            setIsLoading(false);
        }
    };

    // Function to extract text from DOCX
    const extractTextFromDOCX = async (data: ArrayBuffer) => {
        try {
            setIsLoading(true);
            const result = await mammoth.extractRawText({ arrayBuffer: data });
            setDocumentText([{ text: result.value }]);
            setIsLoading(false);
        } catch (err) {
            console.error('Error extracting DOCX text:', err);
            setError('Failed to extract text from DOCX. Please try another file.');
            setIsLoading(false);
        }
    };

    // Handle file upload
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const buffer = e.target?.result as ArrayBuffer;

            if (file.type === 'application/pdf') {
                await extractTextFromPDF(buffer);
            } else if (
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                file.type === 'application/msword'
            ) {
                await extractTextFromDOCX(buffer);
            } else {
                setError('Unsupported file format. Please upload PDF or DOCX files.');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // Handle URL input
    const handleUrlSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!url) {
            setError('Please enter a URL');
            return;
        }

        setIsLoading(true);
        try {
            // For fetching from URL, we'd use a proxy in a real-world scenario
            // Here we're implementing it client-side for simplicity
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type') || '';
            const arrayBuffer = await response.arrayBuffer();
            setFileName(url.split('/').pop() || 'document');

            if (contentType.includes('pdf')) {
                await extractTextFromPDF(arrayBuffer);
            } else if (
                contentType.includes('officedocument.wordprocessingml.document') ||
                contentType.includes('msword')
            ) {
                await extractTextFromDOCX(arrayBuffer);
            } else {
                throw new Error('Unsupported file format');
            }
        } catch (err: any) {
            console.error('Error fetching document:', err);
            setError(`Failed to fetch document: ${err.message}`);
            setIsLoading(false);
        }
    };

    // Reset the application state
    const handleReset = () => {
        setDocumentText([]);
        setSearchTerm('');
        setUrl('');
        setError(null);
        setFileName('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Highlight search terms and key terms in text
    const highlightText = (text: string) => {
        if (!text) return '';

        let highlightedText = text;

        // First highlight search term if provided
        if (searchTerm) {
            const regex = new RegExp(searchTerm, 'gi');
            highlightedText = highlightedText.replace(
                regex,
                match => `<mark class="search-highlight">${match}</mark>`
            );
        }

        // Then highlight key terms if enabled
        if (highlightKeyTerms) {
            KEY_TERMS.forEach(term => {
                const regex = new RegExp(`\\b${term}\\b`, 'gi');
                highlightedText = highlightedText.replace(
                    regex,
                    match => `<mark class="key-term-highlight">${match}</mark>`
                );
            });
        }

        return highlightedText;
    };

    return (
        <div className="app-container">
            <header>
                <h1>Document Viewer</h1>
                <p>Upload PDF or DOC files to search and highlight key terms</p>
            </header>

            <div className="controls">
                <div className="upload-section">
                    <div className="file-upload">
                        <h2>Upload Document</h2>
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx"
                            ref={fileInputRef}
                        />
                    </div>

                    <div className="url-upload">
                        <h2>Or Load from URL</h2>
                        <form onSubmit={handleUrlSubmit}>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com/document.pdf"
                            />
                            <button type="submit">Load</button>
                        </form>
                    </div>
                </div>

                {documentText.length > 0 && (
                    <div className="search-section">
                        <div className="search-box">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search for words..."
                            />
                        </div>

                        <div className="highlight-toggle">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={highlightKeyTerms}
                                    onChange={() => setHighlightKeyTerms(!highlightKeyTerms)}
                                />
                                Highlight Key Terms
                            </label>
                        </div>

                        <button className="reset-button" onClick={handleReset}>
                            Reset
                        </button>
                    </div>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {isLoading && <div className="loading">Loading document...</div>}

            {documentText.length > 0 && (
                <div className="document-info">
                    <h2>{fileName}</h2>
                    <p>{documentText.length > 1 ? `${documentText.length} pages` : '1 page'}</p>
                </div>
            )}

            <div className="document-content">
                {documentText.map((content, index) => (
                    <div key={index} className="page">
                        {content.pageNumber && (
                            <div className="page-number">Page {content.pageNumber}</div>
                        )}
                        <div
                            className="text-content"
                            dangerouslySetInnerHTML={{
                                __html: highlightText(content.text)
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;