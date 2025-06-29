import React, { useState } from 'react'
import { Send, Lightbulb } from 'lucide-react'
import { db } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import toast from 'react-hot-toast'

export function Suggestions() {
  const [suggestionText, setSuggestionText] = useState('')
  const [suggestedBy, setSuggestedBy] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!suggestionText.trim()) {
      toast.error('Please enter your suggestion')
      return
    }

    setLoading(true)

    try {
      await db.createSuggestion({
        suggestion_text: suggestionText.trim(),
        suggested_by: suggestedBy.trim() || null,
      })

      toast.success('Thank you for your suggestion!')
      setSuggestionText('')
      setSuggestedBy('')
    } catch (error) {
      console.error('Error submitting suggestion:', error)
      toast.error('Failed to submit suggestion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Lightbulb className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Suggest New Equipment
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Can't find the equipment you need? Let us know what you're looking for.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Equipment Suggestion</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Your Name or Email (Optional)"
                value={suggestedBy}
                onChange={(e) => setSuggestedBy(e.target.value)}
                placeholder="How should we contact you?"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Suggestion *
                </label>
                <textarea
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  placeholder="Tell us about the equipment you'd like us to add..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  rows={6}
                  required
                />
              </div>
              
              <Button type="submit" loading={loading} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Submit Suggestion
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}