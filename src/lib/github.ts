export type GitHubStats = {
  repos: number;
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

async function fetchOne(user: string): Promise<GitHubStats> {
  const key = `gh-stats-v2:${user}`;
  const cached = readCache(key);
  if (cached) return cached;

  const [profile, contrib] = await Promise.all([
    fetch(`https://api.github.com/users/${user}`).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
    // Public contribution counts scraped from the profile calendar (no token needed).
    fetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
  ]);

  const data: GitHubStats = {
    repos: profile.public_repos ?? 0,
    contributions: contrib?.total?.lastYear ?? 0,
  };
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* storage unavailable — fine, we just refetch next visit */
  }
  return data;
}

/** Sums stats across accounts; accounts that fail to load are skipped. */
export async function fetchCombinedStats(users: string[]): Promise<GitHubStats> {
  const results = await Promise.allSettled(users.map(fetchOne));
  const ok = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
  if (!ok.length) throw new Error('GitHub unavailable');
  return ok.reduce((a, b) => ({
    repos: a.repos + b.repos,
    contributions: a.contributions + b.contributions,
  }));
}
