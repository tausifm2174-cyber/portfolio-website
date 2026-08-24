module.exports = async function handler(req, res) {
    // 1. Accept GET requests only
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
            error: `Method ${req.method} Not Allowed`
        });
    }

    // 2. Validate GitHub Token
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        console.error('Missing GITHUB_TOKEN environment variable.');
        return res.status(500).json({
            error: 'GitHub token is not configured on the server.'
        });
    }

    const username = 'tausifm2174-cyber';

    try {
        // Step A: Fetch account creation date
        const creationQuery = JSON.stringify({
            query: `
                query($login: String!) {
                    user(login: $login) {
                        createdAt
                    }
                }
            `,
            variables: { login: username }
        });

        const creationRes = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Portfolio-Stats-Fetcher',
                'Content-Type': 'application/json'
            },
            body: creationQuery
        });

        if (!creationRes.ok) {
            console.error(`GitHub GraphQL user creation returned status: ${creationRes.status}`);
            return res.status(500).json({
                error: 'Failed to communicate with GitHub API.'
            });
        }

        const creationData = await creationRes.json();
        if (creationData.errors || !creationData.data?.user?.createdAt) {
            console.error('GraphQL errors in user creation query:', creationData.errors);
            return res.status(500).json({
                error: 'Failed to retrieve GitHub user creation date.'
            });
        }

        const createdYear = new Date(creationData.data.user.createdAt).getUTCFullYear();
        const currentYear = new Date().getUTCFullYear();

        // Step B: Query contribution calendar year by year with aliases
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

        if (!contribRes.ok) {
            console.error(`GitHub GraphQL contributions query returned status: ${contribRes.status}`);
            return res.status(500).json({
                error: 'Failed to communicate with GitHub API for contributions.'
            });
        }

        const contribData = await contribRes.json();
        if (contribData.errors || !contribData.data?.user) {
            console.error('GraphQL errors in contributions query:', contribData.errors);
            return res.status(500).json({
                error: 'Failed to retrieve contribution calendar data.'
            });
        }

        let totalContributions = 0;
        const userObj = contribData.data.user;
        for (const [key, val] of Object.entries(userObj)) {
            if (key.startsWith('y') && val?.contributionCalendar?.totalContributions) {
                totalContributions += val.contributionCalendar.totalContributions;
            }
        }

        // Cache response for 1 hour at CDN/edge
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        return res.status(200).json({ totalContributions });
    } catch (err) {
        console.error('Unexpected error in /api/github-stats:', err);
        return res.status(500).json({
            error: 'An unexpected error occurred while fetching GitHub statistics.'
        });
    }
};
