import { BreadcrumbsConfiguration } from "src/config/interfaces";
import { BasePayment } from "./interfaces";

type Validator = (payment: BasePayment) => boolean;

export const paymentContextRequirements = (
  config: BreadcrumbsConfiguration
): Validator[] => {
  return [
    (p: BasePayment) => p.recipient !== config.baking_address, // in case rewards are redirected to baker himself
    (p: BasePayment) =>
      config.network_configuration?.suppress_smartcontract_payments
        ? !p.recipient.startsWith("KT")
        : true,
  ];
};

export const paymentAmountRequirements: Validator[] = [
  (p: BasePayment) => p.amount.gt(0),
];

export const paymentContextRequirementsFactory = (config) =>
  requirementsFactory(paymentContextRequirements(config));

export const requirementsFactory =
  (requirements: Validator[]) => (p: BasePayment) =>
    arePaymentsRequirementsMet(p, requirements);

export const paymentRequirementsMetFactory =
  (requirements: Validator[]) => (p: BasePayment) =>
    arePaymentsRequirementsMet(p, requirements);

const arePaymentsRequirementsMet = (
  p: BasePayment,
  requirements: Validator[]
) => {
  for (const requirement of requirements) {
    if (!requirement(p)) return false;
  }
  return true;
};
