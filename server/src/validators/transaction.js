const Joi = require('joi');

const validateTransaction = (data) => {
  const schema = Joi.object({
    receiverEmail: Joi.string().email().required(),
    amount: Joi.number().positive().precision(2).required(),
    description: Joi.string().max(255).optional(),
    pin: Joi.string().pattern(/^\d{4,6}$/).optional()
  });

  return schema.validate(data);
};

module.exports = {
  validateTransaction
};