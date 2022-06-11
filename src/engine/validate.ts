import { getConfig } from "src/config";
import { BasePayment } from "./interfaces";

export const paymentContextRequirements = [
  (p: BasePayment) => p.recipient !== getConfig("baking_address"), // in case rewards are redirected to baker himself
  (p: BasePayment) =>
    getConfig("network_configuration")?.suppress_smartcontract_payments !=
      true || !p.recipient.startsWith("KT"),
];

export const paymentAmountRequirements = [(p: BasePayment) => p.amount.gt(0)];

export const arePaymentsRequirementsMet = (
  p: BasePayment,
  requirements: Array<(arg0: BasePayment) => boolean>
) => {
  for (const requirement of requirements) {
    if (!requirement(p)) return false;
  }
  return true;
};

export const paymentRequirementsMetFactory =
  (requirements: Array<(arg0: BasePayment) => boolean>) => (p: BasePayment) =>
    arePaymentsRequirementsMet(p, requirements);
