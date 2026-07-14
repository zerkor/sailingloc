import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ initialValues = {} }) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState(initialValues.location || '');
  const [type, setType] = useState(initialValues.type || '');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (type) params.set('type', type);
    navigate(`/boats?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-2xl border border-navy-900/[0.06] shadow-xl p-4 flex flex-col sm:flex-row gap-3"
    >
      <div className="flex-1">
        <label htmlFor="location" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Destination
        </label>
        <input
          id="location"
          type="text"
          placeholder="Marseille, Nice, Brest..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border-none outline-none text-navy-900 placeholder-gray-400 text-base"
        />
      </div>
      <div className="sm:border-l sm:border-gray-200 sm:pl-4 flex-1">
        <label htmlFor="type" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Type de bateau
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border-none outline-none text-navy-900 bg-white text-base"
        >
          <option value="">Tous les types</option>
          <option value="sailboat">Voilier</option>
          <option value="motorboat">Bateau à moteur</option>
          <option value="catamaran">Catamaran</option>
          <option value="rib">Semi-rigide</option>
        </select>
      </div>
      <button type="submit" className="btn-primary whitespace-nowrap">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        Rechercher
      </button>
    </form>
  );
};

export default SearchBar;
