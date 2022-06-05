import BigNumber from "bignumber.js";

export interface PrintablePayment {
  cycle: number;
  recipient: string;
  amount: BigNumber | string;
  delegatorBalance: BigNumber | string;
  hash: string;
}
