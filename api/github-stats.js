module.exports = async function handler(req, res) {
    // 1. Accept GET requests only
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
            success: false,
            error: `Method ${req.method} Not Allowed`
        });
    }

    const username = 'tausifm2174-cyber';
    const token = process.env.GITHUB_TOKEN;

    // Build headers with optional token
    const headers = {
        'User-Agent': 'Portfolio-Stats-Fetcher',
        'Accept': 'application/vnd.github+json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        // Fetch User profile and Repositories in parallel
        const [userRes, reposRes] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`, { headers }),
            fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, { headers })
        ]);

        if (!userRes.ok || !reposRes.ok) {
            console.warn(`GitHub API request returned non-200 status: user=${userRes.status}, repos=${reposRes.status}`);
            res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate');
            return res.status(200).json({
                success: false,
                fallback: true,
                checkGitHubDirectly: true,
                message: 'GitHub API rate limited or temporarily unreachable.',
                followers: null,
                stars: null,
                repos: null,
                totalContributions: null,
                recentRepos: [],
                projectsCount: null,
                techCount: null,
                recentlyActive: null
            });
        }

        const userData = await userRes.json();
        const reposData = await reposRes.json();

        // Calculate total stars across all public repos
        const totalStars = Array.isArray(reposData)
            ? reposData.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0)
            : 0;

        // Filter non-fork repositories
        const originalRepos = Array.isArray(reposData)
            ? reposData.filter(repo => !repo.fork)
            : [];

        const projectsCount = originalRepos.length;
        const techCount = new Set(
            originalRepos.map(r => r.language).filter(Boolean)
        ).size;

        // Top repositories sorted by stars
        const topRepos = [...originalRepos]
            .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
            .slice(0, 3)
            .map(repo => ({
                name: repo.name,
                description: repo.description,
                html_url: repo.html_url,
                stargazers_count: repo.stargazers_count || 0,
                forks_count: repo.forks_count || 0,
                language: repo.language || 'Code',
                pushed_at: repo.pushed_at
            }));

        // Most recently active repo
        const recentlyActive = Array.isArray(reposData) && reposData.length > 0
            ? {
                name: reposData[0].name,
                pushed_at: reposData[0].pushed_at
            }
            : null;

        // GraphQL Contribution Calendar (if token provided)
        let totalContributions = null;
        if (token) {
            try {
                const createdYear = new Date(userData.created_at || '2023-01-01').getUTCFullYear();
                const currentYear = new Date().getUTCFullYear();

                const yearQueries = [];
                for (let year = createdYear; year <= currentYear; year++) {
                    const from = `${year}-01-01T00:00:00Z`;
                    const to = `${year + 1}-01-01T00:00:00Z`;
                    yearQueries.push(`
                        y${year}: contributionsCollection(from: "${from}", to: "${to}") {
                            contributionCalendar {
                                totalContributions
                            }
                        }
                    `);
                }

                const contributionsQuery = JSON.stringify({
                    query: `
                        query($login: String!) {
                            user(login: $login) {
                                ${yearQueries.join('\n')}
                            }
                        }
                    `,
                    variables: { login: username }
                });

                const contribRes = await fetch('https://api.github.com/graphql', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'User-Agent': 'Portfolio-Stats-Fetcher',
                        'Content-Type': 'application/json'
                    },
                    body: contributionsQuery
                });

                if (contribRes.ok) {
                    const contribData = await contribRes.json();
                    if (contribData.data?.user) {
                        let sum = 0;
                        for (const [key, val] of Object.entries(contribData.data.user)) {
                            if (key.startsWith('y') && val?.contributionCalendar?.totalContributions) {
                                sum += val.contributionCalendar.totalContributions;
                            }
                        }
                        totalContributions = sum;
                    }
                }
            } catch (graphqlErr) {
                console.warn('GraphQL contributions fetch failed:', graphqlErr);
            }
        }

        // Cache response for 1 hour at CDN/edge
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        return res.status(200).json({
            success: true,
            fallback: false,
            followers: userData.followers || 0,
            stars: totalStars,
            repos: userData.public_repos || 0,
            totalContributions,
            recentRepos: topRepos,
            projectsCount,
            techCount,
            recentlyActive
        });

    } catch (err) {
        console.error('Unexpected error in /api/github-stats:', err);
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        return res.status(200).json({
            success: false,
            fallback: true,
            checkGitHubDirectly: true,
            message: 'Temporary server communication issue with GitHub.',
            followers: null,
            stars: null,
            repos: null,
            totalContributions: null,
            recentRepos: [],
            projectsCount: null,
            techCount: null,
            recentlyActive: null
        });
    }
};
