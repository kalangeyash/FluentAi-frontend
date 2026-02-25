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
  const [improving, setImproving] = useState(false);
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

  if (loading) return <p>Loading...</p>;

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
            maxLength={200}
          />
        </label>

        <label>
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select category</option>
            {categoryOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label>
          Tags (comma separated)
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            maxLength={500}
            placeholder="react, nodejs, ai"
          />
        </label>

        <label>
          Summary (optional, AI can auto-generate)
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            maxLength={500}
            placeholder="Optional summary"
          />
        </label>

        <label>
          Content
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
          />
        </label>

        <button
          type="button"
          onClick={handleImprove}
          disabled={improving || !content.trim()}
        >
          {improving ? 'Improving...' : 'Improve with AI'}
        </button>

        <button
          type="submit"
          disabled={
            saving ||
            !title.trim() ||
            !content.trim() ||
            !category
          }
        >
          {saving
            ? 'Saving...'
            : isEdit
            ? 'Update Article'
            : 'Create Article'}
        </button>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}