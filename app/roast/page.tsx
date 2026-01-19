"use client"

import { useState } from "react"
import { RoastForm } from "@/components/roast-form"
import { RoastCard } from "@/components/roast-card"
import { AlertCircle, Github } from "lucide-react"

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

export default function RoastPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<RoastResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (username: string) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(
        `/api/roast?username=${encodeURIComponent(username)}`
      )
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Something went wrong")
        return
      }

      setResult(data)
    } catch {
      setError("Failed to fetch data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoastAnother = () => {
    setResult(null)
    setError(null)
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-muted/50 mb-4">
            <Github className="size-8 text-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Roast My GitHub
          </h1>
          <p className="text-muted-foreground">
            Enter a GitHub username and get roasted.
          </p>
        </div>

        {/* Form or Result */}
        {!result ? (
          <div className="space-y-4">
            <RoastForm onSubmit={handleSubmit} isLoading={isLoading} />

            {/* Error state */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <RoastCard result={result} onRoastAnother={handleRoastAnother} />
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Powered by the GitHub API. All in good fun.
        </p>
      </div>
    </main>
  )
}
