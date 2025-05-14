// src/utils/documentUtils.ts
import { pdfjs } from 'react-pdf';
import mammoth from 'mammoth';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Key terms to highlight
export const KEY_TERMS = [
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

export interface DocumentText {
    text: string;
    pageNumber?: number;
}

/**
 * Extract text content from a PDF file
 * @param data PDF file as ArrayBuffer
 * @returns Promise with array of text content objects
 */
export const extractTextFromPDF = async (data: ArrayBuffer): Promise<DocumentText[]> => {
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

    return textContent;
};

/**
 * Extract text content from a DOCX file
 * @param data DOCX file as ArrayBuffer
 * @returns Promise with array containing single text content object
 */
export const extractTextFromDOCX = async (data: ArrayBuffer): Promise<DocumentText[]> => {
    const result = await mammoth.extractRawText({ arrayBuffer: data });
    return [{ text: result.value }];
};

/**
 * Highlight specified search term and key terms in text
 * @param text Text to process
 * @param searchTerm Search term to highlight
 * @param highlightKeyTerms Whether to highlight key terms
 * @returns Text with HTML markup for highlights
 */
export const highlightText = (
    text: string,
    searchTerm: string,
    highlightKeyTerms: boolean
): string => {
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
            const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');
            highlightedText = highlightedText.replace(
                regex,
                match => `<mark class="key-term-highlight">${match}</mark>`
            );
        });
    }

    return highlightedText;
};

/**
 * Determine file type from content type
 * @param contentType MIME type string
 * @returns 'pdf', 'docx', or null if unsupported
 */
export const getFileTypeFromContentType = (contentType: string): 'pdf' | 'docx' | null => {
    if (contentType.includes('pdf')) {
        return 'pdf';
    } else if (
        contentType.includes('officedocument.wordprocessingml.document') ||
        contentType.includes('msword')
    ) {
        return 'docx';
    }
    return null;
};