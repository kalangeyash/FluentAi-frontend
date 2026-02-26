import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/apiClient.js';
import { formatDate } from '../../utils/dateFormatter.js';

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

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const params = {};
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
    
    // Debounce search
    const timeoutId = setTimeout(fetchArticles, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory]);

  return (
    <div>
      <div className="page-header">
        <h1>Explore Articles</h1>
      </div>

      <div className="page-controls">
        <input
          type="search"
          placeholder="Search by title, content, or tags..."
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
          <p>Loading articles...</p>
        </div>
      ) : articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          <p>No articles found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Found <strong>{articles.length}</strong> article{articles.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedCategory && ` in ${selectedCategory}`}
          </p>
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
                    {article.author_name && <span className="article-meta-item">👤 {article.author_name}</span>}
                    {article.created_at && <span className="article-meta-item">📅 {formatDate(article.created_at)}</span>}
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
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

