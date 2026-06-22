const { Contract } = require('../models');

const cancelContract = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const tenantId = req.user.userId;

    const contract = await Contract.findOne({
      where: { contract_id: contractId, tenant_id: tenantId }
    });

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found.' });
    }

    if (contract.status === 'active' || contract.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an active or completed contract.' });
    }

    contract.status = 'cancelled';
    await contract.save();

    return res.status(200).json({
      success: true,
      message: 'Contract cancelled successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = cancelContract;
