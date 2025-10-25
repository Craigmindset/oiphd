"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Transformation() {
  const [expectation, setExpectation] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (expectation.trim()) {
      setSubmitted(true)
      setTimeout(() => {
        setExpectation("")
        setSubmitted(false)
      }, 2000)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Transformation</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Share Your Expectations</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="expectation" className="block text-sm font-medium text-gray-700 mb-2">
                What are your expectations for this program?
              </label>
              <textarea
                id="expectation"
                value={expectation}
                onChange={(e) => setExpectation(e.target.value)}
                placeholder="Share your thoughts, goals, and expectations..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={6}
              />
            </div>
            <Button
              type="submit"
              disabled={!expectation.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {submitted ? "Submitted!" : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
