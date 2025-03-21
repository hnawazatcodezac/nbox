const Validators = require("../schemas/index");

const _validate = async (data, validator) => {
  try {
    const validated = await Validators[validator].validateAsync(data, {
      abortEarly: false,
    });
    if (validated.error) {
      throw {
        status: 400,
        message: validated.error.details[0].message,
        error: validated.error.details[0].message,
      };
    }
    return validated;
  } catch (err) {
    if (err.isJoi) {
      const errors = err.details.reduce((acc, detail) => {
        if (!acc[detail.path[0]]) {
          acc[detail.path[0]] = [];
        }
        acc[detail.path[0]].push(detail.message);
        return acc;
      }, {});
      throw { status: 403, message: "Invalid format", error: errors };
    }
    throw { status: 500, message: "Internal server error", error: err };
  }
};

const bodyValidator = (validator) => {
  if (!Validators?.hasOwnProperty(validator))
    throw new Error(`'${validator}' validator doesn't exist`);
  return async (req, res, next) => {
    try {
      req.body = await _validate(req.body, validator);
      next();
    } catch (error) {
      return res.status(error.status).json({
        message: error.message,
        error: error.error,
        response: null,
      });
    }
  };
};

const paramsValidator = (validator) => {
  if (!Validators?.hasOwnProperty(validator))
    throw new Error(`'${validator}' validator doesn't exist`);
  return async (req, res, next) => {
    try {
      req.params = await _validate(req.params, validator);
      next();
    } catch (error) {
      return res.status(error.status).json({
        message: error.message,
        error: error.error,
        response: null,
      });
    }
  };
};

const queryValidator = (validator) => {
  if (!Validators?.hasOwnProperty(validator))
    throw new Error(`'${validator}' validator doesn't exist`);
  return async (req, res, next) => {
    try {
      req.query = await _validate(req.query, validator);
      next();
    } catch (error) {
      return res.status(error.status).json({
        message: error.message,
        error: error.error,
        response: null,
      });
    }
  };
};

module.exports = {
  bodyValidator,
  paramsValidator,
  queryValidator,
};
