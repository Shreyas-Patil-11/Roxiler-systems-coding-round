import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X, Star } from 'lucide-react';

const RatingModal = ({ store, isOpen, onClose, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingRating, setExistingRating] = useState(null);

  useEffect(() => {
    if (isOpen && store) {
      checkExistingRating();
    }
  }, [isOpen, store]);

  const checkExistingRating = async () => {
    try {
      const response = await api.get('/ratings/user');
      const userRatings = response.data;
      const existing = userRatings.find(r => r.store_id === store.id);
      if (existing) {
        setExistingRating(existing);
        setRating(existing.rating);
      }
    } catch (error) {
      console.error('Error checking existing rating:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/ratings', {
        storeId: store.id,
        rating: rating
      });

      onRatingSubmitted();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit rating';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const activeRating = hoverRating || rating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className="focus:outline-none"
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setRating(i)}
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              i <= activeRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          />
        </button>
      );
    }

    return stars;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {existingRating ? 'Update Rating' : 'Rate Store'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Store Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900">{store.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{store.address}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Existing Rating Info */}
          {existingRating && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-700">
                You previously rated this store {existingRating.rating}/5. You can update your rating below.
              </p>
            </div>
          )}

          {/* Rating Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating
              </label>
              <div className="flex items-center space-x-1 mb-2">
                {renderStars()}
              </div>
              <p className="text-sm text-gray-500">
                {rating === 0 && 'Click on stars to rate'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading || rating === 0}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {existingRating ? 'Updating...' : 'Submitting...'}
                  </div>
                ) : (
                  existingRating ? 'Update Rating' : 'Submit Rating'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;