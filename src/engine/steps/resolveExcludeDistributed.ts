import { find, get, groupBy, some, uniq } from "lodash";
import { globalCliOptions } from "src/cli/global";
import { join } from "path";

import {
  BasePayment,
  DelegatorPayment,
  EPaymentType,
  StepArguments,
} from "src/engine/interfaces";
import { readPaymentReport } from "src/fs-client";
import {
  REPORTS_SUCCESS_PAYMENTS_DIRECTORY,
  REPORTS_FAILED_PAYMENTS_DIRECTORY,
} from "src/utils/constants";
import client from "src/api-client";
import { validateOperation, ValidationResult } from "@taquito/utils";

export const resolveExcludeDistributed = async (
  args: StepArguments
): Promise<StepArguments> => {
  const { cycleReport, flags } = args;

  const { delegatorPayments, feeIncomePayments, bondRewardPayments, cycle } =
    cycleReport;

  let appliedPayments: Array<DelegatorPayment | BasePayment> = [];
  try {
    appliedPayments = await readPaymentReport(
      cycle,
      join(globalCliOptions.workDir, REPORTS_SUCCESS_PAYMENTS_DIRECTORY)
    );
  } catch (err) {
    console.log(err);
    if (get(err, "code") !== "ENOENT") {
      throw new Error(
        "Unexpected internal error. Failed to check past payments."
      );
    }
  }

  try {
    const failedPayments: Array<DelegatorPayment | BasePayment> =
      await readPaymentReport(
        cycle,
        join(globalCliOptions.workDir, REPORTS_FAILED_PAYMENTS_DIRECTORY)
      );
    console.log(2);

    const opHashes = uniq(failedPayments.map((x) => x.hash));
    for (const opHash of opHashes) {
      if (validateOperation(opHash) !== ValidationResult.VALID) continue; // process only valid op hashes
      if (await client.areOperationTransactionsApplied(opHash)) {
        appliedPayments.push(
          ...failedPayments
            .filter((tx) => tx.hash === opHash)
            .map((tx) => ({ ...tx, note: `` }))
        );
        flags.successfulTransactionInFailed = true;
      }
    }
  } catch (err) {
    if (get(err, "code") !== "ENOENT") {
      throw new Error(
        "Unexpected internal error. Failed to check past payments."
      );
    }
  }

  if (appliedPayments.length === 0) return args;

  /* appliedPayments includes payments excluded by minimum amount or minimum balance in the CSV file. */

  const appliedPaymentsGroupedByType = groupBy(
    appliedPayments,
    (payment) => payment.type
  );

  /* 
    Delegator payments cannot be matched via the recipient key 
    as multiple delegators may have the same recipient. 
  */

  /* 
    If there is change in the configured minimum balance or 
    payment thresholds, a previously excluded payment would
    still be excluded because it is present in both arrays. 
    (`delegatorPayments` and `appliedPayments`)
  */

  const pendingDelegatorPayments = delegatorPayments.filter(
    (payment) =>
      !some(
        appliedPaymentsGroupedByType[
          EPaymentType.Delegator
        ] as DelegatorPayment[],
        (paid) => paid.delegator === payment.delegator
      )
  );

  /* 
    If there is change in the configured income recipients, 
    a new payment would show up here. Ignoring this edge 
    case.
  */

  const pendingFeeIncomePayments = feeIncomePayments.filter(
    (payment) =>
      !some(
        appliedPaymentsGroupedByType[EPaymentType.FeeIncome],
        (paid) => paid.recipient === payment.recipient
      )
  );

  const pendingBondRewardPayments = bondRewardPayments.filter(
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
    flags,
  };
};
