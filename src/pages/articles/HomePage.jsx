import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/apiClient.js';
import { formatDate } from '../../utils/dateFormatter.js';

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data } = await api.get('/articles', {
          params: query ? { search: query } : {}
        });
        const items = Array.isArray(data) ? data : data.items || [];
        setArticles(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [query]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Knowledge Articles</h1>
        <input
          type="search"
          placeholder="Search articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="article-list">
          {articles.map((article) => (
            <li key={article.id || article._id} className="article-card">
              <Link to={`/articles/${article.id || article._id}`}>
                <h2>{article.title}</h2>
                {article.summary && <p>{article.summary}</p>}
              </Link>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85em', color: '#666', marginTop: '0.5rem' }}>
                {article.author_name && <span>By {article.author_name}</span>}
                {article.created_at && <span>Created: {formatDate(article.created_at)}</span>}
                {article.category && <span style={{ color: '#0077cc' }}>{article.category}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

