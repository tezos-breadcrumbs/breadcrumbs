import { get_config } from "src/config";
import { BasePayment } from "./interfaces";

const paymentRequirements = [
  (p: BasePayment) => p.recipient !== get_config("baking_address"), // in case rewards are redirected to baker himself
  (p: BasePayment) => !p.recipient.startsWith("KT"), // TODO: we need to allow payments to smart contracts
  (p: BasePayment) => p.amount.gt(0), // TODO: Add check for transaction fee
];

export const arePaymentsRequirementsMet = (p: BasePayment) => {
  for (const requirement of paymentRequirements) {
    if (!requirement(p)) return false;
  }
  return true;
};
