import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FilterPanel = ({ filters, setFilters }) => {
  const [genres, setGenres] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState({ genres: true, publishers: true, authors: true });
  const [error, setError] = useState({ genres: null, publishers: null, authors: null });

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get('https://localhost:7098/api/genre/all');
        if (response.data.success) {
          setGenres(response.data.data);
        }
      } catch (err) {
        setError(prev => ({ ...prev, genres: 'Failed to load genres' }));
        console.error('Error fetching genres:', err);
      } finally {
        setLoading(prev => ({ ...prev, genres: false }));
      }
    };

    const fetchPublishers = async () => {
      try {
        const response = await axios.get('https://localhost:7098/api/publisher/all');
        if (response.data.success) {
          setPublishers(response.data.data);
        }
      } catch (err) {
        setError(prev => ({ ...prev, publishers: 'Failed to load publishers' }));
        console.error('Error fetching publishers:', err);
      } finally {
        setLoading(prev => ({ ...prev, publishers: false }));
      }
    };

    const fetchAuthors = async () => {
      try {
        const response = await axios.get('https://localhost:7098/api/author/all');
        if (response.data.success) {
          setAuthors(response.data.data);
        }
      } catch (err) {
        setError(prev => ({ ...prev, authors: 'Failed to load authors' }));
        console.error('Error fetching authors:', err);
      } finally {
        setLoading(prev => ({ ...prev, authors: false }));
      }
    };

    fetchGenres();
    fetchPublishers();
    fetchAuthors();
  }, []);

  const handlePriceRangeChange = (e) => {
    const value = parseInt(e.target.value);
    setFilters(prev => ({
      ...prev,
      priceRange: [0, value]
    }));
  };

  const handleAvailabilityChange = (e) => {
    setFilters(prev => ({
      ...prev,
      availability: e.target.value
    }));
  };

  const handleAuthorChange = (authorId) => {
    setFilters(prev => ({
      ...prev,
      authors: prev.authors.includes(authorId)
        ? prev.authors.filter(id => id !== authorId)
        : [...prev.authors, authorId]
    }));
  };

  const handleGenreChange = (genreId) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter(id => id !== genreId)
        : [...prev.genres, genreId]
    }));
  };

  const handleFormatChange = (format) => {
    setFilters(prev => ({
      ...prev,
      formats: prev.formats.includes(format)
        ? prev.formats.filter(f => f !== format)
        : [...prev.formats, format]
    }));
  };

  const handleLanguageChange = (language) => {
    setFilters(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handlePublisherChange = (publisherId) => {
    setFilters(prev => ({
      ...prev,
      publishers: prev.publishers.includes(publisherId)
        ? prev.publishers.filter(id => id !== publisherId)
        : [...prev.publishers, publisherId]
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      priceRange: [0, 100],
      rating: 0,
      isbn: '',
      publicationDateRange: {
        start: '',
        end: new Date().toISOString().split('T')[0]
      },
      availability: 'all',
      authors: [],
      genres: [],
      formats: [],
      languages: [],
      publishers: []
    });
  };

  return (
    <aside className="bg-white border rounded-lg p-4 w-full lg:w-64 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Price Range</label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={filters.priceRange[1]}
          onChange={handlePriceRangeChange}
          className="w-full" 
        />
        <div className="text-sm text-gray-600 mt-1">$0 - ${filters.priceRange[1]}</div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Availability</label>
        <div className="space-y-1 text-sm">
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              name="availability" 
              value="all"
              checked={filters.availability === 'all'}
              onChange={handleAvailabilityChange}
              className="form-radio" 
            /> All Items
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              name="availability" 
              value="inStock"
              checked={filters.availability === 'inStock'}
              onChange={handleAvailabilityChange}
              className="form-radio" 
            /> In Stock
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Authors</label>
        <div className="space-y-1 text-sm">
          {loading.authors ? (
            <p className="text-gray-500">Loading authors...</p>
          ) : error.authors ? (
            <p className="text-red-500">{error.authors}</p>
          ) : (
            authors.map((author) => (
              <label key={author.id} className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={filters.authors.includes(author.id)}
                  onChange={() => handleAuthorChange(author.id)}
                  className="form-checkbox" 
                /> {author.name}
              </label>
            ))
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Genres</label>
        <div className="space-y-1 text-sm">
          {loading.genres ? (
            <p className="text-gray-500">Loading genres...</p>
          ) : error.genres ? (
            <p className="text-red-500">{error.genres}</p>
          ) : (
            genres.map((genre) => (
              <label key={genre.id} className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={filters.genres.includes(genre.id)}
                  onChange={() => handleGenreChange(genre.id)}
                  className="form-checkbox" 
                /> {genre.name}
              </label>
            ))
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Formats</label>
        <div className="space-y-1 text-sm">
          {['Author', 'Collector', 'Deluxe', 'First', 'Hardcover', 'Limited', 'Paperback', 'Signed'].map((f) => (
            <label key={f} className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={filters.formats.includes(f)}
                onChange={() => handleFormatChange(f)}
                className="form-checkbox" 
              /> {f}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Languages</label>
        <div className="space-y-1 text-sm">
          {['English', 'Nepali', 'Sanskrit'].map((lang) => (
            <label key={lang} className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={filters.languages.includes(lang)}
                onChange={() => handleLanguageChange(lang)}
                className="form-checkbox" 
              /> {lang}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Publishers</label>
        <div className="space-y-1 text-sm">
          {loading.publishers ? (
            <p className="text-gray-500">Loading publishers...</p>
          ) : error.publishers ? (
            <p className="text-red-500">{error.publishers}</p>
          ) : (
            publishers.map((publisher) => (
              <label key={publisher.id} className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={filters.publishers.includes(publisher.id)}
                  onChange={() => handlePublisherChange(publisher.id)}
                  className="form-checkbox" 
                /> {publisher.name}
              </label>
            ))
          )}
        </div>
      </div>

      <button 
        className="w-full mt-4 text-sm bg-gray-100 hover:bg-gray-200 py-2 rounded"
        onClick={handleClearFilters}
      >
        Clear All
      </button>
    </aside>
  );
};

export default FilterPanel;
