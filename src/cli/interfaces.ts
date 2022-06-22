import BigNumber from "bignumber.js";

export interface PrintableDelegatorPayment {
  delegator: string;
  recipient: string;
  amount: BigNumber | string;
  delegatorBalance: BigNumber | string;
  transactionFee: BigNumber | string;
}

export interface PrintableExcludedPayment {
  delegator: string;
  recipient: string;
  amount: BigNumber | string;
  delegatorBalance: BigNumber | string;
  note: string;
}

export interface PrintableBakerPayment {
  recipient: string;
  amount: BigNumber | string;
  type: string;
}
