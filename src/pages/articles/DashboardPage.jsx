import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/apiClient.js';
import { formatDate } from '../../utils/dateFormatter.js';
import { useAuth } from '../../context/AuthContext.jsx';

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

export default function DashboardPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchMine = async () => {
      setLoading(true);
      try {
        const params = { limit: 50, author: user.id };
        if (searchQuery) params.search = searchQuery;
        if (selectedCategory) params.category = selectedCategory;
        
        const { data } = await api.get('/articles', { params });
        const items = Array.isArray(data) ? data : data.items || [];
        setArticles(items);
      } catch (err) {
        console.error(err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(fetchMine, 300);
    return () => clearTimeout(timeoutId);
  }, [user, searchQuery, selectedCategory]);

  const handleDelete = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;

    setDeleting(articleId);
    setDeleteError('');

    try {
      await api.delete(`/articles/${articleId}`);
      setArticles(articles.filter(a => a.id !== articleId));
      setDeleting(null);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete article');
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>My Articles</h1>
        <Link to="/articles/new" className="btn btn-primary">
          + Create Article
        </Link>
      </div>

      <div className="page-controls">
        <input
          type="search"
          placeholder="Search your articles by title, content, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {(searchQuery || selectedCategory) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          <p>Loading your articles...</p>
        </div>
      ) : articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          <p>
            {searchQuery || selectedCategory
              ? 'No articles found matching your filters.'
              : 'You haven\'t created any articles yet.'
            }
          </p>
          <Link to="/articles/new" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Create Your First Article
          </Link>
        </div>
      ) : (
        <div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            <strong>{articles.length}</strong> article{articles.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedCategory && ` in ${selectedCategory}`}
          </p>
          {deleteError && (
            <div style={{ 
              padding: '0.75rem 1rem', 
              background: 'rgba(239, 68, 68, 0.1)', 
              borderLeft: '4px solid var(--error-color)',
              borderRadius: '4px',
              marginBottom: '1rem',
              color: '#fca5a5'
            }}>
              {deleteError}
            </div>
          )}
          <ul className="article-list">
            {articles.map((article) => (
              <li key={article.id || article._id} className="article-card">
                <div className="article-card-content">
                  <Link to={`/articles/${article.id || article._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="article-card-header">
                      <h2 className="article-card-title">{article.title}</h2>
                      {article.category && <span className="article-category">{article.category}</span>}
                    </div>
                    {article.summary && <p className="article-summary">{article.summary}</p>}
                  </Link>
                  <div className="article-meta">
                    {article.created_at && <span className="article-meta-item">📅 {formatDate(article.created_at)}</span>}
                    {article.updated_at && article.updated_at !== article.created_at && (
                      <span className="article-meta-item">✏️ Updated: {formatDate(article.updated_at)}</span>
                    )}
                  </div>
                  {article.tags && (
                    <div className="article-tags">
                      {article.tags
                        .split(',')
                        .map(t => t.trim())
                        .filter(Boolean)
                        .slice(0, 3)
                        .map((tag) => (
                          <span key={tag} className="article-tag">
                            #{tag}
                          </span>
                        ))}
                      {article.tags.split(',').length > 3 && (
                        <span className="article-tag">+{article.tags.split(',').length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="article-actions">
                  <Link
                    to={`/articles/${article.id || article._id}/edit`}
                    className="article-action-btn"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(article.id)}
                    disabled={deleting === article.id}
                    className="article-action-btn delete"
                  >
                    {deleting === article.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

