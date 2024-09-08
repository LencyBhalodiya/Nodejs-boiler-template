import Joi from 'joi';

const password = (value, helpers) => {
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/))
    return helpers.message('password must contain at least 1 letter and 1 number');

  return value;
};

const userRegister = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().min(7).required().custom(password),
  name: Joi.string().min(4).required(),
});

const userlogin = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().min(7).required().custom(password),
});

export { userRegister, userlogin };
