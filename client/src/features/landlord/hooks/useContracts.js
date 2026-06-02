import { useState, useEffect, useCallback } from 'react';
import { landlordService } from '../services/landlordService';

export const useContracts = (params = {}) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const paramsString = JSON.stringify(params);

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await landlordService.getContracts(JSON.parse(paramsString));
      setContracts(data.contracts || data);
      if (data.pagination) {
        setPagination(data.pagination);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [paramsString]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const createContract = async (contractData) => {
    try {
      const newContract = await landlordService.createContract(contractData);
      setContracts([newContract, ...contracts]);
      return newContract;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateContract = async (id, contractData) => {
    try {
      const updated = await landlordService.updateContract(id, contractData);
      setContracts(contracts.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const renewContract = async (id, renewData) => {
    try {
      const renewed = await landlordService.renewContract(id, renewData);
      setContracts(contracts.map(c => c.id === id ? renewed : c));
      return renewed;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const terminateContract = async (id, reason) => {
    try {
      const terminated = await landlordService.terminateContract(id, reason);
      setContracts(contracts.map(c => c.id === id ? terminated : c));
      return terminated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    contracts,
    loading,
    error,
    pagination,
    fetchContracts,
    createContract,
    updateContract,
    renewContract,
    terminateContract,
  };
};

export default useContracts;
