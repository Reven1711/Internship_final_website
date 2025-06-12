import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './AllArticles.css';

gsap.registerPlugin(ScrollTrigger);

const categories = [
  'All',
  'Industry Trends',
  'Supply Chain',
  'Sustainability',
  'Digital',
  'Market Analysis',
];

const AllArticles = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const articles = [
    {
      id: 'chemical-industry-trends',
      title: "Chemical Industry Trends: What's Next in 2026",
      excerpt: "Explore the latest trends shaping the chemical industry in 2026, from sustainability initiatives to digital transformation.",
      date: "June 10, 2025",
      readTime: "8 min read",
      category: "Industry Trends",
      image: "/chemical industry trends in 2026.jpg"
    },
    {
      id: 'supply-chain-optimization',
      title: "Supply Chain Optimization in Chemical Industry",
      excerpt: "Learn how leading chemical companies are optimizing their supply chains with AI and digital technologies.",
      date: "June 10, 2025",
      readTime: "6 min read",
      category: "Supply Chain",
      image: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=1200&h=600&fit=crop"
    },
    {
      id: 'sustainable-chemistry',
      title: "Sustainable Chemistry: The Future of Chemical Manufacturing",
      excerpt: "Discover how sustainable chemistry is revolutionizing chemical manufacturing and creating a greener future.",
      date: "June 10, 2025",
      readTime: "7 min read",
      category: "Sustainability",
      image: "/sustainable chemistry.jpg"
    },
    {
      id: 'digital-transformation',
      title: "Digital Transformation in Chemical Manufacturing",
      excerpt: "How Industry 4.0 is revolutionizing chemical manufacturing processes and operations.",
      date: "June 9, 2025",
      readTime: "9 min read",
      category: "Digital",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=600&fit=crop"
    },
    {
      id: 'green-chemistry',
      title: "Green Chemistry: Innovations and Applications",
      excerpt: "Exploring breakthrough innovations in green chemistry and their practical applications.",
      date: "June 8, 2025",
      readTime: "10 min read",
      category: "Sustainability",
      image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&h=600&fit=crop"
    },
    {
      id: 'market-analysis',
      title: "Chemical Market Analysis: Q2 2026",
      excerpt: "Comprehensive analysis of the chemical market trends and opportunities in Q2 2026.",
      date: "June 7, 2025",
      readTime: "8 min read",
      category: "Market Analysis",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop"
    }
  ];

  const filteredArticles = selectedCategory === 'All'
    ? articles
    : articles.filter(article => article.category === selectedCategory);

  useEffect(() => {
    // Remove any previous ScrollTriggers
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    // Scroll animation for each card
    gsap.utils.toArray('.article-card').forEach((card) => {
      const el = card as HTMLElement;
      gsap.set(el, { opacity: 0, y: 50 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        onEnter: () => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        },
        once: true,
      });
    });

    // Hover animations for each card
    const cards = document.querySelectorAll('.article-card');
    cards.forEach(card => {
      const image = card.querySelector('.article-image');
      const badge = card.querySelector('.article-category');
      const arrow = card.querySelector('.read-more svg');

      // Set badge initial state
      gsap.set(badge, { opacity: 0, y: -10 });

      // Hover timeline
      const hoverTl = gsap.timeline({ paused: true });
      hoverTl
        .to(card, {
          scale: 1.03,
          y: -8,
          boxShadow: '0 25px 40px rgba(0,0,0,0.15)',
          duration: 0.4,
          ease: 'power3.out',
        })
        .to(image, {
          scale: 1.1,
          duration: 0.4,
          ease: 'power2.out',
        }, 0)
        .to(badge, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        }, 0.1)
        .to(arrow, {
          x: 6,
          duration: 0.3,
          ease: 'power2.out',
        }, 0);

      // Leave timeline
      const leaveTl = gsap.timeline({ paused: true });
      leaveTl
        .to(card, {
          scale: 1,
          y: 0,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          duration: 0.4,
          ease: 'power3.out',
        })
        .to(image, {
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
        }, 0)
        .to(badge, {
          opacity: 0,
          y: -10,
          duration: 0.3,
          ease: 'power2.out',
        }, 0)
        .to(arrow, {
          x: 0,
          duration: 0.3,
          ease: 'power2.out',
        }, 0);

      card.addEventListener('mouseenter', () => {
        hoverTl.play();
      });
      card.addEventListener('mouseleave', () => {
        leaveTl.play();
      });
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [filteredArticles]);

  return (
    <div className="articles-page">
      <div className="articles-container">
        <div className="articles-header">
          <h1>Latest Articles & Insights</h1>
          <p>Stay informed with the latest trends, innovations, and developments in the chemical industry</p>
        </div>

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn${selectedCategory === category ? ' active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="articles-grid">
          {filteredArticles.map((article) => (
            <Link 
              to={`/blog/${article.id}`} 
              key={article.id} 
              className="article-card"
            >
              <div className="article-image-container">
                <img src={article.image} alt={article.title} className="article-image" />
                <span className="article-category">{article.category}</span>
              </div>
              <div className="article-content">
                <div className="article-meta">
                  <span className="article-date">
                    <Calendar size={14} />
                    {article.date}
                  </span>
                  <span className="article-read-time">
                    <Clock size={14} />
                    {article.readTime}
                  </span>
                </div>
                <h2 className="article-title">{article.title}</h2>
                <p className="article-excerpt">{article.excerpt}</p>
                <div className="read-more">
                  Read Article
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllArticles; 