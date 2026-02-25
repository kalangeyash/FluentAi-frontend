import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/apiClient.js';

export default function DashboardPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMine = async () => {
      try {
        const { data } = await api.get('/articles', {
          params: { page: 1, limit: 50 }
        });
        const items = Array.isArray(data) ? data : data.items || [];
        setArticles(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMine();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Articles</h1>
        <Link to="/articles/new" className="primary-button">
          New article
        </Link>
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
              <Link
                to={`/articles/${article.id || article._id}/edit`}
                className="secondary-button"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

