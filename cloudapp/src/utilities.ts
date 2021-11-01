const lowerCaseKeys = (obj: Object) => Object.fromEntries(
  Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v])
);

module.exports = { lowerCaseKeys };