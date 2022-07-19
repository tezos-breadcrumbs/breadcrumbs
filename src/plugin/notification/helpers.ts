import { uniq } from "lodash";
import { CycleData } from "src/api-client/abstract_client";
import { CycleReport } from "src/engine/interfaces";
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
  messageTemplate: string,
  data: Partial<NotificationInputData>
) => {
  return messageTemplate
    .replace("<CYCLE>", data.cycle ?? "UNKNOWN")
    .replace("<CYCLE_STAKING_BALANCE>", data.cycleStakingBalance ?? "UNKNOWN")
    .replace("<N_DELEGATORS>", data.numberOfDelegators ?? "UNKNOWN")
    .replace("<T_REWARDS>", data.totalDistributed ?? "UNKNOWN");
};
