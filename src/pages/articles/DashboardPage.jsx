import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
    if (!window.confirm('Are you sure you want to delete this article?')) return;

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
    <div className="page">
      <div className="page-header">
        <h1>My Articles</h1>
        <Link to="/articles/new" className="primary-button">
          New article
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Search (Title, Content, Tags)
          </label>
          <input
            type="search"
            placeholder="Search your articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Filter by Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="">All Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {(searchQuery || selectedCategory) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
            }}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : articles.length === 0 ? (
        <p>No articles found. Try adjusting your search or filters.</p>
      ) : (
        <div>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            {articles.length} article{articles.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedCategory && ` in ${selectedCategory}`}
          </p>
          {deleteError && <p style={{ color: 'red', marginBottom: '1rem' }}>{deleteError}</p>}
          <ul className="article-list">
            {articles.map((article) => (
              <li key={article.id || article._id} className="article-card">
                <Link to={`/articles/${article.id || article._id}`}>
                  <h2>{article.title}</h2>
                  {article.summary && <p>{article.summary}</p>}
                </Link>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85em', color: '#666', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {article.created_at && <span>Created: {formatDate(article.created_at)}</span>}
                  {article.category && <span style={{ color: '#0077cc', fontWeight: 'bold' }}>{article.category}</span>}
                  {article.tags && (
                    <span style={{ color: '#666' }}>
                      Tags: {article.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3).join(', ')}
                      {article.tags.split(',').length > 3 ? '...' : ''}
                    </span>
                  )}
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <Link
                    to={`/articles/${article.id || article._id}/edit`}
                    className="secondary-button"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(article.id)}
                    disabled={deleting === article.id}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: deleting === article.id ? 'not-allowed' : 'pointer',
                      opacity: deleting === article.id ? 0.7 : 1,
                    }}
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

