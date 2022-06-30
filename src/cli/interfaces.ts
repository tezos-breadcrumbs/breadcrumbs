export interface PrintableDelegatorPayment {
  delegator: string;
  recipient: string;
  amount: string;
  feeRate: string;
  delegatorBalance: string;
  transactionFee: string;
}

export interface PrintableExcludedPayment {
  delegator: string;
  recipient: string;
  amount: string;
  delegatorBalance: string;
  note: string;
}

export interface PrintableBakerPayment {
  recipient: string;
  amount: string;
  type: string;
}
