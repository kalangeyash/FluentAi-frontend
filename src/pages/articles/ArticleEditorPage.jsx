import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../../api/apiClient.js';

export default function ArticleEditorPage({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === 'edit';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [improving, setImproving] = useState(false);
  const [applyingPrompt, setApplyingPrompt] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categoryOptions = [
    'Tech',
    'AI',
    'Backend',
    'Frontend',
    'DevOps',
    'Full Stack',
    'Web Development',
    'Mobile Development',
    'Cloud Computing',
    'Cybersecurity',
    'Data Science',
    'Machine Learning',
    'Database',
    'System Design',
    'Software Architecture',
  ];

  useEffect(() => {
    if (isEdit) {
      const fetchArticle = async () => {
        try {
          const { data } = await api.get(`/articles/${id}`);
          setTitle(data.title);
          setContent(data.content);
          if (data.summary) setSummary(data.summary);
          if (data.category) setCategory(data.category);
          if (data.tags) setTags(data.tags);
        } catch (err) {
          console.error(err);
          setError('Failed to load article.');
        } finally {
          setLoading(false);
        }
      };
      fetchArticle();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let articleResponse;
      const payload = { title, content, summary, category, tags };

      if (isEdit) {
        const { data } = await api.put(`/articles/${id}`, payload);
        articleResponse = data;
      } else {
        const { data } = await api.post('/articles', payload);
        articleResponse = data;
      }

      // Auto-generate summary if missing
      if (!summary && articleResponse?.content) {
        try {
          const { data: summaryData } = await api.post('/ai/summary', {
            text: articleResponse.content,
          });

          const newSummary = summaryData.summary;

          if (newSummary) {
            setSummary(newSummary);

            await api.put(`/articles/${articleResponse.id}`, {
              title: articleResponse.title,
              content: articleResponse.content,
              summary: newSummary,
              category: articleResponse.category,
              tags: articleResponse.tags,
            });
          }
        } catch (aiErr) {
          console.error('Failed to auto-generate summary', aiErr);
        }
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const handleImprove = async () => {
    if (!content.trim()) return;

    setImproving(true);
    setError('');

    try {
      const { data } = await api.post('/ai/improve', { text: content });

      if (data.improved) {
        setContent(data.improved);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to improve content');
    } finally {
      setImproving(false);
    }
  };

  const handleApplyPrompt = async () => {
    if (!content.trim() || !customPrompt.trim()) return;

    setApplyingPrompt(true);
    setError('');

    try {
      const { data } = await api.post('/ai/apply-prompt', {
        text: content,
        prompt: customPrompt,
      });

      if (data.modified) {
        setContent(data.modified);
        setCustomPrompt('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply prompt');
    } finally {
      setApplyingPrompt(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading...</div>;

  return (
    <div className="editor-page">
      <div className="page-header">
        <h1>{isEdit ? '✏️ Edit Article' : '✨ Create Article'}</h1>
      </div>

      <form className="editor-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Article Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a compelling title..."
            required
            maxLength={200}
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {categoryOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Tags (comma separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            maxLength={500}
            placeholder="e.g., react, nodejs, ai, web-development"
          />
        </div>

        <div className="form-group">
          <label>Summary (optional - AI can auto-generate)</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            maxLength={1000}
            placeholder="Brief summary of your article (1000 characters max)"
            style={{ minHeight: '100px' }}
          />
          {summary.length > 0 && (
            <small style={{ color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
              {summary.length} / 1000 characters
            </small>
          )}
        </div>

        <div className="form-group">
          <label>Content</label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            className="quill-editor"
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
              ]
            }}
          />
        </div>

        <div className="custom-prompt-section">
          <h3>💡 AI Custom Prompt</h3>
          <textarea
            className="custom-prompt-textarea"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="E.g., 'Make this more technical', 'Add code examples', 'Simplify the language', 'Add more details'"
            maxLength={500}
          />
          <button
            type="button"
            onClick={handleApplyPrompt}
            disabled={applyingPrompt || !content.trim() || !customPrompt.trim()}
            className="prompt-button"
          >
            {applyingPrompt ? '⏳ Applying Changes...' : '✨ Apply Custom Changes'}
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleImprove}
            disabled={improving || !content.trim()}
            className="btn btn-secondary"
            style={{ flex: 1, minWidth: '150px' }}
          >
            {improving ? '⏳ Improving...' : '⚡ Improve with AI'}
          </button>
        </div>

        {error && (
          <div style={{ 
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            borderLeft: '4px solid var(--error-color)',
            borderRadius: '4px',
            color: '#fca5a5',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn btn-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              saving ||
              !title.trim() ||
              !content.trim() ||
              !category
            }
            className="btn btn-submit"
          >
            {saving
              ? '⏳ Saving...'
              : isEdit
              ? '💾 Update Article'
              : '✨ Create Article'}
          </button>
        </div>
      </form>
    </div>
  );
}