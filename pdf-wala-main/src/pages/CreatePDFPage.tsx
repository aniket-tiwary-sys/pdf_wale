import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Bold, Heading1, Heading2, Italic, List, Trash2, Underline } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/common/Button';
import { PDFService } from '../services/pdfService';

type DraftPage = { id: string; title: string; html: string; preview: string };

export const CreatePDFPage: React.FC = () => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [title, setTitle] = React.useState('');
  const [pages, setPages] = React.useState<DraftPage[]>([]);
  const [fontFamily, setFontFamily] = React.useState('serif');
  const [error, setError] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    const raw = localStorage.getItem('docforge_import_draft');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as { title?: string; text?: string };
      if (parsed.title) setTitle(parsed.title);
      if (editorRef.current && parsed.text) {
        const escaped = parsed.text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        editorRef.current.innerHTML = escaped.replace(/\n/g, '<br/>');
      }
      localStorage.removeItem('docforge_import_draft');
    } catch (err) {
      console.error('Failed to load imported draft', err);
      localStorage.removeItem('docforge_import_draft');
    }
  }, []);

  const runCmd = (cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value ?? '');
  };

  const applyFont = (value: string) => {
    setFontFamily(value);
    runCmd('fontName', value === 'serif' ? 'Times New Roman' : value === 'mono' ? 'Courier New' : 'Arial');
  };

  const getEditorContent = () => {
    const html = editorRef.current?.innerHTML?.trim() || '';
    const preview = editorRef.current?.innerText?.trim() || '';
    return { html, preview };
  };

  const addSection = () => {
    const { html, preview } = getEditorContent();
    if (!title.trim() && !preview.trim()) {
      setError('Add title or content first.');
      return;
    }

    setPages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        title: title.trim() || `Section ${prev.length + 1}`,
        html: html || '<p></p>',
        preview: preview || '(Empty section)',
      },
    ]);

    setTitle('');
    if (editorRef.current) editorRef.current.innerHTML = '';
    setError(null);
  };

  const editSection = (id: string) => {
    const section = pages.find((p) => p.id === id);
    if (!section) return;
    setTitle(section.title);
    if (editorRef.current) editorRef.current.innerHTML = section.html;
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const removeSection = (id: string) => setPages((prev) => prev.filter((p) => p.id !== id));

  const moveSection = (index: number, dir: 'up' | 'down') => {
    setPages((prev) => {
      const next = [...prev];
      const target = dir === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const createPDF = async () => {
    if (pages.length === 0) {
      setError('Add at least one section first.');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      const blob = await PDFService.createPDFFromRichSections(
        pages.map((p) => ({ title: p.title, html: p.html }))
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'created-document.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Failed to create PDF.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">Create PDF</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Docs-style editor with formatting and section ordering</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 p-6 rounded-2xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Section title"
                className="w-full mb-4 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-4 py-2 text-gray-900 dark:text-white"
              />

              <div className="flex flex-wrap gap-2 mb-3">
                <Button size="sm" variant="outline" onClick={() => runCmd('bold')}><Bold className="w-4 h-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => runCmd('italic')}><Italic className="w-4 h-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => runCmd('underline')}><Underline className="w-4 h-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => runCmd('formatBlock', 'H1')}><Heading1 className="w-4 h-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => runCmd('formatBlock', 'H2')}><Heading2 className="w-4 h-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => runCmd('insertUnorderedList')}><List className="w-4 h-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => runCmd('justifyLeft')}>L</Button>
                <Button size="sm" variant="outline" onClick={() => runCmd('justifyCenter')}>C</Button>
                <Button size="sm" variant="outline" onClick={() => runCmd('justifyRight')}>R</Button>
                <select
                  value={fontFamily}
                  onChange={(e) => applyFont(e.target.value)}
                  className="rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 px-3 py-1.5 text-sm text-gray-900 dark:text-white"
                >
                  <option value="serif">Serif</option>
                  <option value="sans">Sans</option>
                  <option value="mono">Mono</option>
                </select>
              </div>

              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="min-h-[22rem] rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-900 p-4 text-gray-900 dark:text-white focus:outline-none"
                style={{ fontFamily: fontFamily === 'serif' ? 'Times New Roman, serif' : fontFamily === 'mono' ? 'Courier New, monospace' : 'Arial, sans-serif' }}
              />

              <div className="mt-4 flex gap-2">
                <Button onClick={addSection}>Add Section</Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setTitle('');
                    if (editorRef.current) editorRef.current.innerHTML = '';
                  }}
                >
                  Clear Editor
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2 p-6 rounded-2xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Sections ({pages.length})</h2>
              <div className="space-y-3 max-h-[34rem] overflow-y-auto pr-1">
                {pages.length === 0 && <p className="text-gray-600 dark:text-gray-400">No sections yet.</p>}
                {pages.map((section, idx) => (
                  <div key={section.id} className="p-4 rounded-lg border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900">
                    <p className="font-semibold text-gray-900 dark:text-white">{idx + 1}. {section.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">{section.preview}</p>
                    <div className="mt-3 flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => moveSection(idx, 'up')} disabled={idx === 0}><ArrowUp className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => moveSection(idx, 'down')} disabled={idx === pages.length - 1}><ArrowDown className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => editSection(section.id)}>Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => removeSection(section.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button size="lg" onClick={createPDF} loading={isCreating}>Create & Download PDF</Button>
            <Button size="lg" variant="secondary" onClick={() => { setPages([]); setError(null); }} disabled={isCreating}>Reset All</Button>
          </div>

          {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </div>
    </MainLayout>
  );
};
