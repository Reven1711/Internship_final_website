import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import './Community.css';

const Community = () => {
  const blogs = [
    {
      id: 'chemical-industry-trends',
      title: "Chemical Industry Trends: What's Next in 2026",
      excerpt: "Explore the latest trends shaping the chemical industry in 2026, from sustainability initiatives to digital transformation.",
      date: "June 10, 2025",
      readTime: "8 min read"
    },
    {
      id: 'supply-chain-optimization',
      title: "Supply Chain Optimization in Chemical Industry",
      excerpt: "Learn how leading chemical companies are optimizing their supply chains with AI and digital technologies.",
      date: "June 10, 2025",
      readTime: "6 min read"
    },
    {
      id: 'sustainable-chemistry',
      title: "Sustainable Chemistry: The Future of Chemical Manufacturing",
      excerpt: "Discover how sustainable chemistry is revolutionizing chemical manufacturing and creating a greener future.",
      date: "June 10, 2025",
      readTime: "7 min read"
    }
  ];

  useEffect(() => {
    // Initialize blog card animations
    const blogCards = document.querySelectorAll('.blog-card');
    
    blogCards.forEach(card => {
      const content = card.querySelector('.blog-card-content');
      const description = card.querySelector('.blog-excerpt');
      const readMore = card.querySelector('.blog-link');
      const arrow = card.querySelector('.blog-link svg');

      // Create hover timeline
      const hoverTl = gsap.timeline({ paused: true });

      // Card hover in animation
      hoverTl
        .to(card, {
          scale: 1.05,
          y: -10,
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
          duration: 0.4,
          ease: 'power3.out'
        })
        .to([description, readMore], {
          y: 0,
          opacity: 1,
          duration: 0.3,
          stagger: 0.1,
          ease: 'power2.out'
        }, '-=0.2')
        .to(arrow, {
          x: 5,
          duration: 0.3,
          ease: 'power2.out'
        }, '-=0.2');

      // Card hover out animation
      const leaveTl = gsap.timeline({ paused: true });
      leaveTl
        .to(card, {
          scale: 1,
          y: 0,
          boxShadow: '0 0 0 rgba(0,0,0,0)',
          duration: 0.4,
          ease: 'power3.out'
        })
        .to([description, readMore], {
          y: 10,
          opacity: 0.5,
          duration: 0.3,
          stagger: 0.1,
          ease: 'power2.out'
        }, '-=0.2')
        .to(arrow, {
          x: 0,
          duration: 0.3,
          ease: 'power2.out'
        }, '-=0.2');

      // Add event listeners
      card.addEventListener('mouseenter', () => {
        hoverTl.play();
      });

      card.addEventListener('mouseleave', () => {
        leaveTl.play();
      });
    });

    // Cleanup function
    return () => {
      blogCards.forEach(card => {
        card.removeEventListener('mouseenter', () => {});
        card.removeEventListener('mouseleave', () => {});
      });
    };
  }, []);

  return (
    <section className="community">
      <div className="community-container">
        <div className="community-header">
          <h2 className="community-title">Community & Insights</h2>
          <p className="community-subtitle">Stay updated with the latest trends and insights in the chemical industry</p>
        </div>

        <div className="blog-grid">
          {blogs.map((blog) => (
            <Link 
              to={`/blog/${blog.id}`} 
              key={blog.id} 
              className="blog-card"
              onClick={() => console.log('Navigating to:', `/blog/${blog.id}`)}
            >
              <div className="blog-card-content">
                <div className="blog-meta">
                  <span className="blog-date">{blog.date}</span>
                  <span className="blog-read-time">{blog.readTime}</span>
                </div>
                <h3 className="blog-title">{blog.title}</h3>
                <p className="blog-excerpt">{blog.excerpt}</p>
                <div className="blog-link">
                  Read More
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="community-cta">
          <Link to="/articles" className="view-all-button">
            View All Articles
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Community;
