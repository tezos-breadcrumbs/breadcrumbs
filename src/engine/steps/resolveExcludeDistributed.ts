import { filter, find, groupBy, some } from "lodash";
import { globalCliOptions } from "src/cli";
import { join } from "path";

import {
  BasePayment,
  DelegatorPayment,
  EPaymentType,
  StepArguments,
} from "src/engine/interfaces";
import { readPaymentReport } from "src/fs-client";
import { REPORTS_SUCCESS_PAYMENTS_DIRECTORY } from "src/utils/constants";

export const resolveExcludeDistributed = async (
  args: StepArguments
): Promise<StepArguments> => {
  const { cycleReport } = args;

  const { delegatorPayments, feeIncomePayments, bondRewardPayments, cycle } =
    cycleReport;

  const appliedPayments = await readPaymentReport(
    cycle,
    join(globalCliOptions.workDir, REPORTS_SUCCESS_PAYMENTS_DIRECTORY)
  );

  /* appliedPayments includes payments excluded by minimum amount or minimum balance in the CSV file. */

  const appliedPaymentsGroupedByType = groupBy(
    appliedPayments,
    (payment) => payment.type
  );

  const pendingDelegatorPayments = delegatorPayments.filter(
    (payment) =>
      !some(
        /* 
        Delegator payments cannot be matched via the recipient key 
        as multiple delegators may have the same recipient. 
        */

        /*
        If there is no change in configured minimum balance or 
        payment threshold, previously excluded payments do not
        show up here. 
        */

        /* 
        If there is change in the configured minimum balance or 
        payment threshold, a previously excluded payment would
        show up as pending here.
        */

        appliedPaymentsGroupedByType[
          EPaymentType.Delegator
        ] as DelegatorPayment[],
        (paid) => paid.delegator === payment.delegator
      )
  );

  const pendingFeeIncomePayments = feeIncomePayments.filter(
    /* 
        If there is change in the configured income recipients, 
        a new payment would show up here. 
        */
    (payment) =>
      !some(
        appliedPaymentsGroupedByType[EPaymentType.FeeIncome],
        (paid) => paid.recipient === payment.recipient
      )
  );

  const pendingBondRewardPayments = bondRewardPayments.filter(
    /* 
        If there is change in the configured income recipients, 
        a new payment would show up here. 
        */
    (payment) =>
      !some(
        appliedPaymentsGroupedByType[EPaymentType.BondReward],
        (paid) => paid.recipient === payment.recipient
      )
  );

  const allPendingPayments = [
    ...pendingDelegatorPayments,
    ...pendingFeeIncomePayments,
    ...pendingBondRewardPayments,
  ];

  const distributedPayments = [
    ...delegatorPayments,
    ...feeIncomePayments,
    ...bondRewardPayments,
  ]
    .filter((payment) => !allPendingPayments.includes(payment))
    .map((payment) => {
      return find(
        appliedPaymentsGroupedByType[payment.type],
        payment.type === EPaymentType.Delegator
          ? (paid) =>
              (paid as DelegatorPayment).delegator ===
              (payment as DelegatorPayment).delegator
          : (paid) => paid.recipient === payment.recipient
      );
    })
    /* Filter `undefined` results from the previous step*/
    .filter((payment) => payment) as BasePayment[];

  return {
    ...args,
    cycleReport: {
      ...cycleReport,
      delegatorPayments: pendingDelegatorPayments,
      feeIncomePayments: pendingFeeIncomePayments,
      bondRewardPayments: pendingBondRewardPayments,
      distributedPayments: distributedPayments,
    },
  };
};
