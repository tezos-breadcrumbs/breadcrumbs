export const filterRedirects = (input) => {
  const list = input.split(",");
  const result = {};
  for (const pair of list) {
    const [delegator, target] = pair.split(":");
    result[delegator] = target;
  }
  return result;
};
