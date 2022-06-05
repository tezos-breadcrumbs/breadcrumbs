import { initializeCycleReport } from "./engine/helpers";

import client from "src/api-client";
import engine from "src/engine";
import { get_config } from "./config";
import { print_payments_table } from "./cli/print";
import { createProvider, prepareTransaction, submitBatch } from "./tezos-client";
import { arePaymentsRequirementsMet } from "./engine/validate";
import { cliOptions } from "./cli";


export const pay = async () => {
	if (cliOptions.dryRun) {
		console.log(`Running in 'dry-run' mode...`)
	}

	const config = get_config()
	const cycle = Number(cliOptions.cycle);

	if (isNaN(cycle)) {
		throw Error("No cycle number given.");
	}

	const cycleReport = initializeCycleReport(cycle);
	const cycleData = await client.getCycleData(config.baking_address, cycle);

	const result = engine.run({
		config,
		cycleReport,
		cycleData,
		distributableRewards: cycleData.cycleRewards,
	});

	const { delegatorPayments, feeIncomePayments, bondRewardPayments } =
		result.cycleReport;

	const allPayments = [...delegatorPayments, ...feeIncomePayments, ...bondRewardPayments];
	const transactions = allPayments.filter(arePaymentsRequirementsMet).map(prepareTransaction)

	if (cliOptions.dryRun) {
		print_payments_table(allPayments)
		process.exit(0)
	}

	const provider = createProvider();
	await submitBatch(provider, transactions);
}