import { BigNumber } from "@ethersproject/bignumber";
import { parseEther } from "@ethersproject/units";
import { underline } from "chalk";
import {
  CandleGeniePredictionV3,
  PancakePredictionV2,
} from "./types/typechain";

// Utility Function to use **await sleep(ms)**
export const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

export enum STRATEGIES {
  Against = "Against",
  With = "With",
}


export const parseStrategy = (processArgv: string[]) => {
  const strategy = processArgv.includes("--with")
      ? STRATEGIES.With
      : STRATEGIES.Against;

  console.log(underline("Strategy:", strategy));

  if (strategy === STRATEGIES.Against) {
    console.log(
        "\n You can use this bot with or against the majority.\n",
        "Start the bot using the --With flag to bet with the majority.\n",
        "You may use the bot on Candle Genie or Pancakeswap\n",
        "Try now using the following commands!\n",
        underline("npm run start -- --with"),
        "or",
        underline("npm run cg -- --with")
    );
  }
  if (strategy === STRATEGIES.With) {
    console.log(
        "\n You can use this bot with or against the majority.\n",
        "Start the bot without the --With flag to bet against the majority.\n",
        "You may use the bot on Candle Genie or Pancakeswap\n",
        "Try now using the following commands!\n",
        underline("npm run start"),
        "or",
        underline("npm run cg")
    );
  }

  return strategy;
};

export const isAgainstBet = (
    bullAmount: BigNumber,
    bearAmount: BigNumber,
) => {
  const precalculation =
      (bullAmount.gt(bearAmount) && bullAmount.div(bearAmount).lt(5)) ||
      (bullAmount.lt(bearAmount) && bearAmount.div(bullAmount).gt(5));
  return precalculation;
};

export const isWithBet = (
    bullAmount: BigNumber,
    bearAmount: BigNumber,
) => {
  const precalculation =
      (bearAmount.gt(bullAmount) && bearAmount.div(bullAmount).lt(5)) ||
      (bearAmount.lt(bullAmount) && bullAmount.div(bearAmount).gt(5));
  return precalculation;
};

export const getClaimableEpochs = async (
    predictionContract: PancakePredictionV2,
    epoch: BigNumber,
    userAddress: string
) => {
  const claimableEpochs: BigNumber[] = [];

  for (let i = 1; i <= 5; i++) {
    const epochToCheck = epoch.sub(i);

    const [claimable, refundable, { claimed, amount }] = await Promise.all([
      predictionContract.claimable(epochToCheck, userAddress),
      predictionContract.refundable(epochToCheck, userAddress),
      predictionContract.ledger(epochToCheck, userAddress),
    ]);

    if (amount.gt(0) && (claimable || refundable) && !claimed) {
      claimableEpochs.push(epochToCheck);
    }
  }

  return claimableEpochs;
};

export const reduceWaitingTimeByTwoBlocks = (waitingTime: number) => {
  if (waitingTime <= 6000) {
    return waitingTime;
  }

  return waitingTime - 6000;
};

export const calculateDuesAmount = (amount: BigNumber | undefined) => {
  if (!amount || amount.div(50).lt(parseEther("0.01"))) {
    return parseEther("0.01");
  }

  return amount.div(50);
};

export const getClaimableEpochsCG = async (
    predictionContract: CandleGeniePredictionV3,
    epoch: BigNumber,
    userAddress: string
) => {
  const claimableEpochs: BigNumber[] = [];

  for (let i = 1; i <= 5; i++) {
    const epochToCheck = epoch.sub(i);

    const [claimable, refundable, { claimed, amount }] = await Promise.all([
      predictionContract.claimable(epochToCheck, userAddress),
      predictionContract.refundable(epochToCheck, userAddress),
      predictionContract.Bets(epochToCheck, userAddress),
    ]);

    if (amount.gt(0) && (claimable || refundable) && !claimed) {
      claimableEpochs.push(epochToCheck);
    }
  }

  return claimableEpochs;
};
