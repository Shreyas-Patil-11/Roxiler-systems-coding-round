import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../common/Loading';
import RatingModal from './RatingModal';
import { Search, Store, Star, MapPin, Mail, Filter, User as UserIcon } from 'lucide-react';

const UserStoreList = () => {
  const [stores, setStores] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'name',
    sortOrder: 'ASC'
  });


  useEffect(() => {
  const delay = setTimeout(() => {
    fetchStoresAndRatings();
  }, 600); 

  return () => clearTimeout(delay); 
}, [filters.search, filters.sortBy, filters.sortOrder]);


  const fetchStoresAndRatings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);

      const [storesRes, ratingsRes] = await Promise.all([
        api.get(`/stores?${params}`),
        api.get('/ratings/user') 
      ]);

      setStores(storesRes.data);

      const map = {};
      for (const r of ratingsRes.data) {
        map[r.store_id] = r.rating;
      }
      setUserRatings(map);

      setError('');
    } catch (err) {
      setError('Failed to load stores');
      console.error('Error fetching stores/ratings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRateStore = (store) => {
    setSelectedStore(store);
    setIsRatingModalOpen(true);
  };

  const handleRatingSubmitted = () => {
    setIsRatingModalOpen(false);
    setSelectedStore(null);
    fetchStoresAndRatings();
  };

  const renderStarIcons = (count, size = 'h-4 w-4', filledTo = 0) => {
    // renders 5 stars
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`${size} ${i <= filledTo ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  const renderStarRating = (rating, size = 'h-4 w-4') => {
    // Average rating
    const full = Math.floor(rating);
    return renderStarIcons(5, size, full);
  };

  if (loading) return <Loading message="Loading stores..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <Store className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Browse Stores</h1>
            <p className="text-sm text-gray-600">Discover amazing stores and share your experience</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search stores..."
              className="form-input !pl-10"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="form-input !pl-10"
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
            >
              <option value="name-ASC">Name (A-Z)</option>
              <option value="name-DESC">Name (Z-A)</option>
              <option value="average_rating-DESC">Highest Rated</option>
              <option value="average_rating-ASC">Lowest Rated</option>
            </select>
          </div>

          <button
            onClick={() => setFilters({ search: '', sortBy: 'name', sortOrder: 'ASC' })}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Available Stores ({stores.length})
          </h3>
        </div>

        {stores.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Store className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No stores found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No stores match your current search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {stores.map((store) => {
              const avg = parseFloat(store.average_rating || 0);
              const myRating = userRatings[store.id]; 

              return (
                <div key={store.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {store.name}
                    </h4>

                    {/* Average rating */}
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="flex items-center space-x-1">
                        {renderStarRating(avg, 'h-5 w-5')}
                      </div>
                      <span className="text-sm text-gray-600">
                        {avg.toFixed(1)} ({store.total_ratings}{' '}
                        {store.total_ratings === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>

                    {/* User's own rating (NEW) */}
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-indigo-500" />
                      {typeof myRating === 'number' ? (
                        <>
                          <span className="text-sm text-gray-700">Your rating:</span>
                          <div className="flex items-center space-x-1">
                            {renderStarIcons(5, 'h-4 w-4', myRating)}
                          </div>
                          <span className="text-sm text-gray-600">{myRating}/5</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">You haven't rated this store yet</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{store.email}</span>
                    </div>
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-3">{store.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {avg.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">Average Rating</div>
                    </div>
                    <button
                      onClick={() => handleRateStore(store)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Star size={16} />
                      <span>{typeof myRating === 'number' ? 'Update Rating' : 'Rate Store'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {isRatingModalOpen && selectedStore && (
        <RatingModal
          store={selectedStore}
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  );
};

export default UserStoreList;
