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
    if (!window.confirm('Are you sure you want to delete this article?')) return;

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

  if (loading) return <p>Loading...</p>;
  if (!article) return <p>Article not found.</p>;

  return (
    <div className="page">
      <h1>{article.title}</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', fontSize: '0.9em', color: '#666' }}>
        {article.author_name && (
          <span style={{ fontWeight: 'bold' }}>
            By {article.author_name}
          </span>
        )}
        {article.created_at && (
          <span>Created: {formatDateTime(article.created_at)}</span>
        )}
        {article.updated_at && article.created_at !== article.updated_at && (
          <span>Updated: {formatDateTime(article.updated_at)}</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
        {article.category && (
          <span
            className="article-category"
            style={{ fontWeight: 'bold', color: '#0077cc' }}
          >
            Category: {article.category}
          </span>
        )}

        
      </div>

      {article.summary && (
        <p className="article-summary">{article.summary}</p>
      )}

      <div
        className="article-content"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
      
      <hr className="border-t border-white my-10" />
      {article.tags && (
          <span className="article-tags" style={{ color: '#555' }}>
            Tags:{' '}
            {article.tags
              .split(',')
              .map(tag => tag.trim())
              .filter(Boolean)
              .map(tag => (
                <span key={tag} style={{ marginRight: 4 }}>
                  {tag}
                </span>
              ))}
          </span>
        )}

      {isAuthor && (
        <div style={{ marginTop: '2rem', marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
          <Link
            to={`/articles/${id}/edit`}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#0077cc',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            Edit Article
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: deleting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: deleting ? 0.7 : 1,
            }}
          >
            {deleting ? 'Deleting...' : 'Delete Article'}
          </button>
        </div>
      )}

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

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
    <div id="similar-articles" style={{ marginTop: '2rem' }}>
      <h3>Similar Articles</h3>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : similar.length === 0 ? (
        <p>No similar articles found.</p>
      ) : (
        <ul>
          {similar.map(a => (
            <li key={a.id}>
              <a
                href={`/articles/${a.id}`}
                style={{ fontWeight: 'bold' }}
              >
                {a.title}
              </a>

              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85em', color: '#666', marginTop: '0.25rem' }}>
                {a.author_name && <span>By {a.author_name}</span>}
                {a.created_at && <span>{formatDateTime(a.created_at)}</span>}
                {a.category && <span style={{ color: '#0077cc' }}>{a.category}</span>}
              </div>

              {a.tags && (
                <span
                  style={{ marginLeft: 8, color: '#555', fontSize: '0.85em' }}
                >
                  Tags: {a.tags}
                </span>
              )}

              {a.summary && (
                <div
                  style={{
                    fontSize: '0.9em',
                    color: '#333'
                  }}
                >
                  {a.summary}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ArticleDetailPage;