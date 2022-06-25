import { BreadcrumbsConfiguration } from "src/config/interfaces";
import { BasePayment } from "src/engine/interfaces";

type Validator = (payment: BasePayment) => boolean;

const paymentContextRequirements = (
  config: BreadcrumbsConfiguration
): Validator[] => {
  return [
    (p: BasePayment) => p.recipient !== config.baking_address, // in case rewards are redirected to baker himself
    (p: BasePayment) =>
      config.network_configuration?.suppress_KT_payments
        ? !p.recipient.startsWith("KT")
        : true,
  ];
};

const paymentAmountRequirements: Validator[] = [
  (p: BasePayment) => p.amount.gt(0),
];

const arePaymentsRequirementsMet = (
  p: BasePayment,
  requirements: Validator[]
) => {
  for (const requirement of requirements) {
    if (!requirement(p)) return false;
  }
  return true;
};

const requirementsFactory = (requirements: Validator[]) => (p: BasePayment) =>
  arePaymentsRequirementsMet(p, requirements);

export const paymentAmountRequirementsFactory = requirementsFactory(
  paymentAmountRequirements
);

export const paymentContextRequirementsFactory = (config) =>
  requirementsFactory(paymentContextRequirements(config));
