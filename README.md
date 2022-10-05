# Breadcrumbs

### Overview

Breadcrumbs is a tool for Tezos validators (bakers :baguette_bread:) to pay their delegators.

### Objective

Reward payments from bakers to delegators are a cornerstone of Tezos' delegation-based liquid proof-of-stake model. `breadcrumbs` is a payment tool built with in the spirit of:

- increasing the choice of payout tools available and minimize dependency on single software stacks.
- establishing payout tool accessible to (and open to contribution from) the ecosystem of JS/TS developers.
- delivering life improvements to bakers

### Features

- [x] Set a default service fee.
- [x] Set fees on a per-delegator basis.
- [x] Set separate payment addresses for given delegators.
- [x] Set minimum payment amounts.
- [x] Set minimum delegator balances.
- [x] Exclude given delegators from payment in case of over-delegation\*
- [x] Protect the baker from over-delegation by ring-fencing 10% of the rewards.
- [x] Allow customized distribution of rewards associated with the baker's bond.
- [x] Allow customized distribution of fee income.
- [x] Send Telegram notifications.
- [x] Send Discord notifications.
- [x] Generate payment files (.csv) for each cycle.

### Setup and Usage

Please consult the [wiki](https://github.com/kalouo/breadcrumbs/wiki) for instructions related to setup and usage.

### Credits

This tool is powered by the [TzKT](https://tzkt.io) API and the [Tezos Taquito](https://tezostaquito.io/) library.
