const isBoolean = val => typeof val === 'boolean';

const pick = (obj, arr) =>
  arr.reduce((acc, curr) => (curr in obj && (acc[curr] = obj[curr]), acc), {});

module.exports = { isBoolean, pick };