const Joi = require('joi');

const validateRegistration = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).min(10).max(20),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required()
  });

  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  return schema.validate(data);
};

const validatePinSetup = (data) => {
  const schema = Joi.object({
    pin: Joi.string().pattern(/^\d{4,6}$/).required()
  });

  return schema.validate(data);
};

module.exports = {
  validateRegistration,
  validateLogin,
  validatePinSetup
};