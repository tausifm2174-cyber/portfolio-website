document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------------
    // 1. Loading Screen Logic
    // --------------------------------------------------------
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 1500);
    }

    // --------------------------------------------------------
    // 2. Global Overlays & Utilities (Dock, Scroll Progress)
    // --------------------------------------------------------
    const scrollProgress = document.getElementById('scroll-progress');
    const floatingDock = document.getElementById('floating-dock');
    const dockItems = document.querySelectorAll('.dock-item[href]');
    const sections = document.querySelectorAll('.section, .cinematic-hero');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Scroll Progress
        if (scrollProgress) {
            const scrollPercent = (currentScrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            scrollProgress.style.width = `${scrollPercent}%`;
        }
        
        // Floating Dock hide on scroll down
        if (floatingDock) {
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                floatingDock.classList.add('hidden');
            } else {
                floatingDock.classList.remove('hidden');
            }
        }
        lastScrollY = currentScrollY;

        // Dock Active State
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        dockItems.forEach(link => {
            link.classList.remove('active');
            if (current && link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }, { passive: true });

    // --------------------------------------------------------
    // 3. Animation Engine Overhaul (GSAP + Lenis + SplitType)
    // --------------------------------------------------------
    
    // Initialize Lenis Smooth Scroll
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            syncTouch: false,
        });
        
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }
    
    // Sync GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({ ignoreMobileResize: true });
        
        // Custom Cursor Logic Removed
        
        // Global Text Reveals (SplitType)
        if (typeof SplitType !== 'undefined') {
            const headings = document.querySelectorAll('.section-title h2, .display');
            headings.forEach(heading => {
                const splitText = new SplitType(heading, { types: 'words, chars' });
                gsap.from(splitText.chars, {
                    scrollTrigger: {
                        trigger: heading,
                        start: "top 85%",
                    },
                    y: 40,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.015,
                    ease: "back.out(1.5)"
                });
            });
        }
        
        // Global Card/Section Reveals (Replacing native .reveal CSS)
        const revealElements = gsap.utils.toArray('.reveal');
        revealElements.forEach(el => {
            gsap.fromTo(el, 
                { y: 50, opacity: 0 },
                { 
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%"
                    },
                    y: 0, 
                    opacity: 1, 
                    duration: 1,
                    ease: "power3.out"
                }
            );
        });
    }

    // --------------------------------------------------------
    // 4. Hero Section: Cinematic Overhaul Logic
    // --------------------------------------------------------
    
    // A. Mouse Spotlight
    const heroSection = document.querySelector('.cinematic-hero');
    if (heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            heroSection.style.setProperty('--mouse-x', `${x}px`);
            heroSection.style.setProperty('--mouse-y', `${y}px`);
        });

        // B. Parallax Effect for Rings and Badges
        const parallaxElements = document.querySelectorAll('[data-speed]');
        heroSection.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth - e.pageX * 2) / 100;
            const y = (window.innerHeight - e.pageY * 2) / 100;
            
            requestAnimationFrame(() => {
                parallaxElements.forEach(el => {
                    const speed = el.getAttribute('data-speed');
                    const xPos = x * speed * 100;
                    const yPos = y * speed * 100;
                    // For rings which are already translated -50% -50%
                    if (el.classList.contains('floating-ring')) {
                         el.style.transform = `translate(calc(-50% + ${xPos}px), calc(-50% + ${yPos}px))`;
                    } else {
                         el.style.transform = `translate(${xPos}px, ${yPos}px)`;
                    }
                });
            });
        });
    }

    // C. Animated Typing Effect
    const typingText = document.getElementById('typing-text');
    if (typingText) {
        const words = ['AI-powered document tools.', 'responsive web interfaces.', 'production RAG pipelines.', 'clean, accessible UIs.'];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let isWaiting = false;

        function typeEffect() {
            const currentWord = words[wordIndex];
            
            if (isDeleting) {
                typingText.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingText.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = isDeleting ? 30 : 80;

            if (!isDeleting && charIndex === currentWord.length) {
                isWaiting = true;
                typeSpeed = 2500; // Wait at the end of word
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500; // Pause before starting new word
            }

            setTimeout(typeEffect, typeSpeed);
        }
        
        // Start typing after initial load delay
        setTimeout(typeEffect, 1800);
    }

    // D. Number Counters for Hero Statistics (Real DOM-driven & authentic data)
    const statsSection = document.getElementById('hero-stats');
    let hasHeroStatsAnimated = false;

    // Reusable counter animation helper
    function animateCounter(element, target, duration = 2000) {
        if (!element || typeof target !== 'number') return;
        if (target <= 0) {
            element.innerText = '0';
            return;
        }
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.innerText = Math.ceil(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                element.innerText = target.toLocaleString();
            }
        };
        updateCounter();
    }

    function isHeroStatsInViewport() {
        if (!statsSection) return false;
        const rect = statsSection.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    function triggerHeroCounterAnimation() {
        if (hasHeroStatsAnimated) return;
        if (!isHeroStatsInViewport()) return;

        hasHeroStatsAnimated = true;
        const counterProjects = document.getElementById('counter-projects');
        const counterTech = document.getElementById('counter-technologies');
        const counterContributions = document.getElementById('counter-contributions');
        const contributionsPlus = document.getElementById('contributions-plus');

        if (counterProjects) {
            const target = +counterProjects.getAttribute('data-target') || 0;
            if (target > 0) animateCounter(counterProjects, target, 1200);
            else counterProjects.innerText = target.toString();
        }

        if (counterTech) {
            const target = +counterTech.getAttribute('data-target') || 0;
            if (target > 0) animateCounter(counterTech, target, 1500);
            else counterTech.innerText = target.toString();
        }

        if (counterContributions) {
            const targetAttr = counterContributions.getAttribute('data-target');
            if (targetAttr !== null && targetAttr !== '' && !isNaN(+targetAttr)) {
                const target = +targetAttr;
                if (target > 0) {
                    if (contributionsPlus) contributionsPlus.style.display = 'inline';
                    animateCounter(counterContributions, target, 2000);
                } else {
                    counterContributions.innerText = '0';
                    if (contributionsPlus) contributionsPlus.style.display = 'inline';
                }
            } else {
                counterContributions.innerText = '--';
                if (contributionsPlus) contributionsPlus.style.display = 'none';
            }
        }
    }

    function initHeroStats() {
        const counterProjects = document.getElementById('counter-projects');
        const counterTech = document.getElementById('counter-technologies');
        const counterContributions = document.getElementById('counter-contributions');
        const contributionsPlus = document.getElementById('contributions-plus');

        // 1. Projects Count: drive from actual rendered project cards in Selected Works (#work)
        const projectCards = document.querySelectorAll('#work .premium-project-showcase');
        const projectCount = projectCards.length;
        if (counterProjects) {
            counterProjects.setAttribute('data-target', projectCount);
        }

        // 2. Technologies Count: programmatic count of unique tech pills in pruned skills-grid
        const techPills = document.querySelectorAll('.skills-grid .tech-pill');
        const uniqueTechCount = new Set(Array.from(techPills).map(el => el.textContent.trim())).size || techPills.length;
        if (counterTech) {
            counterTech.setAttribute('data-target', uniqueTechCount);
        }

        // 3. Contributions: check cached genuine count if previously retrieved
        let cachedContributions = null;
        try {
            const raw = localStorage.getItem('gh_last_known_stats');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (typeof parsed.totalContributions === 'number') {
                    cachedContributions = parsed.totalContributions;
                }
            }
        } catch (e) {}

        if (counterContributions) {
            if (typeof cachedContributions === 'number') {
                counterContributions.setAttribute('data-target', cachedContributions);
                if (contributionsPlus) contributionsPlus.style.display = 'inline';
            } else {
                counterContributions.removeAttribute('data-target');
                counterContributions.innerText = '--';
                if (contributionsPlus) contributionsPlus.style.display = 'none';
            }
        }

        // Trigger animation immediately if visible on initial load / first paint
        if (isHeroStatsInViewport()) {
            triggerHeroCounterAnimation();
        }
    }

    initHeroStats();

    // IntersectionObserver to trigger when scrolled into view
    if (statsSection) {
        const statObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                triggerHeroCounterAnimation();
            }
        }, { threshold: 0.1 });
        statObserver.observe(statsSection);
    }

    // Safety fallback: ensure animation runs if visible after initial paint / layout or loading screen exit
    setTimeout(() => {
        if (!hasHeroStatsAnimated && isHeroStatsInViewport()) {
            triggerHeroCounterAnimation();
        }
    }, 250);

    setTimeout(() => {
        if (!hasHeroStatsAnimated && isHeroStatsInViewport()) {
            triggerHeroCounterAnimation();
        }
    }, 1600);

    // GitHub Stats Count-Up (IntersectionObserver)
    let isGhStatsInView = false;
    let isGhStatsDataReady = false;
    let hasGhStatsAnimated = false;
    let ghStatsData = null; // { followers, stars, repos }
    const ghStatsGrid = document.querySelector('.github-stats-grid');

    function triggerGhStatsAnimation() {
        if (!hasGhStatsAnimated && isGhStatsInView && isGhStatsDataReady && ghStatsData) {
            hasGhStatsAnimated = true;
            const ghFollowers = document.getElementById('gh-followers');
            const ghStars = document.getElementById('gh-stars');
            const ghRepos = document.getElementById('gh-repos');

            if (ghFollowers) {
                ghFollowers.setAttribute('data-target', ghStatsData.followers);
                if (ghStatsData.followers > 0) {
                    animateCounter(ghFollowers, ghStatsData.followers);
                } else {
                    ghFollowers.innerText = '0';
                }
            }
            if (ghStars) {
                ghStars.setAttribute('data-target', ghStatsData.stars);
                if (ghStatsData.stars > 0) {
                    animateCounter(ghStars, ghStatsData.stars);
                } else {
                    ghStars.innerText = '0';
                }
            }
            if (ghRepos) {
                ghRepos.setAttribute('data-target', ghStatsData.repos);
                if (ghStatsData.repos > 0) {
                    animateCounter(ghRepos, ghStatsData.repos);
                } else {
                    ghRepos.innerText = '0';
                }
            }
        }
    }

    if (ghStatsGrid) {
        const ghStatObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                isGhStatsInView = true;
                triggerGhStatsAnimation();
            }
        }, { threshold: 0.3 });
        ghStatObserver.observe(ghStatsGrid);
    }

    // --------------------------------------------------------
    // 5. Skills Section: 3D Tilt Logic
    // --------------------------------------------------------
    const skillCards = document.querySelectorAll('.skill-3d-card');
    
    // Only apply 3D tilt on devices with hover capability (desktops/laptops)
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        skillCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                
                // Calculate mouse position relative to the card
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // For the inner glow position
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
                
                // Calculate tilt angles (max 10 degrees)
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            
            card.addEventListener('mouseleave', () => {
                // Reset tilt smoothly
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
            });
        });

        // 5b. Magnetic Hover on Hero CTA Buttons
        const heroButtons = document.querySelectorAll('.hero-btn');
        heroButtons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const dx = (e.clientX - centerX) * 0.3; // ~30% of distance, capped below
                const dy = (e.clientY - centerY) * 0.3;
                const maxOffset = 7;
                const clampedDx = Math.max(-maxOffset, Math.min(maxOffset, dx));
                const clampedDy = Math.max(-maxOffset, Math.min(maxOffset, dy));
                btn.style.transform = `translate(${clampedDx}px, ${clampedDy}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                if (typeof gsap !== 'undefined') {
                    gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1, 0.5)', clearProps: 'transform' });
                } else {
                    btn.style.transform = '';
                }
            });
        });
    }

    // 6. Featured Projects: Filtering Logic (Moved to bottom)
    
    // 7. Parallax for iPhone Mockups on Scroll
    const parallaxItems = document.querySelectorAll('.parallax-item');
    window.addEventListener('scroll', () => {
        parallaxItems.forEach(item => {
            const speed = 0.1;
            const rect = item.getBoundingClientRect();
            if(rect.top < window.innerHeight && rect.bottom > 0) {
                 item.style.transform = `translateY(${(rect.top - window.innerHeight/2) * speed}px)`;
            }
        });
    }, { passive: true });

    // --------------------------------------------------------
    // 8. Learning Roadmap Scroll Animation
    // --------------------------------------------------------
    const roadmapContainer = document.querySelector('.roadmap-container');
    const roadmapFill = document.getElementById('roadmapFill');
    const roadmapNodes = document.querySelectorAll('.roadmap-node');

    if (roadmapContainer && roadmapFill) {
        const updateRoadmap = () => {
            const containerRect = roadmapContainer.getBoundingClientRect();
            const containerTop = containerRect.top;
            const containerHeight = containerRect.height;
            const windowHeight = window.innerHeight;

            // Calculate how far we've scrolled into the container
            // Line starts drawing when the top of container hits middle of screen
            let scrollPercentage = (windowHeight / 2 - containerTop) / containerHeight;
            
            // Clamp between 0 and 1
            scrollPercentage = Math.max(0, Math.min(1, scrollPercentage));
            
            // Apply height to the fill line
            roadmapFill.style.height = `${scrollPercentage * 100}%`;

            // Check nodes to activate them
            roadmapNodes.forEach(node => {
                const nodeRect = node.getBoundingClientRect();
                const nodeCenter = nodeRect.top + (nodeRect.height / 2);
                
                // If the middle of the screen has passed the node center
                if (windowHeight / 2 > nodeCenter) {
                    node.classList.add('active');
                    // Apply dynamic color from data attribute
                    const color = node.getAttribute('data-color');
                    if (color) {
                        node.style.setProperty('--node-color', color);
                    }
                } else {
                    node.classList.remove('active');
                }
            });
        };

        window.addEventListener('scroll', updateRoadmap, { passive: true });
        // Initial check
        updateRoadmap();
    }

    // --------------------------------------------------------
    // 8b. Language Progress Bars Scroll Animation
    // --------------------------------------------------------
    const bentoLanguages = document.querySelector('.bento-languages');
    if (bentoLanguages && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        const progressBars = bentoLanguages.querySelectorAll('.progress[data-width]');
        ScrollTrigger.create({
            trigger: bentoLanguages,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                progressBars.forEach((bar, i) => {
                    const targetWidth = bar.getAttribute('data-width');
                    gsap.to(bar, {
                        width: targetWidth,
                        duration: 1.2,
                        delay: i * 0.15,
                        ease: 'power3.out'
                    });
                });
            }
        });
    }

    // --------------------------------------------------------
    // 8c. Bento Location Card Toggle (Current vs College)
    // --------------------------------------------------------
    const bentoLocation = document.querySelector('.bento-location');
    if (bentoLocation) {
        let isCollege = false;
        const currentView = bentoLocation.querySelector('.loc-view-current');
        const collegeView = bentoLocation.querySelector('.loc-view-college');
        const pills = bentoLocation.querySelectorAll('.loc-pill');
        const announcer = document.getElementById('loc-live-announcer');

        function toggleLocation(forceState) {
            isCollege = forceState !== undefined ? forceState : !isCollege;
            if (isCollege) {
                if (currentView) currentView.classList.remove('active');
                if (collegeView) collegeView.classList.add('active');
                pills.forEach(p => {
                    const isTarget = p.getAttribute('data-loc-target') === 'college';
                    p.classList.toggle('active', isTarget);
                    p.setAttribute('aria-selected', isTarget ? 'true' : 'false');
                });
                bentoLocation.setAttribute('aria-label', 'Location: SJB Institute of Technology, Kengeri, Bengaluru. Switch to City location with buttons.');
                if (announcer) announcer.textContent = 'Showing SJB Institute of Technology, Kengeri, Bengaluru';
            } else {
                if (currentView) currentView.classList.add('active');
                if (collegeView) collegeView.classList.remove('active');
                pills.forEach(p => {
                    const isTarget = p.getAttribute('data-loc-target') === 'current';
                    p.classList.toggle('active', isTarget);
                    p.setAttribute('aria-selected', isTarget ? 'true' : 'false');
                });
                bentoLocation.setAttribute('aria-label', 'Location: Bengaluru, Karnataka, India. Switch to College location with buttons.');
                if (announcer) announcer.textContent = 'Showing Bengaluru, Karnataka, India';
            }
        }

        bentoLocation.addEventListener('click', (e) => {
            const pill = e.target.closest('.loc-pill');
            if (pill) {
                e.stopPropagation();
                const target = pill.getAttribute('data-loc-target');
                toggleLocation(target === 'college');
                return;
            }
            toggleLocation();
        });

        bentoLocation.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleLocation();
            }
        });
    }

    // --------------------------------------------------------
    // 9. GitHub API Integration
    // --------------------------------------------------------
    async function fetchGitHubData() {
        const reposContainer = document.getElementById('github-repos-container');
        const errorMsg = document.getElementById('gh-error-msg');
        const recentlyActiveEl = document.getElementById('gh-recently-active');

        const renderRepoCards = (repos) => {
            if (!reposContainer || !Array.isArray(repos) || repos.length === 0) return;
            const langColors = {
                'JavaScript': '#f1e05a',
                'TypeScript': '#3178c6',
                'Python': '#3572A5',
                'HTML': '#e34c26',
                'CSS': '#563d7c',
                'React': '#61dafb'
            };

            reposContainer.innerHTML = ''; // Clear skeletons
            repos.forEach((repo, index) => {
                const langColor = langColors[repo.language] || '#8b949e';
                const repoHtml = `
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;" class="card repo-card reveal active" style="transition-delay: ${index * 0.1}s; opacity: 1; transform: translateY(0);">
                        <div class="repo-header">
                            <h4 class="h4" style="color: var(--accent-primary); display: flex; align-items: center; gap: 0.5rem; word-break: break-all;">
                                <i class="ph ph-book-bookmark"></i> ${repo.name}
                            </h4>
                            <div class="repo-stats">
                                <span><i class="ph ph-star"></i> ${repo.stargazers_count || 0}</span>
                                <span><i class="ph ph-git-fork"></i> ${repo.forks_count || 0}</span>
                            </div>
                        </div>
                        <p class="text-muted text-sm" style="margin-bottom: 1.5rem; flex-grow: 1;">${repo.description || 'No description provided.'}</p>
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <div style="width: 12px; height: 12px; border-radius: 50%; background: ${langColor};"></div>
                            <span class="text-mono text-muted">${repo.language || 'Code'}</span>
                        </div>
                    </a>
                `;
                reposContainer.innerHTML += repoHtml;
            });
        };

        const renderDirectGitHubNotice = () => {
            if (!reposContainer) return;
            reposContainer.innerHTML = `
                <div class="card repo-fallback-notice reveal active" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; opacity: 1; transform: translateY(0);">
                    <i class="ph ph-github-logo" style="font-size: 2.5rem; color: var(--accent-primary); display: block; margin: 0 auto 0.75rem;"></i>
                    <h4 class="h4" style="margin-bottom: 0.5rem;">Explore Projects on GitHub</h4>
                    <p class="text-muted text-sm" style="max-width: 500px; margin: 0 auto 1.5rem;">
                        Live repository highlights are currently syncing. You can explore active repositories, recent commits, and source code directly on GitHub.
                    </p>
                    <a href="https://github.com/tausifm2174-cyber?tab=repositories" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 0.5rem;">
                        <span>View All Repositories</span>
                        <i class="ph ph-arrow-up-right"></i>
                    </a>
                </div>
            `;
        };

        const applyStatsFallback = () => {
            let cachedStats = null;
            try {
                const raw = localStorage.getItem('gh_last_known_stats');
                if (raw) cachedStats = JSON.parse(raw);
            } catch (e) {
                // Ignore storage errors
            }

            if (cachedStats && typeof cachedStats.followers === 'number') {
                ghStatsData = {
                    followers: cachedStats.followers,
                    stars: cachedStats.stars,
                    repos: cachedStats.repos
                };
                isGhStatsDataReady = true;
                triggerGhStatsAnimation();

                // Restore hero contributions if available in cache
                const counterContributions = document.getElementById('counter-contributions');
                const contributionsPlus = document.getElementById('contributions-plus');
                if (counterContributions) {
                    if (typeof cachedStats.totalContributions === 'number') {
                        counterContributions.setAttribute('data-target', cachedStats.totalContributions);
                        if (contributionsPlus) contributionsPlus.style.display = 'inline';
                        animateCounter(counterContributions, cachedStats.totalContributions, 2000);
                    } else {
                        counterContributions.removeAttribute('data-target');
                        counterContributions.innerText = '--';
                        if (contributionsPlus) contributionsPlus.style.display = 'none';
                    }
                }
            } else {
                // No genuine previous data exists: set "--" instead of invented numbers
                const ghFollowers = document.getElementById('gh-followers');
                const ghStars = document.getElementById('gh-stars');
                const ghRepos = document.getElementById('gh-repos');
                if (ghFollowers) ghFollowers.innerText = '--';
                if (ghStars) ghStars.innerText = '--';
                if (ghRepos) ghRepos.innerText = '--';
                hasGhStatsAnimated = true;

                const counterContributions = document.getElementById('counter-contributions');
                const contributionsPlus = document.getElementById('contributions-plus');
                if (counterContributions) {
                    counterContributions.removeAttribute('data-target');
                    counterContributions.innerText = '--';
                    if (contributionsPlus) contributionsPlus.style.display = 'none';
                }
            }
        };

        try {
            const res = await fetch('/api/github-stats');
            if (!res.ok) throw new Error(`Serverless endpoint returned HTTP ${res.status}`);
            const data = await res.json();

            // If backend returned a fallback flag or unsuccessful response
            if (!data.success || data.fallback) {
                applyStatsFallback();
            } else {
                // 1. Authentic Follower, Star, Repo counts for GitHub Bento section
                ghStatsData = {
                    followers: typeof data.followers === 'number' ? data.followers : 0,
                    stars: typeof data.stars === 'number' ? data.stars : 0,
                    repos: typeof data.repos === 'number' ? data.repos : 0
                };

                // Cache genuine values for resilient fallback in subsequent visits
                try {
                    localStorage.setItem('gh_last_known_stats', JSON.stringify({
                        followers: ghStatsData.followers,
                        stars: ghStatsData.stars,
                        repos: ghStatsData.repos,
                        totalContributions: data.totalContributions,
                        cachedAt: new Date().toISOString()
                    }));
                } catch (e) {
                    // Ignore storage quota/permission issues
                }

                isGhStatsDataReady = true;
                triggerGhStatsAnimation();
            }

            // 2. Hero Contributions counter (authentic GitHub contribution data only)
            const counterContributions = document.getElementById('counter-contributions');
            const contributionsPlus = document.getElementById('contributions-plus');
            if (counterContributions) {
                if (typeof data.totalContributions === 'number') {
                    counterContributions.setAttribute('data-target', data.totalContributions);
                    if (contributionsPlus) contributionsPlus.style.display = 'inline';
                    animateCounter(counterContributions, data.totalContributions, 2000);
                } else {
                    // If totalContributions is null (e.g. no token configured), check genuine cache or display honest '--'
                    let cachedContrib = null;
                    try {
                        const raw = localStorage.getItem('gh_last_known_stats');
                        if (raw) {
                            const parsed = JSON.parse(raw);
                            if (typeof parsed.totalContributions === 'number') cachedContrib = parsed.totalContributions;
                        }
                    } catch (e) {}

                    if (typeof cachedContrib === 'number') {
                        counterContributions.setAttribute('data-target', cachedContrib);
                        if (contributionsPlus) contributionsPlus.style.display = 'inline';
                        animateCounter(counterContributions, cachedContrib, 2000);
                    } else {
                        counterContributions.removeAttribute('data-target');
                        counterContributions.innerText = '--';
                        if (contributionsPlus) contributionsPlus.style.display = 'none';
                    }
                }
            }

            // 3. Recently Active status line
            if (recentlyActiveEl && data.recentlyActive && data.recentlyActive.pushed_at) {
                const pushedAt = new Date(data.recentlyActive.pushed_at);
                const now = new Date();
                const diffMs = now - pushedAt;
                const diffSec = Math.floor(diffMs / 1000);
                const diffMin = Math.floor(diffSec / 60);
                const diffHr = Math.floor(diffMin / 60);
                const diffDays = Math.floor(diffHr / 24);
                const diffWeeks = Math.floor(diffDays / 7);
                let relativeTime;
                if (diffSec < 60) relativeTime = 'just now';
                else if (diffMin < 60) relativeTime = `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
                else if (diffHr < 24) relativeTime = `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
                else if (diffDays < 7) relativeTime = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
                else relativeTime = `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;

                recentlyActiveEl.innerHTML = `<i class="ph ph-pulse"></i> Recently active on <strong>${data.recentlyActive.name}</strong> · ${relativeTime}`;
                recentlyActiveEl.style.display = 'flex';
            }

            // 4. Render repositories or direct GitHub notice
            if (Array.isArray(data.recentRepos) && data.recentRepos.length > 0) {
                renderRepoCards(data.recentRepos);
            } else {
                renderDirectGitHubNotice();
            }

            // If it was a fallback response, show graceful non-intrusive notice
            if (data.fallback && errorMsg) {
                errorMsg.innerHTML = '<i class="ph ph-info text-primary"></i> GitHub highlights are syncing with live activity. View full profile on <a href="https://github.com/tausifm2174-cyber" target="_blank" rel="noopener noreferrer" style="color: var(--accent-primary); text-decoration: underline;">GitHub</a>.';
                errorMsg.style.display = 'block';
            } else if (errorMsg) {
                errorMsg.style.display = 'none';
            }

        } catch (error) {
            console.warn('GitHub API route unavailable; using genuine cached stats or direct link:', error);

            // Apply last known good values or set "--"
            applyStatsFallback();

            // Direct GitHub messaging instead of invented cards
            renderDirectGitHubNotice();

            // Provide a graceful fallback notice
            if (errorMsg) {
                errorMsg.innerHTML = '<i class="ph ph-info text-primary"></i> GitHub highlights are syncing with live activity. View full profile on <a href="https://github.com/tausifm2174-cyber" target="_blank" rel="noopener noreferrer" style="color: var(--accent-primary); text-decoration: underline;">GitHub</a>.';
                errorMsg.style.display = 'block';
            }
        }
    }

    // Call the function
    fetchGitHubData();

    // --------------------------------------------------------
    // 10. Contact Form Interactions
    // --------------------------------------------------------
    const contactForm = document.getElementById('contactForm');
    const formInputs = document.querySelectorAll('.form-input');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm) {
        // Handle floating label states for pre-filled inputs
        formInputs.forEach(input => {
            input.addEventListener('input', () => {
                if (input.value.trim() !== '') {
                    input.parentElement.classList.add('has-value');
                } else {
                    input.parentElement.classList.remove('has-value');
                }
            });
        });

        // Handle Form Submission
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');
            const btnSuccess = submitBtn.querySelector('.btn-success');
            const btnError = submitBtn.querySelector('.btn-error');
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            // Set Loading State
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnSuccess.style.display = 'none';
            btnError.style.display = 'none';
            btnLoader.style.display = 'inline-block';
            
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });

                if (!response.ok) throw new Error('API response not ok');
                
                // Set Success State
                btnLoader.style.display = 'none';
                btnSuccess.style.display = 'inline-block';
                submitBtn.style.background = '#10B981'; // Green success color
                submitBtn.style.color = '#fff';
                submitBtn.style.borderColor = '#10B981';
                
                // Clear Form
                contactForm.reset();
                formInputs.forEach(input => input.parentElement.classList.remove('has-value'));
            } catch (error) {
                console.error('Contact Form Error:', error);
                
                // Set Error State
                btnLoader.style.display = 'none';
                btnError.style.display = 'inline-block';
                submitBtn.style.background = '#EF4444'; // Red error color
                submitBtn.style.color = '#fff';
                submitBtn.style.borderColor = '#EF4444';
            } finally {
                // Reset Button after 3 seconds
                setTimeout(() => {
                    submitBtn.disabled = false;
                    btnSuccess.style.display = 'none';
                    btnError.style.display = 'none';
                    btnText.style.display = 'inline-block';
                    // Revert to original styles
                    submitBtn.style.background = '';
                    submitBtn.style.color = '';
                    submitBtn.style.borderColor = '';
                }, 3000);
            }
        });
    }

    // --------------------------------------------------------
    // 11. Footer Current Year
    // --------------------------------------------------------
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --------------------------------------------------------
    // 12. Theme Switcher
    // --------------------------------------------------------
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            if (htmlElement.getAttribute('data-theme') === 'light') {
                htmlElement.removeAttribute('data-theme');
                themeToggleBtn.innerHTML = '<i class="ph ph-moon"></i>';
            } else {
                htmlElement.setAttribute('data-theme', 'light');
                themeToggleBtn.innerHTML = '<i class="ph ph-sun"></i>';
            }
        });
    }

    // --------------------------------------------------------
    // 13. Command Palette (Ctrl+K)
    // --------------------------------------------------------
    const cmdOverlay = document.getElementById('command-palette');
    const cmdTrigger = document.getElementById('cmd-trigger');
    const cmdInput = document.getElementById('cmd-input');
    const cmdResults = document.getElementById('cmd-results');

    const commands = [
        { title: 'Home', icon: 'house', action: () => window.location.hash = '#home' },
        { title: 'About Me', icon: 'user', action: () => window.location.hash = '#about' },
        { title: 'Projects', icon: 'folder-notch', action: () => window.location.hash = '#work' },
        { title: 'Experience', icon: 'briefcase', action: () => window.location.hash = '#experience' },
        { title: 'Contact', icon: 'envelope', action: () => window.location.hash = '#contact' },
        { title: 'Toggle Theme', icon: 'moon', action: () => themeToggleBtn?.click() },
        { title: 'Download Resume', icon: 'download-simple', action: () => alert('Downloading resume...') }
    ];

    let selectedCmdIndex = 0;

    function renderCommands(query = '') {
        const filtered = commands.filter(cmd => cmd.title.toLowerCase().includes(query.toLowerCase()));
        cmdResults.innerHTML = '';
        
        filtered.forEach((cmd, idx) => {
            const item = document.createElement('div');
            item.className = `cmd-item ${idx === selectedCmdIndex ? 'selected' : ''}`;
            item.innerHTML = `<i class="ph ph-${cmd.icon}"></i> <span>${cmd.title}</span>`;
            
            // Hover selects item natively
            item.addEventListener('mouseenter', () => {
                selectedCmdIndex = idx;
                renderCommands(query);
            });
            
            item.addEventListener('click', () => {
                cmd.action();
                closeCmdPalette();
            });
            cmdResults.appendChild(item);
        });
    }

    function openCmdPalette() {
        if (cmdOverlay) {
            cmdOverlay.classList.add('active');
            cmdInput.value = '';
            selectedCmdIndex = 0;
            renderCommands();
            setTimeout(() => cmdInput.focus(), 100);
        }
    }

    function closeCmdPalette() {
        if (cmdOverlay) {
            cmdOverlay.classList.remove('active');
            cmdInput.blur();
        }
    }

    if (cmdTrigger) cmdTrigger.addEventListener('click', openCmdPalette);

    if (cmdOverlay) {
        cmdOverlay.addEventListener('click', (e) => {
            if (e.target === cmdOverlay) closeCmdPalette();
        });

        cmdInput.addEventListener('input', (e) => {
            selectedCmdIndex = 0;
            renderCommands(e.target.value);
        });

        document.addEventListener('keydown', (e) => {
            // Ctrl+K to open
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                cmdOverlay.classList.contains('active') ? closeCmdPalette() : openCmdPalette();
            }
            // ESC to close
            if (e.key === 'Escape') {
                closeCmdPalette();
            }
            
            if (!cmdOverlay.classList.contains('active')) return;

            const visibleItems = document.querySelectorAll('.cmd-item');
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedCmdIndex = (selectedCmdIndex + 1) % visibleItems.length;
                renderCommands(cmdInput.value);
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedCmdIndex = (selectedCmdIndex - 1 + visibleItems.length) % visibleItems.length;
                renderCommands(cmdInput.value);
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                if (visibleItems[selectedCmdIndex]) {
                    visibleItems[selectedCmdIndex].click();
                }
            }
        });
    }

    // --------------------------------------------------------
    // 14. Image Lightbox
    // --------------------------------------------------------
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const projectImages = document.querySelectorAll('.macbook-screen, .iphone-mockup');

    if (lightbox && lightboxImg) {
        projectImages.forEach(container => {
            container.style.cursor = 'pointer'; 
            container.addEventListener('click', () => {
                // Find inner div with background image
                const innerEl = container.querySelector('.macbook-content, .iphone-screen');
                if (innerEl) {
                    const bgImage = window.getComputedStyle(innerEl).backgroundImage;
                    const urlRegex = /url\("?(.+?)"?\)/;
                    const match = bgImage.match(urlRegex);
                    if (match && match[1]) {
                        lightboxImg.src = match[1];
                        lightbox.classList.add('active');
                    }
                }
            });
        });

        const closeLightbox = () => lightbox.classList.remove('active');
        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    // --------------------------------------------------------
    // 15. Easter Egg (Type 'tausif')
    // --------------------------------------------------------
    let typedKeys = '';
    const secretCode = 'tausif';
    document.addEventListener('keydown', (e) => {
        // Ignore if typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key.length !== 1) return; // Ignore modifier keys like Shift, Control, Alt
        
        typedKeys += e.key.toLowerCase();
        if (typedKeys.length > secretCode.length) {
            typedKeys = typedKeys.slice(-secretCode.length);
        }
        
        if (typedKeys === secretCode) {
            typedKeys = ''; // reset

            // Confetti bursts from two angles
            if (typeof confetti === 'function') {
                const accentColors = ['#00d9ff', '#7c3aed', '#f43f5e', '#fbbf24', '#10b981'];
                // Left burst
                confetti({
                    particleCount: 120,
                    angle: 60,
                    spread: 70,
                    origin: { x: 0.15, y: 0.6 },
                    colors: accentColors,
                    ticks: 100,
                    gravity: 1.2,
                    scalar: 1.1
                });
                // Right burst (slight delay)
                setTimeout(() => {
                    confetti({
                        particleCount: 120,
                        angle: 120,
                        spread: 70,
                        origin: { x: 0.85, y: 0.6 },
                        colors: accentColors,
                        ticks: 100,
                        gravity: 1.2,
                        scalar: 1.1
                    });
                }, 200);
            }

            // Glassmorphic toast
            const toast = document.createElement('div');
            toast.className = 'easter-egg-toast';
            toast.innerHTML = '<span class="toast-emoji">🎉</span><span class="toast-text">Easter Egg Found! You discovered the secret.</span>';
            document.body.appendChild(toast);

            if (typeof gsap !== 'undefined') {
                gsap.fromTo(toast,
                    { opacity: 0, y: -20, xPercent: -50 },
                    { opacity: 1, y: 0, xPercent: -50, duration: 0.5, ease: 'back.out(1.5)' }
                );
                gsap.to(toast, {
                    opacity: 0,
                    y: -20,
                    xPercent: -50,
                    duration: 0.4,
                    ease: 'power2.in',
                    delay: 3,
                    onComplete: () => toast.remove()
                });
            } else {
                toast.style.opacity = '1';
                toast.style.transform = 'translateX(-50%) translateY(0)';
                setTimeout(() => {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateX(-50%) translateY(-20px)';
                }, 3000);
                setTimeout(() => toast.remove(), 3500);
            }
        }
    });

    // --------------------------------------------------------
    // 16. Project Filtering
    // --------------------------------------------------------
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projects = document.querySelectorAll('.premium-project-showcase');

    if (filterBtns.length > 0 && projects.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active from all
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                projects.forEach(project => {
                    const categories = project.getAttribute('data-category') || '';
                    if (filterValue === 'all' || categories.includes(filterValue)) {
                        project.style.display = 'flex';
                        if (typeof gsap !== 'undefined') {
                            gsap.fromTo(project, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
                        }
                    } else {
                        project.style.display = 'none';
                    }
                });
                
                // Refresh ScrollTrigger to recalculate heights since elements are hidden
                if (typeof ScrollTrigger !== 'undefined') {
                    setTimeout(() => ScrollTrigger.refresh(), 100);
                }
            });
        });
    }

    // --------------------------------------------------------
    // 16. i18n Language System
    // --------------------------------------------------------
    const translations = {
        en: {
            about_title: 'Beyond the <span class="text-gradient">Screen.</span>',
            tech_title: 'Technical <span class="text-gradient">Arsenal.</span>',
            work_title: '<span class="text-gradient">Projects.</span>',
            learning_title: 'Learning <span class="text-gradient">Roadmap.</span>',
            opensource_title: 'Open <span class="text-gradient">Source.</span>',
            cert_title: 'Certifications',
            contact_title: 'Let\'s build <br><span class="text-gradient">together.</span>'
        },
        kn: {
            about_title: 'ಪರದೆಯ <span class="text-gradient">ಆಚೆಗೆ.</span>',
            tech_title: 'ತಾಂತ್ರಿಕ <span class="text-gradient">ಸಾಮರ್ಥ್ಯ.</span>',
            work_title: '<span class="text-gradient">ಯೋಜನೆಗಳು.</span>',
            learning_title: 'ಕಲಿಕೆಯ <span class="text-gradient">ಹಾದಿ.</span>',
            opensource_title: 'ಮುಕ್ತ <span class="text-gradient">ಮೂಲ.</span>',
            cert_title: 'ಪ್ರಮಾಣಪತ್ರಗಳು',
            contact_title: 'ಒಟ್ಟಿಗೆ <br><span class="text-gradient">ನಿರ್ಮಿಸೋಣ.</span>'
        },
        hi: {
            about_title: 'स्क्रीन के <span class="text-gradient">परे.</span>',
            tech_title: 'तकनीकी <span class="text-gradient">क्षमता.</span>',
            work_title: '<span class="text-gradient">प्रोजेक्ट्स.</span>',
            learning_title: 'सीखने का <span class="text-gradient">रास्ता.</span>',
            opensource_title: 'ओपन <span class="text-gradient">सोर्स.</span>',
            cert_title: 'प्रमाणपत्र',
            contact_title: 'आइए साथ मिलकर <br><span class="text-gradient">बनाएं.</span>'
        },
        ur: {
            about_title: 'اسکرین کے <span class="text-gradient">آگے.</span>',
            tech_title: 'تکنیکی <span class="text-gradient">صلاحیتیں.</span>',
            work_title: '<span class="text-gradient">پروجیکٹس.</span>',
            learning_title: 'سیکھنے کا <span class="text-gradient">راستہ.</span>',
            opensource_title: 'اوپن <span class="text-gradient">سورس.</span>',
            cert_title: 'سرٹیفکیٹس',
            contact_title: 'آئیے مل کر <br><span class="text-gradient">بنائیں۔</span>'
        },
        ja: {
            about_title: '画面の<span class="text-gradient">向こうへ。</span>',
            tech_title: '技術<span class="text-gradient">スタック。</span>',
            work_title: '<span class="text-gradient">プロジェクト。</span>',
            learning_title: '学習<span class="text-gradient">ロードマップ。</span>',
            opensource_title: 'オープン<span class="text-gradient">ソース。</span>',
            cert_title: '認定資格',
            contact_title: '一緒に<br><span class="text-gradient">創りましょう。</span>'
        }
    };

    const langTrigger = document.getElementById('lang-trigger');
    const langWrapper = document.querySelector('.lang-dropdown-wrapper');
    const langOpts = document.querySelectorAll('.lang-opt');
    const htmlTag = document.documentElement;

    if (langTrigger && langWrapper) {
        langTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = langWrapper.classList.toggle('open');
            langTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        langTrigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const isOpen = langWrapper.classList.toggle('open');
                langTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            } else if (e.key === 'Escape' && langWrapper.classList.contains('open')) {
                e.preventDefault();
                langWrapper.classList.remove('open');
                langTrigger.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('click', (e) => {
            if (!langWrapper.contains(e.target)) {
                langWrapper.classList.remove('open');
                langTrigger.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && langWrapper.classList.contains('open')) {
                langWrapper.classList.remove('open');
                langTrigger.setAttribute('aria-expanded', 'false');
                langTrigger.focus();
            }
        });
    }

    if (langOpts.length > 0) {
        langOpts.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = btn.getAttribute('data-lang');
                
                // Update active state
                langOpts.forEach(l => l.classList.remove('active'));
                btn.classList.add('active');

                // Close dropdown on selection
                if (langWrapper) {
                    langWrapper.classList.remove('open');
                }
                if (langTrigger) {
                    langTrigger.setAttribute('aria-expanded', 'false');
                }

                // Set HTML lang and dir for RTL
                htmlTag.setAttribute('lang', lang);
                if (lang === 'ur') {
                    htmlTag.setAttribute('dir', 'rtl');
                } else {
                    htmlTag.removeAttribute('dir');
                }

                // Update text elements
                const dict = translations[lang] || translations['en'];
                document.querySelectorAll('[data-i18n]').forEach(el => {
                    const key = el.getAttribute('data-i18n');
                    if (dict[key]) {
                        el.innerHTML = dict[key];
                    }
                });
            });
        });
    }

    // --------------------------------------------------------
    // 17. Copy Email to Clipboard
    // --------------------------------------------------------
    const copyEmailBtn = document.querySelector('.copy-email-btn');
    if (copyEmailBtn) {
        const handleCopyEmail = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const showFeedback = () => {
                const originalHTML = copyEmailBtn.innerHTML;
                copyEmailBtn.innerHTML = '<i class="ph ph-check"></i><span class="copied-text">Copied!</span>';
                copyEmailBtn.style.color = '#10B981';
                setTimeout(() => {
                    copyEmailBtn.innerHTML = originalHTML;
                    copyEmailBtn.style.color = '';
                }, 1800);
            };

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText('mtausif1316@gmail.com')
                    .then(showFeedback)
                    .catch(() => {
                        fallbackCopy();
                        showFeedback();
                    });
            } else {
                fallbackCopy();
                showFeedback();
            }

            function fallbackCopy() {
                const textArea = document.createElement('textarea');
                textArea.value = 'mtausif1316@gmail.com';
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.error('Fallback copy failed', err);
                }
                document.body.removeChild(textArea);
            }
        };

        copyEmailBtn.addEventListener('click', handleCopyEmail);
        copyEmailBtn.addEventListener('mousedown', (e) => e.stopPropagation());
    }

});
