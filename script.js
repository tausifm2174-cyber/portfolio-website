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
        const words = ['premium SaaS platforms.', 'world-class design systems.', 'flawless React applications.', 'beautiful digital experiences.'];
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

    // D. Number Counters for Statistics
    const counters = document.querySelectorAll('.counter');
    const statsSection = document.getElementById('hero-stats');
    
    if (statsSection && counters.length > 0) {
        let hasAnimated = false;

        const statObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasAnimated) {
                hasAnimated = true;
                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    const duration = 2000; // 2 seconds
                    const increment = target / (duration / 16); // 60fps
                    let current = 0;

                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            counter.innerText = Math.ceil(current).toLocaleString();
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.innerText = target.toLocaleString();
                        }
                    };
                    updateCounter();
                });
            }
        }, { threshold: 0.5 });
        
        statObserver.observe(statsSection);
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
    // 9. GitHub API Integration
    // --------------------------------------------------------
    const GITHUB_USERNAME = 'tausifm2174-cyber'; // REPLACE THIS WITH ACTUAL GITHUB USERNAME
    
    async function fetchGitHubData() {
        const reposContainer = document.getElementById('github-repos-container');
        const errorMsg = document.getElementById('gh-error-msg');
        
        if (!reposContainer) return;

        try {
            // Fetch User Profile
            const userResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
            if (!userResponse.ok) throw new Error('Rate limit or user not found');
            const userData = await userResponse.json();

            // Fetch Repositories
            const reposResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
            if (!reposResponse.ok) throw new Error('Rate limit or repos not found');
            const reposData = await reposResponse.json();

            // Calculate total stars across all public repos
            const totalStars = reposData.reduce((acc, repo) => acc + repo.stargazers_count, 0);

            // Populate Numbers
            document.getElementById('gh-followers').innerText = userData.followers;
            document.getElementById('gh-repos').innerText = userData.public_repos;
            document.getElementById('gh-stars').innerText = totalStars;

            // Filter out forks and sort by stars
            const topRepos = reposData
                .filter(repo => !repo.fork)
                .sort((a, b) => b.stargazers_count - a.stargazers_count)
                .slice(0, 3);

            // Render Repositories
            reposContainer.innerHTML = ''; // Clear skeletons
            
            topRepos.forEach((repo, index) => {
                // Determine language color
                const langColors = {
                    'JavaScript': '#f1e05a',
                    'TypeScript': '#3178c6',
                    'Python': '#3572A5',
                    'HTML': '#e34c26',
                    'CSS': '#563d7c',
                    'React': '#61dafb'
                };
                const langColor = langColors[repo.language] || '#8b949e';
                
                const repoHtml = `
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;" class="card repo-card reveal active" style="transition-delay: ${index * 0.1}s; opacity: 1; transform: translateY(0);">
                        <div class="repo-header">
                            <h4 class="h4" style="color: var(--accent-primary); display: flex; align-items: center; gap: 0.5rem; word-break: break-all;">
                                <i class="ph ph-book-bookmark"></i> ${repo.name}
                            </h4>
                            <div class="repo-stats">
                                <span><i class="ph ph-star"></i> ${repo.stargazers_count}</span>
                                <span><i class="ph ph-git-fork"></i> ${repo.forks_count}</span>
                            </div>
                        </div>
                        <p class="text-muted text-sm" style="margin-bottom: 1.5rem; flex-grow: 1;">${repo.description || 'No description provided.'}</p>
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <div style="width: 12px; height: 12px; border-radius: 50%; background: ${langColor};"></div>
                            <span class="text-mono text-muted">${repo.language || 'Unknown'}</span>
                        </div>
                    </a>
                `;
                reposContainer.innerHTML += repoHtml;
            });

        } catch (error) {
            console.error('GitHub API Error:', error);
            errorMsg.style.display = 'block';
            reposContainer.innerHTML = ''; // Clear skeletons if failed
            document.getElementById('gh-followers').innerText = 'N/A';
            document.getElementById('gh-repos').innerText = 'N/A';
            document.getElementById('gh-stars').innerText = 'N/A';
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
        
        typedKeys += e.key.toLowerCase();
        if (typedKeys.length > secretCode.length) {
            typedKeys = typedKeys.slice(-secretCode.length);
        }
        
        if (typedKeys === secretCode) {
            alert('🎉 Easter Egg Found! Unleashing the fireworks...');
            if (typeof gsap !== 'undefined') {
                gsap.to('body', { rotation: 360, duration: 2, ease: 'power3.inOut' });
            }
            typedKeys = ''; // reset
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
            work_title: 'Selected <span class="text-gradient">Works.</span>',
            learning_title: 'Learning <span class="text-gradient">Roadmap.</span>',
            opensource_title: 'Open <span class="text-gradient">Source.</span>',
            cert_title: 'Certifications',
            contact_title: 'Let\'s build <br><span class="text-gradient">together.</span>'
        },
        kn: {
            about_title: 'ಪರದೆಯ <span class="text-gradient">ಆಚೆಗೆ.</span>',
            tech_title: 'ತಾಂತ್ರಿಕ <span class="text-gradient">ಸಾಮರ್ಥ್ಯ.</span>',
            work_title: 'ಆಯ್ದ <span class="text-gradient">ಯೋಜನೆಗಳು.</span>',
            learning_title: 'ಕಲಿಕೆಯ <span class="text-gradient">ಹಾದಿ.</span>',
            opensource_title: 'ಮುಕ್ತ <span class="text-gradient">ಮೂಲ.</span>',
            cert_title: 'ಪ್ರಮಾಣಪತ್ರಗಳು',
            contact_title: 'ಒಟ್ಟಿಗೆ <br><span class="text-gradient">ನಿರ್ಮಿಸೋಣ.</span>'
        },
        hi: {
            about_title: 'स्क्रीन के <span class="text-gradient">परे.</span>',
            tech_title: 'तकनीकी <span class="text-gradient">क्षमता.</span>',
            work_title: 'चुनिंदा <span class="text-gradient">प्रोजेक्ट्स.</span>',
            learning_title: 'सीखने का <span class="text-gradient">रास्ता.</span>',
            opensource_title: 'ओपन <span class="text-gradient">सोर्स.</span>',
            cert_title: 'प्रमाणपत्र',
            contact_title: 'आइए साथ मिलकर <br><span class="text-gradient">बनाएं.</span>'
        },
        ur: {
            about_title: 'اسکرین کے <span class="text-gradient">آگے.</span>',
            tech_title: 'تکنیکی <span class="text-gradient">صلاحیتیں.</span>',
            work_title: 'منتخب کردہ <span class="text-gradient">پروجیکٹس.</span>',
            learning_title: 'سیکھنے کا <span class="text-gradient">راستہ.</span>',
            opensource_title: 'اوپن <span class="text-gradient">سورس.</span>',
            cert_title: 'سرٹیفکیٹس',
            contact_title: 'آئیے مل کر <br><span class="text-gradient">بنائیں۔</span>'
        }
    };

    const langOpts = document.querySelectorAll('.lang-opt');
    const htmlTag = document.documentElement;

    if (langOpts.length > 0) {
        langOpts.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = btn.getAttribute('data-lang');
                
                // Update active state
                langOpts.forEach(l => l.classList.remove('active'));
                btn.classList.add('active');

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

});
