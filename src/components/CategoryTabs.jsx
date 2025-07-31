import React from 'react';

const categoryTabs = [
  { id: 'all', label: 'All Books' },
  { id: 'bestsellers', label: 'Bestsellers' },
  { id: 'awardWinners', label: 'Award Winners' },
  { id: 'newReleases', label: 'New Releases' },
  { id: 'newArrivals', label: 'New Arrivals' },
  { id: 'comingSoon', label: 'Coming Soon' },
  { id: 'deals', label: 'Deals' },
];

const CategoryTabs = ({ activeCategory, setActiveCategory }) => {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {categoryTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveCategory(tab.id)}
          className={`px-4 py-2 text-sm rounded-full ${
            activeCategory === tab.id
              ? 'bg-blue-600 text-white'
              : 'bg-white border text-gray-700 hover:bg-blue-100'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
