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
      const rawContracts = data.data || data.contracts || data;
      
      const mappedContracts = (Array.isArray(rawContracts) ? rawContracts : []).map(c => ({
        ...c,
        id: c.contractId || c.contract_id,
        contractNumber: c.contractNumber || c.contract_number,
        roomId: c.roomId || c.room_id,
        roomTitle: c.room?.title || c.roomTitle || 'Unknown Room',
        tenantId: c.tenantId || c.tenant_id,
        tenantName: c.tenantName || c.tenant_name || c.tenant?.full_name || 'Unknown Tenant',
        tenantEmail: c.tenant?.email,
        tenantPhone: c.tenant?.phone,
        startDate: c.startDate || c.start_date,
        endDate: c.endDate || c.end_date,
        monthlyRent: c.monthlyRent || c.monthly_rent,
        depositAmount: c.depositAmount || c.deposit_amount,
        status: (c.status || '').toUpperCase(),
        terms: c.termsAndConditions,
        duration: Math.round((new Date(c.endDate || c.end_date) - new Date(c.startDate || c.start_date)) / (1000 * 60 * 60 * 24 * 30)) || 0,
        renewalRequest: c.renewalRequest,
      }));
      
      setContracts(mappedContracts);
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
      setError(null);
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

  const approveRenewal = async (id, signatureData) => {
    try {
      const approved = await landlordService.approveRenewal(id, { landlordSignature: signatureData });
      fetchContracts(); // refresh to get updated status
      return approved;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const declineRenewal = async (id, reason) => {
    try {
      const declined = await landlordService.declineRenewal(id, reason);
      fetchContracts();
      return declined;
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
    approveRenewal,
    declineRenewal,
    terminateContract,
  };
};

export default useContracts;
