import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/apiClient.js';
import { formatDateTime } from '../../utils/dateFormatter.js';
import { useAuth } from '../../context/AuthContext.jsx';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data } = await api.get(`/articles/${id}`);
        setArticle(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  const isAuthor = user && article && user.id === article.author_id;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;

    setDeleting(true);
    setError('');

    try {
      await api.delete(`/articles/${id}`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete article');
      setDeleting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading...</div>;
  if (!article) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Article not found.</div>;

  return (
    <div className="article-detail">
      <div className="article-detail-header">
        <h1 className="article-detail-title">{article.title}</h1>

        <div className="article-detail-meta">
          {article.author_name && (
            <span className="article-detail-meta-item">
              👤 {article.author_name}
            </span>
          )}
          {article.created_at && (
            <span className="article-detail-meta-item">
              📅 Created: {formatDateTime(article.created_at)}
            </span>
          )}
          {article.updated_at && article.created_at !== article.updated_at && (
            <span className="article-detail-meta-item">
              ✏️ Updated: {formatDateTime(article.updated_at)}
            </span>
          )}
          {article.category && (
            <span className="article-category">{article.category}</span>
          )}
        </div>
      </div>

      {article.summary && (
        <div style={{ 
          padding: '1rem 1.5rem', 
          background: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          marginBottom: '2rem',
          color: 'var(--text-secondary)',
          fontStyle: 'italic'
        }}>
          {article.summary}
        </div>
      )}

      <div className="article-detail-content" dangerouslySetInnerHTML={{ __html: article.content }} />
      
      {article.tags && (
        <div style={{ marginBottom: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '600' }}>
            Tags:
          </p>
          <div className="article-tags">
            {article.tags
              .split(',')
              .map(tag => tag.trim())
              .filter(Boolean)
              .map(tag => (
                <span key={tag} className="article-tag">
                  #{tag}
                </span>
              ))}
          </div>
        </div>
      )}

      {isAuthor && (
        <div className="article-detail-actions">
          <Link
            to={`/articles/${id}/edit`}
            className="btn btn-edit"
          >
            ✏️ Edit Article
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn btn-delete"
          >
            {deleting ? 'Deleting...' : '🗑️ Delete Article'}
          </button>
        </div>
      )}

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

      <SimilarArticlesSection articleId={id} />
    </div>
  );
};

// Similar articles section (outside main component)
function SimilarArticlesSection({ articleId }) {
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    api
      .get(`/articles/${articleId}/similar`)
      .then(({ data }) => {
        // Filter out the current article by ID
        const filtered = (data.items || []).filter(item => item.id !== parseInt(articleId));
        setSimilar(filtered);
      })
      .catch(() => {
        setSimilar([]);
        setError('Failed to fetch similar articles');
      })
      .finally(() => setLoading(false));
  }, [articleId]);

  return (
    <div className="similar-articles">
      <h2 className="similar-articles-title">✨ Similar Articles</h2>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)' }}>Loading similar articles...</div>
      ) : error ? (
        <div style={{ color: 'var(--text-secondary)' }}>{error}</div>
      ) : similar.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)' }}>No similar articles found.</div>
      ) : (
        <div className="similar-articles-grid">
          {similar.map(a => (
            <Link 
              key={a.id} 
              to={`/articles/${a.id}`}
              className="similar-article-item"
            >
              <h3>{a.title}</h3>
              {a.summary && <p>{a.summary}</p>}
              <div style={{ marginTop: 'auto', paddingTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {a.author_name && <div>By {a.author_name}</div>}
                {a.category && <div style={{ marginTop: '0.25rem' }}>{a.category}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ArticleDetailPage;