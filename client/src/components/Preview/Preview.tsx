import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PreviewProps {
  content: string;
}

export function Preview({ content }: PreviewProps) {
  return (
    <div className="preview-container">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
