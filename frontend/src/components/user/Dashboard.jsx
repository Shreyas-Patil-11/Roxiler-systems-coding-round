import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loading from '../common/Loading';
import { useAuth } from '../../context/AuthContext';
import { Star, Store, User, TrendingUp } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRatings: 0,
    averageRating: 0,
    totalStores: 0
  });
  const [recentRatings, setRecentRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ratingsResponse, storesResponse] = await Promise.all([
        api.get('/ratings/user'),
        api.get('/stores')
      ]);

      const userRatings = ratingsResponse.data;
      const allStores = storesResponse.data;

      setStats({
        totalRatings: userRatings.length,
        averageRating: userRatings.length > 0 
          ? userRatings.reduce((sum, rating) => sum + rating.rating, 0) / userRatings.length 
          : 0,
        totalStores: allStores.length
      });

      setRecentRatings(userRatings.slice(0, 5));
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) return <Loading message="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
            <p className="text-sm text-gray-600">
              Discover and rate amazing stores in your area
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    My Ratings
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalRatings}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-yellow-600">
                Total ratings given
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Rating
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.averageRating.toFixed(1)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-green-600">
                Your rating average
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Store className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Available Stores
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalStores}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/user/stores" className="font-medium text-blue-600 hover:text-blue-500">
                Explore stores
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/user/stores"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Store className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Browse Stores</h4>
                <p className="text-sm text-gray-500">Discover and rate new stores</p>
              </div>
            </Link>

            <Link
              to="/user/profile"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <User className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">My Profile</h4>
                <p className="text-sm text-gray-500">Update your account settings</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Ratings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Ratings</h3>
            <Link to="/user/stores" className="text-sm text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>
        </div>

        {recentRatings.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Star className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No ratings yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start rating stores to see your activity here.
            </p>
            <div className="mt-6">
              <Link
                to="/user/stores"
                className="btn-primary"
              >
                Rate Your First Store
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentRatings.map((rating) => (
              <div key={rating.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {rating.store_name}
                    </h4>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {renderStars(rating.rating)}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {rating.rating}/5
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;