import { useState, useEffect } from 'react';

/**
 * Delays updating a value until after a specified wait time.
 * Useful for search inputs to avoid firing API calls on every keystroke.
 */
const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
