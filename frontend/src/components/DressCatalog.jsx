import React, { useState, useMemo } from 'react';
import DressCard from './DressCard';
import { DRESS_CATEGORIES } from '../constants/dressesData';
import { Sparkles, SlidersHorizontal, ArrowUpDown, Tag, RotateCw, CheckCircle2 } from 'lucide-react';

export default function DressCatalog({
  dresses,
  searchQuery,
  setSearchQuery,
  favorites,
  onToggleFavorite,
  onAddToCart,
  onSelectDress
}) {
  const [selectedCategory, setSelectedCategory] = useState('All Lehengas');
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-low' | 'price-high' | 'rating'

  // Category Navigation Pills (Strictly All Lehengas & Navratri Special as requested)
  const dynamicCategories = useMemo(() => {
    return ['All Lehengas', 'Navratri Special'];
  }, []);

  // Filter & Search Logic (strictly exclude hidden items from customer store)
  const filteredDresses = useMemo(() => {
    let list = dresses.filter(item => !item.hidden);

    // Category Filter
    if (selectedCategory !== 'All Lehengas' && selectedCategory !== 'All Dresses') {
      list = list.filter(item => (item.category || '').toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search Query Filter (including Fabric Material search like Rayon, Cotton, Silk)
    if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(item => 
        (item.title && typeof item.title === 'string' && item.title.toLowerCase().includes(q)) ||
        (item.category && typeof item.category === 'string' && item.category.toLowerCase().includes(q)) ||
        (item.material && typeof item.material === 'string' && item.material.toLowerCase().includes(q)) ||
        (item.description && typeof item.description === 'string' && item.description.toLowerCase().includes(q)) ||
        (Array.isArray(item.tags) && item.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(q))) ||
        (Array.isArray(item.details) && item.details.some(d => typeof d === 'string' && d.toLowerCase().includes(q)))
      );
    }

    // Sorting
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [dresses, selectedCategory, searchQuery, sortBy]);

  return (
    <div className={`dress-catalog-section ${searchQuery?.trim() ? 'is-searching' : ''}`}>
      {/* Light Theme Editorial Seasonal Banner - Auto-hidden when user types in search */}
      {!searchQuery?.trim() && (
        <section className="catalog-hero-banner">
          <div className="hero-banner-content">
            <div className="hero-season-pill">
              <Tag size={13} />
              <span>SONEX ENTERPRISES // DIRECT FROM MANUFACTURER</span>
            </div>
            <h2 className="hero-headline">
              Navratri Special Designer Lehenga Collection
            </h2>
            <p className="hero-subhead">
              Experience our digital 360° showroom. Click on any lehenga below to launch the ultra-smooth turnaround fitting preview, examine authentic Gujarati Gamthi embroidery, mirror-work borders, and kali flairs with zero-jerk scroll controls.
            </p>
            <div className="hero-perks-row">
              <div className="hero-perk">
                <RotateCw size={15} className="perk-icon" />
                <span>Full 360° Smooth Turnaround on Every Lehenga</span>
              </div>
              <div className="hero-perk">
                <CheckCircle2 size={15} className="perk-icon" />
                <span>Heavy Kalis, Gamthi Threadwork &amp; Mirror Borders</span>
              </div>
              <div className="hero-perk">
                <Sparkles size={15} className="perk-icon" />
                <span>Multi-Size Dynamic Turnaround View (L, XL, XXL, XXXL)</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter and Category Navigation Bar */}
      <div className="catalog-controls-bar">
        {/* Dynamic Category Pills set by Admin */}
        <div className="category-pills-scroll">
          {dynamicCategories.map((cat) => (
            <button
              key={cat}
              className={`category-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="catalog-sort-box">
          <ArrowUpDown size={14} className="sort-icon" />
          <select 
            className="catalog-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="featured">Featured Runway</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Customer Rating</option>
          </select>
        </div>
      </div>

      {/* Search Query Feedback */}
      {searchQuery && (
        <div className="search-status-bar">
          <span>
            Found <strong>{filteredDresses.length}</strong> {filteredDresses.length === 1 ? 'dress' : 'dresses'} matching "<em>{searchQuery}</em>"
          </span>
          <button 
            className="clear-search-pill"
            onClick={() => setSearchQuery('')}
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Dresses Grid */}
      {filteredDresses.length > 0 ? (
        <div className="dresses-grid">
          {filteredDresses.map((dress) => (
            <DressCard
              key={dress.id}
              dress={dress}
              isFavorite={favorites.includes(dress.id)}
              onToggleFavorite={onToggleFavorite}
              onAddToCart={onAddToCart}
              onSelectDress={onSelectDress}
            />
          ))}
        </div>
      ) : (
        <div className="empty-search-state">
          <div className="empty-icon-circle">
            <SlidersHorizontal size={28} />
          </div>
          <h3>No lehengas found</h3>
          <p>We couldn't find any designs matching "{searchQuery}". Try searching for "Gamthi", "Mirror", "Cotton", or select "All Lehengas".</p>
          <button 
            className="reset-search-btn"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All Lehengas');
            }}
          >
            Show All Lehengas
          </button>
        </div>
      )}
    </div>
  );
}
