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
  const [improving, setImproving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchArticle = async () => {
        try {
          const { data } = await api.get(`/articles/${id}`);
          setTitle(data.title);
          setContent(data.content);
          if (data.summary) {
            setSummary(data.summary);
          }
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
      if (isEdit) {
        const { data } = await api.put(`/articles/${id}`, { title, content, summary });
        articleResponse = data;
      } else {
        const { data } = await api.post('/articles', { title, content, summary });
        articleResponse = data;
      }

      // Auto-generate summary if missing, using AI service
      if (!summary && articleResponse?.content) {
        try {
          const { data: summaryData } = await api.post('/ai/summary', {
            text: articleResponse.content
          });
          const newSummary = summaryData.summary;
          if (newSummary) {
            setSummary(newSummary);
            // Persist generated summary back to the article
            await api.put(`/articles/${articleResponse.id}`, {
              title: articleResponse.title,
              content: articleResponse.content,
              summary: newSummary
            });
          }
        } catch (aiErr) {
          // Non-fatal: log but do not block save
          // eslint-disable-next-line no-console
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

  if (loading) return <p>Loading...</p>;

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

  return (
    <div className="page">
      <h1>{isEdit ? 'Edit Article' : 'Create Article'}</h1>
      <form className="editor-form" onSubmit={handleSubmit}>
        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label>
          Content
          <ReactQuill theme="snow" value={content} onChange={setContent} />
        </label>
        <label>
          Summary (optional, AI can auto-generate)
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Short summary of the article"
          />
        </label>
        {error && <p className="error-text">{error}</p>}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={handleImprove}
            disabled={improving || !content.trim()}
            className="secondary-button"
          >
            {improving ? 'Improving…' : 'AI Improve Content'}
          </button>
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        </div>
      </form>
    </div>
  );
}

