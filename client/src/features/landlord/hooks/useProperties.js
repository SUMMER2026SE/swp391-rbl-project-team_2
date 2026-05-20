import { useState, useEffect } from 'react';
import { landlordService } from '../services/landlordService';

export const useProperties = (params = {}) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const data = await landlordService.getProperties(params);
        setProperties(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [params]);

  const addProperty = async (propertyData) => {
    try {
      const newProperty = await landlordService.createProperty(propertyData);
      setProperties([...properties, newProperty]);
      return newProperty;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateProperty = async (id, propertyData) => {
    try {
      const updated = await landlordService.updateProperty(id, propertyData);
      setProperties(properties.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProperty = async (id) => {
    try {
      await landlordService.deleteProperty(id);
      setProperties(properties.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { properties, loading, error, addProperty, updateProperty, deleteProperty };
};

export default useProperties;
