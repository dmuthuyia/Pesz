const Joi = require('joi');

const validateCard = (data) => {
  const schema = Joi.object({
    cardNumber: Joi.string().pattern(/^\d{13,19}$/).required(),
    cardHolderName: Joi.string().min(2).max(100).required(),
    expiryMonth: Joi.number().integer().min(1).max(12).required(),
    expiryYear: Joi.number().integer().min(new Date().getFullYear()).required(),
    cardType: Joi.string().valid('visa', 'mastercard', 'amex', 'discover').required()
  });

  return schema.validate(data);
};

module.exports = {
  validateCard
};