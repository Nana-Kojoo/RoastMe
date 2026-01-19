"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Flame } from "lucide-react"

interface RoastFormProps {
  onSubmit: (username: string) => void
  isLoading: boolean
}

export function RoastForm({ onSubmit, isLoading }: RoastFormProps) {
  const [username, setUsername] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onSubmit(username.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="text"
          placeholder="Enter GitHub username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          className="flex-1 h-11 bg-muted/50 border-border/50 focus-visible:border-github-green focus-visible:ring-github-green/20"
          aria-label="GitHub username"
        />
        <Button
          type="submit"
          disabled={isLoading || !username.trim()}
          className="h-11 px-6 bg-github-green hover:bg-github-green/90 text-white font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Roasting...</span>
            </>
          ) : (
            <>
              <Flame className="size-4" />
              <span>Roast Me</span>
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
