import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export class GSAPController {
  private static instance: GSAPController;
  private initialized = false;

  static getInstance(): GSAPController {
    if (!GSAPController.instance) {
      GSAPController.instance = new GSAPController();
    }
    return GSAPController.instance;
  }

  init() {
    if (this.initialized) return;

    // Set GSAP defaults for premium feel
    gsap.defaults({
      duration: 1.2,
      ease: "power2.out"
    });

    // Configure ScrollTrigger for mobile optimization
    ScrollTrigger.config({
      limitCallbacks: true,
      ignoreMobileResize: true
    });

    // Initial setup
    this.setupScrollAnimations();
    this.setupMicroInteractions();
    this.initialized = true;

    // Force initial refresh and play animations
    ScrollTrigger.refresh(true);
    this.playInitialAnimations();

    // Add event listeners for various scroll scenarios
    window.addEventListener('scrollend', () => {
      ScrollTrigger.refresh(true);
    });

    window.addEventListener('resize', () => {
      ScrollTrigger.refresh(true);
    });

    // Handle programmatic scrolling
    const handleScroll = () => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh(true);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  private playInitialAnimations() {
    // Get all sections
    const sections = gsap.utils.toArray('.animate-section');
    
    // Find the first visible section
    let firstVisibleIndex = -1;
    sections.forEach((section: any, index: number) => {
      const rect = section.getBoundingClientRect();
      const isInView = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );

      if (isInView && firstVisibleIndex === -1) {
        firstVisibleIndex = index;
      }
    });

    // Animate all sections up to and including the first visible one
    sections.forEach((section: any, index: number) => {
      if (index <= firstVisibleIndex) {
        gsap.to(section, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          overwrite: true,
          delay: index * 0.1
        });

        // Animate child elements
        const childElements = section.querySelectorAll('.section-title, .animate-element');
        childElements.forEach((element: any) => {
          gsap.to(element, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            overwrite: true,
            delay: (index * 0.1) + 0.2
          });
        });
      }
    });
  }

  private setupScrollAnimations() {
    // Hero section entrance
    this.animateHero();
    
    // Section reveals with improved trigger points
    this.animateSectionReveals();
    
    // Community cards stagger
    this.animateCommunityCards();
    
    // About section
    this.animateAboutSection();
    
    // Contact section
    this.animateContactSection();
  }

  private animateHero() {
    // Create a master timeline for the hero section
    const masterTl = gsap.timeline({ delay: 0.2 });

    // Initial state
    gsap.set('.hero-title', { 
      opacity: 0,
      y: 50,
      rotationX: 15,
      transformOrigin: "50% 50% -100px"
    });
    
    gsap.set('.hero-description', { 
      opacity: 0,
      y: 30
    });
    
    gsap.set('.hero-buttons', { 
      opacity: 0,
      y: 20
    });

    // Title reveal with 3D effect
    masterTl.to('.hero-title', {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: 1.2,
      ease: "power3.out"
    })
    // Description fade in with slight delay
    .to('.hero-description', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.4")
    // Buttons reveal
    .to('.hero-buttons', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "back.out(1.7)"
    }, "-=0.3");

    // Background blobs animation
    gsap.to('.hero-blob-1', {
      x: 30,
      y: -20,
      rotation: 360,
      duration: 20,
      ease: "none",
      repeat: -1
    });

    gsap.to('.hero-blob-2', {
      x: -20,
      y: 15,
      rotation: -360,
      duration: 25,
      ease: "none",
      repeat: -1
    });
  }

  private animateSectionReveals() {
    // Generic section reveal animation with improved trigger points
    gsap.utils.toArray('.animate-section').forEach((section: any) => {
      // Set initial state
      gsap.set(section, {
        opacity: 0,
        y: 30
      });

      // Create the animation
      ScrollTrigger.create({
        trigger: section,
        start: "top 90%",
        end: "bottom 10%",
        onEnter: () => {
          // Get all sections up to and including this one
          const allSections = gsap.utils.toArray('.animate-section');
          const currentIndex = allSections.indexOf(section);
          
          // Animate all sections up to and including this one
          allSections.forEach((s: any, index: number) => {
            if (index <= currentIndex) {
              gsap.to(s, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                overwrite: true,
                delay: index * 0.1
              });

              // Animate child elements
              const childElements = s.querySelectorAll('.section-title, .animate-element');
              childElements.forEach((element: any) => {
                gsap.to(element, {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  ease: "power3.out",
                  overwrite: true,
                  delay: (index * 0.1) + 0.2
                });
              });
            }
          });
        },
        onLeaveBack: () => {
          gsap.to(section, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: "power3.out",
            overwrite: true
          });
        },
        once: false
      });
    });

    // Section titles with split animation
    gsap.utils.toArray('.section-title').forEach((title: any) => {
      // Set initial state
      gsap.set(title, {
        opacity: 0,
        y: 20,
        skewY: 3
      });

      // Create the animation
      ScrollTrigger.create({
        trigger: title,
        start: "top 90%",
        onEnter: () => {
          gsap.to(title, {
            opacity: 1,
            y: 0,
            skewY: 0,
            duration: 0.6,
            ease: "power3.out",
            overwrite: true
          });
        },
        onLeaveBack: () => {
          gsap.to(title, {
            opacity: 0,
            y: 20,
            skewY: 3,
            duration: 0.6,
            ease: "power3.out",
            overwrite: true
          });
        },
        once: false
      });
    });
  }

  private animateCommunityCards() {
    // Reset any existing animations
    gsap.set('.community-header', { clearProps: "all" });
    gsap.set('.blog-card', { clearProps: "all" });
    gsap.set('.view-all-button', { clearProps: "all" });

    // Create a master timeline for the community section
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.community',
        start: "top 70%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    });

    // Initial states
    gsap.set('.community-title', {
      opacity: 0,
      y: 30,
      rotationX: 15,
      transformOrigin: "50% 50% -100px"
    });

    gsap.set('.community-subtitle', {
      opacity: 0,
      y: 20
    });

    gsap.set('.blog-card', {
      opacity: 0,
      y: 40,
      scale: 0.95,
      rotationY: 15
    });

    gsap.set('.view-all-button', {
      opacity: 0,
      y: 20
    });

    // Header reveal
    masterTl.to('.community-title', {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: 0.5,
      ease: "power3.out"
    })
    .to('.community-subtitle', {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power2.out"
    }, "-=0.4")
    // Cards reveal with 3D effect
    .to('.blog-card', {
      opacity: 1,
      y: 0,
      scale: 1,
      rotationY: 0,
      duration: 0.4,
      stagger: {
        amount: 0.2,
        from: "start",
        grid: "auto",
        axis: "x"
      },
      ease: "power3.out"
    }, "-=0.2")
    // View all button reveal
    .to('.view-all-button', {
      opacity: 1,
      y: 0,
      duration: 0.3,
      ease: "back.out(1.7)"
    }, "-=0.3");

    // Add hover animations for cards
    gsap.utils.toArray('.blog-card').forEach((card: any) => {
      const image = card.querySelector('.blog-image');
      const content = card.querySelector('.blog-content');
      const link = card.querySelector('.blog-link');
      
      // Create hover timeline
      const hoverTl = gsap.timeline({ paused: true });
      
      hoverTl
        .to(card, {
          y: -8,
          duration: 0.4,
          ease: "power2.out"
        })
        .to(image, {
          scale: 1.05,
          duration: 0.6,
          ease: "power2.out"
        }, 0)
        .to(content, {
          y: -4,
          duration: 0.4,
          ease: "power2.out"
        }, 0)
        .to(link, {
          x: 4,
          duration: 0.3,
          ease: "power2.out"
        }, 0);

      // Add hover listeners
      card.addEventListener('mouseenter', () => hoverTl.play());
      card.addEventListener('mouseleave', () => hoverTl.reverse());
    });
  }

  private animateAboutSection() {
    // Reset any existing animations
    gsap.set('.about-title', { clearProps: "all" });
    gsap.set('.about-subtitle', { clearProps: "all" });
    gsap.set('.about-text', { clearProps: "all" });
    gsap.set('.about-image-wrapper', { clearProps: "all" });
    gsap.set('.value-card', { clearProps: "all" });
    gsap.set('.cta-stat-card', { clearProps: "all" });

    // Create a master timeline for the about section
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.about',
        start: "top 70%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    });

    // Initial states
    gsap.set('.about-title', {
      opacity: 0,
      y: 30,
      rotationX: 15,
      transformOrigin: "50% 50% -100px"
    });

    gsap.set('.about-subtitle', {
      opacity: 0,
      y: 20
    });

    gsap.set('.about-text', {
      opacity: 0,
      x: -50
    });

    gsap.set('.about-image-wrapper', {
      opacity: 0,
      x: 50,
      rotationY: 15,
      transformOrigin: "50% 50% -100px"
    });

    gsap.set('.value-card', {
      opacity: 0,
      y: 40,
      scale: 0.9,
      rotationY: 15
    });

    gsap.set('.cta-stat-card', {
      opacity: 0,
      y: 30,
      scale: 0.95
    });

    // Header reveal
    masterTl.to('.about-title', {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: 0.5,
      ease: "power3.out"
    })
    .to('.about-subtitle', {
      opacity: 1,
      y: 0,
      duration: 0.3,
      ease: "power2.out"
    }, "-=0.4")
    // Main content reveal
    .to('.about-text', {
      opacity: 1,
      x: 0,
      duration: 0.3,
      ease: "power3.out"
    }, "-=0.2")
    .to('.about-image-wrapper', {
      opacity: 1,
      x: 0,
      rotationY: 0,
      duration: 0.3,
      ease: "power3.out"
    }, "-=0.8")
    // Value cards reveal with 3D effect
    .to('.value-card', {
      opacity: 1,
      y: 0,
      scale: 1,
      rotationY: 0,
      duration: 0.3,
      stagger: {
        amount: 0.2,
        from: "start",
        grid: "auto",
        axis: "x"
      },
      ease: "power3.out"
    }, "-=0.4")
    // Stats reveal
    .to('.cta-stat-card', {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.2,
      stagger: 0.1,
      ease: "back.out(1.7)"
    }, "-=0.4");

    // Add hover animations for value cards
    const valueCards = document.querySelectorAll('.value-card');
    valueCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: 20,
          duration: 0.3,
          ease: "power2.out"
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });

    // Add hover animations for stat cards
    const statCards = document.querySelectorAll('.cta-stat-card');
    statCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -5,
          scale: 1.02,
          duration: 0.3,
          ease: "power2.out"
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });
  }

  private animateContactSection() {
    gsap.fromTo('.contact',
      {
        opacity: 0,
        y: 80
      },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: '.contact',
          start: "top 75%"
        }
      }
    );
  }

  private setupMicroInteractions() {
    // Button hover effects
    this.setupButtonHovers();
    
    // Card hover effects
    this.setupCardHovers();
    
    // Navigation interactions
    this.setupNavInteractions();
  }

  private setupButtonHovers() {
    // Primary buttons
    gsap.utils.toArray('.hero-button-primary, .inquiry-button').forEach((btn: any) => {
      const tl = gsap.timeline({ paused: true });
      
      tl.to(btn, {
        scale: 1.05,
        y: -2,
        duration: 0.3,
        ease: "power2.out"
      })
      .to(btn, {
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        duration: 0.3,
        ease: "power2.out"
      }, 0);

      btn.addEventListener('mouseenter', () => tl.play());
      btn.addEventListener('mouseleave', () => tl.reverse());
    });

    // Secondary buttons
    gsap.utils.toArray('.hero-button-secondary, .view-all-button').forEach((btn: any) => {
      const tl = gsap.timeline({ paused: true });
      
      tl.to(btn, {
        scale: 1.02,
        duration: 0.2,
        ease: "power2.out"
      });

      btn.addEventListener('mouseenter', () => tl.play());
      btn.addEventListener('mouseleave', () => tl.reverse());
    });
  }

  private setupCardHovers() {
    // Blog cards
    gsap.utils.toArray('.blog-card').forEach((card: any) => {
      const image = card.querySelector('.blog-image');
      const tl = gsap.timeline({ paused: true });
      
      tl.to(card, {
        y: -8,
        duration: 0.4,
        ease: "power2.out"
      })
      .to(image, {
        scale: 1.1,
        duration: 0.6,
        ease: "power2.out"
      }, 0)
      .to(card, {
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        duration: 0.4,
        ease: "power2.out"
      }, 0);

      card.addEventListener('mouseenter', () => tl.play());
      card.addEventListener('mouseleave', () => tl.reverse());
    });

    // Value cards
    gsap.utils.toArray('.value-card').forEach((card: any) => {
      const icon = card.querySelector('.value-icon');
      const tl = gsap.timeline({ paused: true });
      
      tl.to(card, {
        y: -5,
        duration: 0.3,
        ease: "power2.out"
      })
      .to(icon, {
        scale: 1.1,
        rotation: 5,
        duration: 0.3,
        ease: "back.out(1.7)"
      }, 0);

      card.addEventListener('mouseenter', () => tl.play());
      card.addEventListener('mouseleave', () => tl.reverse());
    });
  }

  private setupNavInteractions() {
    // Navigation buttons
    gsap.utils.toArray('.nav-button').forEach((btn: any) => {
      const tl = gsap.timeline({ paused: true });
      
      tl.to(btn, {
        y: -2,
        color: "#1e3a8a",
        duration: 0.2,
        ease: "power2.out"
      });

      btn.addEventListener('mouseenter', () => tl.play());
      btn.addEventListener('mouseleave', () => tl.reverse());
    });
  }

  destroy() {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    gsap.killTweensOf("*");
    this.initialized = false;
  }

  refresh() {
    ScrollTrigger.refresh();
  }
}

export const gsapController = GSAPController.getInstance();