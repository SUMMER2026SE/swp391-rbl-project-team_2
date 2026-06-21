const { Op } = require('sequelize');
const { Contract, Room, User, Notification } = require('../models');

// Generate unique contract number
const generateContractNumber = async () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CT-${timestamp}-${random}`;
};

// =========================================================
// POST /api/landlord/contracts
// Create a new contract
// =========================================================
const createContract = async (req, res, next) => {
  try {
    const { roomId, tenantId, startDate, endDate, monthlyRent, depositAmount, termsAndConditions } = req.body;
    const landlordId = req.user.userId;

    // Validate required fields
    if (!roomId || !tenantId || !startDate || !endDate || !monthlyRent) {
      return res.status(400).json({
        success: false,
        message: 'Room ID, tenant ID, start date, end date, and monthly rent are required.',
      });
    }

    // Verify room ownership
    const room = await Room.findOne({
      where: { room_id: roomId, landlord_id: landlordId, is_deleted: false },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    // Verify tenant exists
    const tenant = await User.findOne({
      where: { user_id: tenantId, is_deleted: false },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found.',
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date.',
      });
    }

    const contractNumber = await generateContractNumber();

    const contract = await Contract.create({
      room_id: roomId,
      tenant_id: tenantId,
      landlord_id: landlordId,
      contract_number: contractNumber,
      start_date: start,
      end_date: end,
      monthly_rent: monthlyRent,
      deposit_amount: depositAmount || null,
      status: 'active',
      terms_and_conditions: termsAndConditions || null,
    });

    // Create notification for tenant
    await Notification.create({
      user_id: tenantId,
      title: 'New Contract Created',
      message: `A new rental contract has been created for ${room.title}`,
      notification_type: 'contract',
      related_id: contract.contract_id,
    });

    return res.status(201).json({
      success: true,
      message: 'Contract created successfully!',
      data: {
        contractId: contract.contract_id,
        contractNumber: contract.contract_number,
        status: contract.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/landlord/contracts
// Get all contracts for landlord
// =========================================================
const getLandlordContracts = async (req, res, next) => {
  try {
    const landlordId = req.user.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { landlord_id: landlordId };
    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Contract.findAndCountAll({
      where,
      include: [
        { model: Room, as: 'room', attributes: ['room_id', 'title', 'address', 'ward', 'district', 'city', 'room_type', 'bedrooms', 'max_occupants', 'area_sqm'] },
        { model: User, as: 'tenant', attributes: ['user_id', 'full_name', 'email', 'phone'] },
      ],
      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: rows.map(contract => ({
        contractId: contract.contract_id,
        contractNumber: contract.contract_number,
        roomId: contract.room_id,
        tenantId: contract.tenant_id,
        startDate: contract.start_date,
        endDate: contract.end_date,
        monthlyRent: contract.monthly_rent,
        depositAmount: contract.deposit_amount,
        status: contract.status,
        isRenewed: contract.is_renewed,
        room: contract.room,
        tenant: contract.tenant,
        createdAt: contract.created_at,
      })),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/landlord/contracts/:contractId
// Get contract details
// =========================================================
const getContractDetails = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const landlordId = req.user.userId;

    const contract = await Contract.findOne({
      where: { contract_id: contractId, landlord_id: landlordId },
      include: [
        { model: Room, as: 'room', attributes: ['room_id', 'title', 'address', 'ward', 'district', 'city', 'room_type', 'bedrooms', 'max_occupants', 'area_sqm', 'price_per_month'] },
        { model: User, as: 'tenant', attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url'] },
      ],
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        contractId: contract.contract_id,
        contractNumber: contract.contract_number,
        roomId: contract.room_id,
        tenantId: contract.tenant_id,
        startDate: contract.start_date,
        endDate: contract.end_date,
        monthlyRent: contract.monthly_rent,
        depositAmount: contract.deposit_amount,
        status: contract.status,
        termsAndConditions: contract.terms_and_conditions,
        documentUrl: contract.document_url,
        isRenewed: contract.is_renewed,
        renewalContractId: contract.renewal_contract_id,
        room: contract.room,
        tenant: contract.tenant,
        createdAt: contract.created_at,
        updatedAt: contract.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/landlord/contracts/:contractId
// Update contract
// =========================================================
const updateContract = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const { monthlyRent, depositAmount, termsAndConditions, status } = req.body;
    const landlordId = req.user.userId;

    const contract = await Contract.findOne({
      where: { contract_id: contractId, landlord_id: landlordId },
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found.',
      });
    }

    if (monthlyRent) contract.monthly_rent = monthlyRent;
    if (depositAmount) contract.deposit_amount = depositAmount;
    if (termsAndConditions) contract.terms_and_conditions = termsAndConditions;
    if (status) contract.status = status;

    contract.updated_at = new Date();
    await contract.save();

    return res.status(200).json({
      success: true,
      message: 'Contract updated successfully!',
      data: {
        contractId: contract.contract_id,
        status: contract.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/landlord/contracts/:contractId/renew
// Renew contract
// =========================================================
const renewContract = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const { newEndDate, newMonthlyRent } = req.body;
    const landlordId = req.user.userId;

    if (!newEndDate) {
      return res.status(400).json({
        success: false,
        message: 'New end date is required.',
      });
    }

    const originalContract = await Contract.findOne({
      where: { contract_id: contractId, landlord_id: landlordId },
      include: [
        { model: Room, as: 'room' },
        { model: User, as: 'tenant' },
      ],
    });

    if (!originalContract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found.',
      });
    }

    // Create new contract
    const contractNumber = await generateContractNumber();
    const newContract = await Contract.create({
      room_id: originalContract.room_id,
      tenant_id: originalContract.tenant_id,
      landlord_id: landlordId,
      contract_number: contractNumber,
      start_date: originalContract.end_date,
      end_date: new Date(newEndDate),
      monthly_rent: newMonthlyRent || originalContract.monthly_rent,
      deposit_amount: originalContract.deposit_amount,
      status: 'active',
      terms_and_conditions: originalContract.terms_and_conditions,
    });

    // Update original contract
    originalContract.status = 'renewed';
    originalContract.is_renewed = true;
    originalContract.renewal_contract_id = newContract.contract_id;
    await originalContract.save();

    // Create notification for tenant
    await Notification.create({
      user_id: originalContract.tenant_id,
      title: 'Contract Renewed',
      message: `Your rental contract for ${originalContract.room.title} has been renewed`,
      notification_type: 'contract',
      related_id: newContract.contract_id,
    });

    return res.status(201).json({
      success: true,
      message: 'Contract renewed successfully!',
      data: {
        newContractId: newContract.contract_id,
        newContractNumber: newContract.contract_number,
        status: newContract.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/landlord/contracts/:contractId/terminate
// Terminate contract
// =========================================================
const terminateContract = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const landlordId = req.user.userId;

    const contract = await Contract.findOne({
      where: { contract_id: contractId, landlord_id: landlordId },
      include: [
        { model: Room, as: 'room' },
        { model: User, as: 'tenant' },
      ],
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found.',
      });
    }

    contract.status = 'terminated';
    contract.updated_at = new Date();
    await contract.save();

    // Update room status to available
    contract.room.status = 'available';
    await contract.room.save();

    // Create notification for tenant
    await Notification.create({
      user_id: contract.tenant_id,
      title: 'Contract Terminated',
      message: `Your rental contract for ${contract.room.title} has been terminated`,
      notification_type: 'contract',
      related_id: contract.contract_id,
    });

    return res.status(200).json({
      success: true,
      message: 'Contract terminated successfully!',
      data: {
        contractId: contract.contract_id,
        status: contract.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContract,
  getLandlordContracts,
  getContractDetails,
  updateContract,
  renewContract,
  terminateContract,
};
