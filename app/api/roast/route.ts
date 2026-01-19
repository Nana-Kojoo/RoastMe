import { NextRequest, NextResponse } from "next/server"

interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
  public_repos: number
  followers: number
  following: number
  created_at: string
  bio: string | null
}

interface GitHubRepo {
  name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
  pushed_at: string
  has_readme?: boolean
  default_branch: string
}

interface RoastResult {
  username: string
  avatarUrl: string
  name: string | null
  roasts: string[]
  stats: {
    publicRepos: number
    followers: number
    totalStars: number
  }
}

// Roast generation rules
function generateRoasts(user: GitHubUser, repos: GitHubRepo[]): string[] {
  const roasts: string[] = []
  const now = new Date()
  const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)

  // Calculate stats
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
  const reposWithRecentPush = repos.filter(
    (repo) => new Date(repo.pushed_at) > sixMonthsAgo
  )
  const reposWithoutReadme = repos.filter((repo) => !repo.has_readme)

  // Rule: Few public repos
  if (user.public_repos <= 3) {
    roasts.push("Quality over quantity... hopefully.")
  }

  // Rule: No commits in last 6 months
  if (reposWithRecentPush.length === 0 && repos.length > 0) {
    roasts.push("Your GitHub has been in airplane mode.")
  }

  // Rule: Many repos but very few stars
  if (repos.length >= 5 && totalStars < 5) {
    roasts.push("You build a lot... quietly.")
  }

  // Rule: Most repos missing READMEs
  if (repos.length >= 3 && reposWithoutReadme.length >= repos.length * 0.7) {
    roasts.push("Documentation fears you.")
  }

  // Rule: Lots of repos (potentially many with single commits)
  if (repos.length >= 10) {
    roasts.push('You love `git init` more than `git push`.')
  }

  // Rule: More following than followers
  if (user.following > user.followers * 2 && user.followers < 10) {
    roasts.push("Your follow button works better than your code, apparently.")
  }

  // Rule: Account age vs activity
  const accountAge =
    (now.getTime() - new Date(user.created_at).getTime()) /
    (365 * 24 * 60 * 60 * 1000)
  if (accountAge > 3 && repos.length < 5) {
    roasts.push("Years on GitHub, commits in single digits. Impressive restraint.")
  }

  // Rule: No bio
  if (!user.bio) {
    roasts.push("No bio? The mystery deepens... or there's just nothing to say.")
  }

  // Fallback roasts if none triggered
  if (roasts.length === 0) {
    roasts.push(
      "Your GitHub is suspiciously clean. What are you hiding?",
      "You're either really good or really good at hiding."
    )
  }

  // Return max 2 roasts
  return roasts.slice(0, 2)
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const username = searchParams.get("username")

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    )
  }

  // Validate username format
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
    return NextResponse.json(
      { error: "Invalid GitHub username format" },
      { status: 400 }
    )
  }

  try {
    // Fetch user profile
    const userResponse = await fetch(
      `https://api.github.com/users/${username}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "GitHub-Roast-App",
        },
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    )

    if (userResponse.status === 404) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (userResponse.status === 403) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: userResponse.status }
      )
    }

    const user: GitHubUser = await userResponse.json()

    // Fetch repositories
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "GitHub-Roast-App",
        },
        next: { revalidate: 60 },
      }
    )

    let repos: GitHubRepo[] = []
    if (reposResponse.ok) {
      repos = await reposResponse.json()

      // Check for READMEs (simplified - check if repo has contents)
      const reposWithReadmeCheck = await Promise.all(
        repos.slice(0, 10).map(async (repo) => {
          try {
            const readmeResponse = await fetch(
              `https://api.github.com/repos/${username}/${repo.name}/readme`,
              {
                headers: {
                  Accept: "application/vnd.github.v3+json",
                  "User-Agent": "GitHub-Roast-App",
                },
              }
            )
            return { ...repo, has_readme: readmeResponse.ok }
          } catch {
            return { ...repo, has_readme: false }
          }
        })
      )

      // Update first 10 repos with README check, rest assumed no README
      repos = [
        ...reposWithReadmeCheck,
        ...repos.slice(10).map((r) => ({ ...r, has_readme: false })),
      ]
    }

    // Generate roasts
    const roasts = generateRoasts(user, repos)

    const totalStars = repos.reduce(
      (sum, repo) => sum + repo.stargazers_count,
      0
    )

    const result: RoastResult = {
      username: user.login,
      avatarUrl: user.avatar_url,
      name: user.name,
      roasts,
      stats: {
        publicRepos: user.public_repos,
        followers: user.followers,
        totalStars,
      },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching GitHub data:", error)
    return NextResponse.json(
      { error: "Failed to fetch GitHub data" },
      { status: 500 }
    )
  }
}
