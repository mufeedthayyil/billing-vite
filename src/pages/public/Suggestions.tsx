import React, { useState } from 'react';
import { Send, Lightbulb } from 'lucide-react';
import { suggestionService } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';

const Suggestions: React.FC = () => {
  const [suggestionText, setSuggestionText] = useState('');
  const [suggestedBy, setSuggestedBy] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!suggestionText.trim() || !suggestedBy.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await suggestionService.create({
        suggestion_text: suggestionText.trim(),
        suggested_by: suggestedBy.trim(),
        status: 'pending'
      });

      setSuccess('Thank you for your suggestion! We\'ll review it and get back to you.');
      setSuggestionText('');
      setSuggestedBy('');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
      
    } catch (err) {
      setError('Failed to submit suggestion. Please try again.');
      console.error('Error submitting suggestion:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Lightbulb size={48} className="text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Suggest New Equipment
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Can't find the equipment you need? Let us know what you're looking for and we'll consider adding it to our inventory.
          </p>
        </div>

        {success && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Equipment Suggestion Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Your Name or Email"
                value={suggestedBy}
                onChange={(e) => setSuggestedBy(e.target.value)}
                placeholder="How should we contact you?"
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Suggestion *
                </label>
                <textarea
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  placeholder="Tell us about the equipment you'd like us to add. Include details like brand, model, specifications, or use case..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  rows={6}
                  required
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Helpful Information to Include:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Specific brand and model name</li>
                  <li>• Type of photography/videography it's used for</li>
                  <li>• Why this equipment would be valuable to rent</li>
                  <li>• Any technical specifications or features</li>
                </ul>
              </div>
              
              <Button
                type="submit"
                fullWidth
                isLoading={isSubmitting}
                disabled={isSubmitting || !suggestionText.trim() || !suggestedBy.trim()}
                icon={<Send size={16} />}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Why Suggest Equipment?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-600 font-bold">1</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Help Others</h3>
              <p className="text-sm text-gray-600">
                Your suggestions help us serve the photography community better
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-600 font-bold">2</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Stay Updated</h3>
              <p className="text-sm text-gray-600">
                We'll notify you when your suggested equipment becomes available
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-600 font-bold">3</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Shape Our Inventory</h3>
              <p className="text-sm text-gray-600">
                Popular suggestions influence our purchasing decisions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suggestions;