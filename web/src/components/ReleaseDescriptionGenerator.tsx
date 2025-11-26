'use client';

import { useState } from 'react';
import { Sparkles, Copy, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface ReleaseDescriptionGeneratorProps {
  artistId?: string;
  trackTitle?: string;
  onDescriptionGenerated?: (description: string) => void;
}

export function ReleaseDescriptionGenerator({
  artistId = '',
  trackTitle = '',
  onDescriptionGenerated,
}: ReleaseDescriptionGeneratorProps) {
  const [formData, setFormData] = useState({
    artistId: artistId,
    trackTitle: trackTitle,
    genre: '',
    mood: '',
    keyPoints: '',
  });

  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{
    monthlyListeners: number | null;
    generatedAt: string;
  } | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateDescription = async () => {
    if (!formData.artistId || !formData.trackTitle) {
      setError('Please fill in Artist ID and Track Title');
      return;
    }

    setLoading(true);
    setError('');
    setDescription('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/ai/releases/description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistId: formData.artistId,
          trackTitle: formData.trackTitle,
          genre: formData.genre || undefined,
          mood: formData.mood || undefined,
          keyPoints: formData.keyPoints || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate description');
      }

      const data = await response.json();
      setDescription(data.description);
      setStats({
        monthlyListeners: data.monthlyListeners,
        generatedAt: data.generatedAt,
      });

      if (onDescriptionGenerated) {
        onDescriptionGenerated(data.description);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-900">AI Release Description</h2>
      </div>

      {/* Input Form */}
      <div className="space-y-4 mb-6">
        {/* Artist ID & Track Title Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Artist ID *
            </label>
            <input
              type="text"
              name="artistId"
              value={formData.artistId}
              onChange={handleInputChange}
              placeholder="e.g., artist-123"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Track Title *
            </label>
            <input
              type="text"
              name="trackTitle"
              value={formData.trackTitle}
              onChange={handleInputChange}
              placeholder="e.g., Summer Vibes"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Genre & Mood Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Genre (Optional)
            </label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleInputChange}
              placeholder="e.g., Hip-Hop, Pop, Electronic"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mood (Optional)
            </label>
            <input
              type="text"
              name="mood"
              value={formData.mood}
              onChange={handleInputChange}
              placeholder="e.g., energetic, introspective, uplifting"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Key Points */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Key Points (Optional)
          </label>
          <textarea
            name="keyPoints"
            value={formData.keyPoints}
            onChange={handleInputChange}
            placeholder="e.g., Features collaborations, Breaking new sounds, DJ favorite"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={generateDescription}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mb-6"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Description
          </>
        )}
      </button>

      {/* Generated Description */}
      {description && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Generated Description</h3>
            <button
              onClick={copyToClipboard}
              className="text-purple-600 hover:text-purple-700 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>

          <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
            {description}
          </p>

          {stats && (
            <div className="pt-4 border-t border-purple-200 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>
                  Monthly Listeners:{' '}
                  <strong>
                    {stats.monthlyListeners
                      ? stats.monthlyListeners.toLocaleString()
                      : 'N/A'}
                  </strong>
                </span>
                <span>
                  Generated: <strong>{new Date(stats.generatedAt).toLocaleDateString()}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
