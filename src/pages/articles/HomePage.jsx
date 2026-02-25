import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/apiClient.js';

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
        setArticles(data.articles || data);
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

