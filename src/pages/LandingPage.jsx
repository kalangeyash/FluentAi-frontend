import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function LandingPage() {
  const { user } = useAuth();

  const features = [
    {
      title: "AI-Powered Writing",
      description:
        "Let artificial intelligence enhance your content, improve clarity, and suggest better phrasing automatically.",
      icon: "✨",
    },
    {
      title: "Smart Organization",
      description:
        "Categorize and tag your articles effortlessly. Our system helps you organize content intelligently.",
      icon: "📁",
    },
    {
      title: "Discover & Share",
      description:
        "Find similar articles, share your insights, and build a community of knowledge enthusiasts.",
      icon: "🚀",
    },
    {
      title: "Real-time Collaboration",
      description:
        "Edit, publish, and manage your articles with a seamless modern interface.",
      icon: "⚡",
    },
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Your Creative Hub for{" "}
            <span className="gradient-text">Intelligent Writing</span>
          </h1>
          <p className="hero-subtitle">
            FluentAI empowers writers and content creators with cutting-edge AI
            technology to elevate your storytelling and reach your audience with
            impact.
          </p>
          <div className="hero-cta">
            {user ? (
              <>
                <Link to="/articles/new" className="btn btn-primary">
                  Create Article
                </Link>
                <Link to="/dashboard" className="btn btn-secondary">
                  My Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-placeholder">
            <div className="gradient-blob blob-1"></div>
            <div className="gradient-blob blob-2"></div>
            <div className="feature-icon">✨</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Powerful Features Built for You</h2>
          <p>
            Everything you need to write, organize, and share amazing content
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-large">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>


      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Transform Your Writing?</h2>
        <p>
          Join thousands of writers already using FluentAI to create better
          content
        </p>
        {!user && (
          <Link to="/signup" className="btn btn-primary btn-large">
            Start Writing Today
          </Link>
        )}
      </section>
    </div>
  );
}
