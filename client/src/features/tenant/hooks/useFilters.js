import { useState, useCallback } from 'react';

export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
    priceMin: initialFilters.priceMin || 0,
    priceMax: initialFilters.priceMax || 10000000,
    location: initialFilters.location || '',
    amenities: initialFilters.amenities || [],
    roomType: initialFilters.roomType || '',
    sortBy: initialFilters.sortBy || 'newest',
    ...initialFilters,
  });

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const updateMultipleFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const addAmenity = useCallback((amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: [...new Set([...prev.amenities, amenity])],
    }));
  }, []);

  const removeAmenity = useCallback((amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity),
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      priceMin: 0,
      priceMax: 10000000,
      location: '',
      amenities: [],
      roomType: '',
      sortBy: 'newest',
    });
  }, []);

  return {
    filters,
    updateFilter,
    updateMultipleFilters,
    addAmenity,
    removeAmenity,
    resetFilters,
  };
};

export default useFilters;
