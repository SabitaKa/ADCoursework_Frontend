import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaTag, FaBell } from 'react-icons/fa';

const UserAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get('https://localhost:7098/api/Announcement');
        if (response.data.success) {
          // Filter active announcements based on dates and isActive flag
          const activeAnnouncements = response.data.data.filter(announcement => {
            const now = new Date();
            const startDate = new Date(announcement.startDate);
            const endDate = new Date(announcement.endDate);
            
            return (
              announcement.isActive && // Check if announcement is marked as active
              startDate <= now && // Check if start date has passed
              endDate >= now // Check if end date hasn't passed
            );
          });
          
          setAnnouncements(activeAnnouncements);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setError('Failed to load announcements. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading announcements...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Latest Announcements</h1>
          <p className="text-lg text-gray-600">Stay updated with our latest news and events</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-4 py-1.5 rounded-full text-sm font-medium flex items-center bg-green-100 text-green-800">
                    <FaBell className="mr-2" />
                    Active
                  </span>
                  <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 flex items-center">
                    <FaTag className="mr-2" />
                    {announcement.type}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {announcement.title}
                </h2>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {announcement.message}
                </p>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex flex-col space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      <span className="font-medium">Start:</span>{' '}
                      {new Date(announcement.startDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      <span className="font-medium">End:</span>{' '}
                      {new Date(announcement.endDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {announcements.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Active Announcements</h3>
            <p className="text-gray-600">Check back later for updates!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAnnouncements; 