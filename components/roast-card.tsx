"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Twitter, RotateCcw, Star, Users, BookMarked } from "lucide-react"

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

interface RoastCardProps {
  result: RoastResult
  onRoastAnother: () => void
}

export function RoastCard({ result, onRoastAnother }: RoastCardProps) {
  const shareText = encodeURIComponent(
    `My GitHub just got roasted.\n\nRoast yours → ${typeof window !== "undefined" ? window.location.origin : ""}/roast`
  )

  const shareUrl = `https://twitter.com/intent/tweet?text=${shareText}`

  return (
    <Card className="w-full bg-card/50 border-border/50 shadow-lg">
      <CardContent className="pt-6">
        {/* User info */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={result.avatarUrl || "/placeholder.svg"}
            alt={`${result.username}'s avatar`}
            className="size-16 rounded-full border-2 border-border/50"
          />
          <div>
            <h3 className="font-semibold text-lg text-foreground">
              {result.name || result.username}
            </h3>
            <p className="text-muted-foreground text-sm">@{result.username}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <BookMarked className="size-4" />
            <span>{result.stats.publicRepos} repos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="size-4" />
            <span>{result.stats.totalStars} stars</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-4" />
            <span>{result.stats.followers} followers</span>
          </div>
        </div>

        {/* Roast text */}
        <div className="bg-muted/30 rounded-lg p-4 mb-6 border border-border/30">
          {result.roasts.map((roast, index) => (
            <p
              key={index}
              className="text-foreground text-base leading-relaxed"
            >
              {roast}
            </p>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onRoastAnother}
            className="flex-1 h-10 bg-transparent"
          >
            <RotateCcw className="size-4" />
            Roast another dev
          </Button>
          <Button
            asChild
            className="flex-1 h-10 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
          >
            <a href={shareUrl} target="_blank" rel="noopener noreferrer">
              <Twitter className="size-4" />
              Share on Twitter
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
