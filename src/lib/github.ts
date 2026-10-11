export type GitHubStats = {
  repos: number;
  stars: number;
  followers: number;
  contributions: number;
};

const TTL = 6 * 60 * 60 * 1000; // stay well inside GitHub's 60 req/hour anonymous limit

function readCache(key: string): GitHubStats | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    return Date.now() - at < TTL ? data : null;
  } catch {
    return null;
  }
}

export async function fetchGitHubStats(user: string): Promise<GitHubStats> {
  const key = `gh-stats:${user}`;
  const cached = readCache(key);
  if (cached) return cached;

  const [profile, repos, contrib] = await Promise.all([
    fetch(`https://api.github.com/users/${user}`).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
    fetch(`https://api.github.com/users/${user}/repos?per_page=100&type=owner`).then((r) => (r.ok ? r.json() : [])),
    // Public contribution counts scraped from the profile calendar (no token needed).
    fetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
  ]);

  const data: GitHubStats = {
    repos: profile.public_repos ?? 0,
    followers: profile.followers ?? 0,
    stars: Array.isArray(repos) ? repos.reduce((n: number, r: { stargazers_count?: number }) => n + (r.stargazers_count ?? 0), 0) : 0,
    contributions: contrib?.total?.lastYear ?? 0,
  };
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* storage unavailable — fine, we just refetch next visit */
  }
  return data;
}
