import _ from "lodash";
const {
  resolveBakerRewards,
  resolveExcludedDelegators,
  resolveDelegatorRewards,
  resolveExcludedPayments,
} = require("src/engine/steps");

const steps = [
  resolveBakerRewards,
  resolveExcludedDelegators,
  resolveDelegatorRewards,
  resolveExcludedPayments,
];

const process = (steps: Function[], args) => {
  if (!steps.length) return args; /* base case */

  const nextArgs = steps[0](args);
  const nextSteps = steps.slice(1);

  return process(nextSteps, nextArgs);
};
