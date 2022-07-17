import { uniq } from "lodash";
import { CycleData } from "src/api-client/abstract_client";
import { CycleReport, DelegatorPayment } from "src/engine/interfaces";
import { MUTEZ_FACTOR } from "src/utils/constants";
import { sum } from "src/utils/math";
import { NotificationInputData } from "./interfaces";

export const getDataForPlugins = (
  cycleData: CycleData,
  cycleReport: CycleReport
): NotificationInputData => {
  const { cycle, delegatorPayments } = cycleReport;

  return {
    cycle: cycle.toString(),
    cycleStakingBalance: cycleData.cycleStakingBalance.toString(),
    totalDistributed: sum(...delegatorPayments.map((p) => p.amount))
      .div(MUTEZ_FACTOR)
      .dp(3)
      .toString(),
    numberOfDelegators: uniq(
      delegatorPayments.map((x) => x.delegator)
    ).length.toString(),
  };
};

export const constructMessage = (
  message: string,
  data: Partial<NotificationInputData>
) => {
  return message
    .replace("<CYCLE>", data.cycle ?? "")
    .replace("<CYCLE_STAKING_BALANCE>", data.cycleStakingBalance ?? "")
    .replace("<N_DELEGATORS>", data.numberOfDelegators ?? "")
    .replace("<T_REWARDS>", data.totalDistributed ?? "");
};
