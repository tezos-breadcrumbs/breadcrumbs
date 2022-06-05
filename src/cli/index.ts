import { OptionValues, program } from "commander";
import { pay } from "src";

export let cliOptions: OptionValues = {}
export const run = async () => {
	// global options 
	program
		.requiredOption("-c, --cycle <number>", "specify the cycle to process")
		.option("--config <config>", "Path to configuration file", "./config.hjson")
		.option("-d, --dry-run", "Prints out rewards. Won't sumbit transactions.")
		
	// commands
	program
		.command("pay")
		.action(pay)


	// we need to set global options before action is executed
	program.hook("preAction", () => { 
		cliOptions = program.opts()
	})
	await program.parseAsync()
}

export const get_cli_option = (opt: keyof OptionValues) => {
	return cliOptions[opt]
} 
