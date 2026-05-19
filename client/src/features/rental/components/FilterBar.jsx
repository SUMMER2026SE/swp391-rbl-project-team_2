import React from 'react';
import clsx from 'clsx';
import './FilterBar.css';

const FilterBar = ({ currentFilter, onFilterChange }) => {
  const filters = ['All', 'New', 'Under Review'];

  return (
    <div className="filter-bar">
      {filters.map((filter) => (
        <button
          key={filter}
          className={clsx('filter-btn', {
            'active': currentFilter === filter,
          })}
          onClick={() => onFilterChange(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
