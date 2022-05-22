# Breadcrumbs

### Overview

Breadcrumbs is a tool for Tezos validators (bakers :baguette_bread:) to pay their delegators.

### Objective

Reward payments from bakers to delegators are a cornerstone of Tezos' delegation-based liquid proof-of-stake model. `breadcrumbs` is a payment tool built with in the spirit of:

- increasing the choice of payout tools available and minimize dependency on single software stacks.
- establishing payout tool accessible to (and open to contribution from) the ecosystem of JS/TS developers.
- delivering life improvements to bakers continuously

### Features

- [x] Set a default service fee.
- [x] Set fees on a per-delegator basis.
- [x] Set separate payment addresses for given delegators.
- [x] Set minimum payment amounts.
- [x] Exclude given delegators from payment in case of overdelegation.
- [x] Protect the baker from overdelegation by ring-fencing 10% of the rewards.

Roadmap:

- [ ] Set minimum delegation amounts.
- [ ] Run the payouts script on a Docker container in the background.
- [ ] Persist reward data on a local PostgresDB
- [ ] Pay rewards in FA2 tokens via built-in swaps.

... and more! 

### Requirements

- Node 16

### Installation

Install dependencies by running the following command in the root directory:

```bash
$ npm i
```

### Configuration

### Usage

### Credits

This tool is powered by the [TzKT](https://tzkt.io) API and the [Tezos Taquito](https://tezostaquito.io/) library.
