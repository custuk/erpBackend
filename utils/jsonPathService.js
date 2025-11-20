const { JSONPath } = require("jsonpath-plus");

const cleanPath = (path) => {
  if (!path) return [];
  const sanitized = path.replace(/^\$\.?/, "");
  if (!sanitized) return [];
  return sanitized.split(".").filter(Boolean);
};

const setByPath = (target, path, value) => {
  const segments = cleanPath(path);
  if (!segments.length) {
    return value;
  }
  let pointer = target;
  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      pointer[segment] = value;
    } else {
      if (typeof pointer[segment] !== "object" || pointer[segment] === null) {
        pointer[segment] = {};
      }
      pointer = pointer[segment];
    }
  });
  return target;
};

const resolveExpression = (expression, data) => {
  if (typeof expression !== "string") return expression;
  if (!expression.trim().startsWith("$")) return expression;
  return JSONPath({
    path: expression,
    json: data,
    wrap: false,
  });
};

const processJsonPath = ({ data = {}, inputPath, outputPath, resultPath, parameters = {} }) => {
  const safeData = data && typeof data === "object" ? JSON.parse(JSON.stringify(data)) : {};

  const input = inputPath
    ? JSONPath({
        path: inputPath,
        json: safeData,
        wrap: false,
      })
    : safeData;

  const output = {};
  Object.entries(parameters || {}).forEach(([key, value]) => {
    output[key] = resolveExpression(value, safeData);
  });

  let result = JSON.parse(JSON.stringify(safeData));
  if (outputPath) {
    result = setByPath(result, outputPath, output);
  }

  if (resultPath) {
    result = setByPath(result, resultPath, output);
  }

  return {
    success: true,
    data: {
      input,
      output,
      result,
    },
  };
};

const validateJsonPath = ({ expression, sampleData }) => {
  try {
    const result = JSONPath({
      path: expression,
      json: sampleData,
      wrap: false,
    });
    return {
      success: true,
      data: {
        valid: true,
        result,
        error: null,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: {
        valid: false,
        result: null,
        error: error.message,
      },
    };
  }
};

module.exports = {
  processJsonPath,
  validateJsonPath,
};

