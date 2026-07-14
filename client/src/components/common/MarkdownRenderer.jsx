import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

/**
 * A highly optimized custom Markdown renderer for the AI response chat.
 * Parses headings, paragraphs, lists, bold/italic text, tables, and code blocks.
 */
const MarkdownRenderer = ({ content }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(null); // Track room ID verification
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!content) return null;

  // Helper to handle room link click with validation
  const handleRoomClick = async (roomId) => {
    setChecking(roomId);
    try {
      const response = await api.get(`/rooms/${roomId}`);
      if (response && response.data) {
        navigate(`/rooms/${roomId}`);
      } else {
        alert('⚠️ Phòng này không tồn tại hoặc đã bị xóa. Vui lòng tìm phòng khác trên trang Khám phá nhé!');
      }
    } catch (err) {
      alert('⚠️ Phòng này không tồn tại hoặc đã bị xóa. Vui lòng tìm phòng khác trên trang Khám phá nhé!');
    } finally {
      setChecking(null);
    }
  };

  const handleCopyCode = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // 1. Split content into code blocks vs standard text
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="markdown-body">
      {parts.map((part, partIdx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Parse code block
          const lines = part.slice(3, -3).trim().split('\n');
          let language = 'text';
          let codeLines = lines;
          if (lines.length > 0 && /^[a-zA-Z0-9+#-]+$/.test(lines[0])) {
            language = lines[0];
            codeLines = lines.slice(1);
          }
          const codeString = codeLines.join('\n');

          return (
            <div key={partIdx} className="markdown-code-block my-3 border rounded overflow-hidden">
              <div className="code-header d-flex justify-content-between align-items-center px-3 py-2 bg-light border-bottom text-muted small">
                <span>{language.toUpperCase()}</span>
                <button
                  onClick={() => handleCopyCode(codeString, partIdx)}
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 border-0"
                  style={{ fontSize: '0.75rem' }}
                >
                  {copiedIndex === partIdx ? (
                    <>
                      <Check size={14} className="text-success" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 m-0 bg-dark text-white overflow-auto" style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
                <code>{codeString}</code>
              </pre>
            </div>
          );
        }

        // Parse tables, lists, headers, paragraphs in non-code text
        const blocks = part.split(/\n{2,}/g);

        return blocks.map((block, blockIdx) => {
          const lines = block.trim().split('\n');
          if (lines.length === 0) return null;

          // 2. Parse Tables
          if (lines.length >= 2 && lines[0].includes('|') && lines[1].includes('|') && lines[1].includes('-')) {
            const parseRow = (row) => row.split('|').map(cell => cell.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
            const headers = parseRow(lines[0]);
            const rows = lines.slice(2).map(parseRow);

            return (
              <div key={`${partIdx}-${blockIdx}`} className="table-responsive my-3">
                <table className="table table-bordered table-striped align-middle m-0" style={{ fontSize: '0.9rem' }}>
                  <thead className="table-light">
                    <tr>
                      {headers.map((h, i) => <th key={i}>{inlineParser(h, handleRoomClick, checking)}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((cell, cIdx) => <td key={cIdx}>{inlineParser(cell, handleRoomClick, checking)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          // 3. Parse Headings
          if (lines[0].startsWith('#')) {
            const hMatch = lines[0].match(/^(#{1,6})\s+(.*)$/);
            if (hMatch) {
              const level = hMatch[1].length;
              const title = hMatch[2];
              const Tag = `h${level}`;
              return (
                <Tag key={`${partIdx}-${blockIdx}`} className={`markdown-h${level} my-3 font-weight-bold`}>
                  {inlineParser(title, handleRoomClick, checking)}
                </Tag>
              );
            }
          }

          // 4. Parse Lists (Consecutive list items)
          const isUnordered = lines.every(line => line.trim().startsWith('* ') || line.trim().startsWith('- ') || line.trim().startsWith('• '));
          const isOrdered = lines.every(line => /^\d+\.\s+/.test(line.trim()));

          if (isUnordered) {
            return (
              <ul key={`${partIdx}-${blockIdx}`} className="markdown-list my-2 pl-4">
                {lines.map((line, lIdx) => {
                  const cleaned = line.replace(/^[\s*•-]+\s+/, '');
                  return <li key={lIdx} className="mb-1">{inlineParser(cleaned, handleRoomClick, checking)}</li>;
                })}
              </ul>
            );
          }

          if (isOrdered) {
            return (
              <ol key={`${partIdx}-${blockIdx}`} className="markdown-list my-2 pl-4">
                {lines.map((line, lIdx) => {
                  const cleaned = line.replace(/^\d+\.\s+/, '');
                  return <li key={lIdx} className="mb-1">{inlineParser(cleaned, handleRoomClick, checking)}</li>;
                })}
              </ol>
            );
          }

          // 5. Normal Paragraph
          return (
            <p key={`${partIdx}-${blockIdx}`} className="markdown-paragraph mb-3 leading-relaxed">
              {block.split('\n').map((line, lineIdx) => (
                <React.Fragment key={lineIdx}>
                  {lineIdx > 0 && <br />}
                  {inlineParser(line, handleRoomClick, checking)}
                </React.Fragment>
              ))}
            </p>
          );
        });
      })}
    </div>
  );
};

// Inline parser for bold, italic, links, citations, and invalid indicators
function inlineParser(text, onRoomClick, checkingId) {
  if (!text) return '';

  // 1. Check for invalid room link
  if (text.includes('[link không khả dụng]')) {
    const parts = text.split('[link không khả dụng]');
    return (
      <>
        {parts.map((p, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-danger font-weight-bold" style={{ fontSize: '0.85rem' }}>❌ Link không khả dụng</span>}
            {inlineParser(p, onRoomClick, checkingId)}
          </React.Fragment>
        ))}
      </>
    );
  }

  // 2. Check for citations [1], [2], etc.
  const citationRegex = /\[(\d+)\]/g;
  if (citationRegex.test(text)) {
    citationRegex.lastIndex = 0;
    const parts = text.split(citationRegex);
    const matches = [...text.matchAll(citationRegex)];
    let matchIdx = 0;

    return (
      <>
        {parts.map((part, idx) => {
          if (idx % 2 === 1) {
            const num = matches[matchIdx++]?.[1];
            return (
              <sup key={idx} className="citation-num px-1 text-primary font-weight-bold small">
                [{num}]
              </sup>
            );
          }
          return inlineParser(part, onRoomClick, checkingId);
        })}
      </>
    );
  }

  // 3. Check for specific room detail links: http://localhost:5173/rooms/{id}
  const roomLinkRegex = /https?:\/\/localhost:\d+\/rooms\/(\d+)/g;
  if (roomLinkRegex.test(text)) {
    roomLinkRegex.lastIndex = 0;
    const parts = text.split(roomLinkRegex);
    const matches = [...text.matchAll(roomLinkRegex)];
    let matchIdx = 0;

    return (
      <>
        {parts.map((part, idx) => {
          if (idx % 2 === 1) {
            const roomId = matches[matchIdx++]?.[1];
            const isVerifying = checkingId === roomId;
            return (
              <button
                key={idx}
                onClick={() => onRoomClick(roomId)}
                className="ai-room-link inline-flex align-items-center gap-1 border-0 bg-transparent text-primary hover-underline p-0 m-0"
                style={{ verticalAlign: 'baseline', fontWeight: 500 }}
                disabled={isVerifying}
              >
                {isVerifying ? '⏳ Đang kiểm tra...' : '🏠 Xem chi tiết phòng'}
              </button>
            );
          }
          return inlineParser(part, onRoomClick, checkingId);
        })}
      </>
    );
  }

  // 4. Standard markdown links [title](url)
  const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  if (mdLinkRegex.test(text)) {
    mdLinkRegex.lastIndex = 0;
    const parts = text.split(mdLinkRegex);
    const matches = [...text.matchAll(mdLinkRegex)];
    let matchIdx = 0;

    return (
      <>
        {parts.map((part, idx) => {
          // split matches returns: prefix, group1, group2, suffix...
          // so groups are indices: 1, 2, 4, 5, 7, 8, etc. (step of 3)
          if (idx % 3 === 1) {
            const title = matches[matchIdx]?.[1];
            const url = matches[matchIdx]?.[2];
            matchIdx++;
            return (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover-underline inline-flex align-items-center gap-1"
                style={{ fontWeight: 500 }}
              >
                {title} <ExternalLink size={12} />
              </a>
            );
          }
          if (idx % 3 === 2) return null; // Skip URL part since it's processed in index % 3 === 1
          return inlineParser(part, onRoomClick, checkingId);
        })}
      </>
    );
  }

  // 5. Check for bold (**text**)
  const boldRegex = /\*\*([\s\S]+?)\*\*/g;
  if (boldRegex.test(text)) {
    boldRegex.lastIndex = 0;
    const parts = text.split(boldRegex);
    return (
      <>
        {parts.map((part, idx) => {
          if (idx % 2 === 1) {
            return <strong key={idx}>{inlineParser(part, onRoomClick, checkingId)}</strong>;
          }
          return inlineParser(part, onRoomClick, checkingId);
        })}
      </>
    );
  }

  // 6. Check for italic (*text*)
  const italicRegex = /\*([\s\S]+?)\*/g;
  if (italicRegex.test(text)) {
    italicRegex.lastIndex = 0;
    const parts = text.split(italicRegex);
    return (
      <>
        {parts.map((part, idx) => {
          if (idx % 2 === 1) {
            return <em key={idx}>{inlineParser(part, onRoomClick, checkingId)}</em>;
          }
          return inlineParser(part, onRoomClick, checkingId);
        })}
      </>
    );
  }

  // Pure string return
  return text;
}

export default MarkdownRenderer;
export { inlineParser };
