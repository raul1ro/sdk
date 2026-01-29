import { TransactionArgument } from '@mysten/sui/transactions';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils';
import { MissingConfiguration } from '../auto-invest/errors';
import { NETWORK, TxBuilder } from '../core';
import { CONFIGS } from './constants';
import { IPricePredictPool } from './IPricePredictPool';
export class PricePredict extends TxBuilder {
  private readonly packageId!: string;
  private readonly modulePool = 'pool';

  constructor(network: NETWORK) {
    super(network);
    const configs = CONFIGS[network];

    if (configs.packageId == undefined) {
      throw new MissingConfiguration('packageId', network);
    }
    this.packageId = configs.packageId;
  }

  bet(
    pool: IPricePredictPool,
    predictedPrice: number | string,
    coin_in: { type: string; object: string | TransactionArgument }
  ) {
    const tx = this.getTx();

    tx.moveCall({
      target: `${this.packageId}::${this.modulePool}::bet`,
      typeArguments: [pool.marketCoinType, pool.bettingCoinType],
      arguments: [
        tx.object(pool.id),
        tx.object(SUI_CLOCK_OBJECT_ID),
        tx.pure.u64(predictedPrice),
        typeof coin_in.object === 'string'
          ? tx.object(coin_in.object)
          : coin_in.object,
      ],
    });
    return tx;
  }

  claim(pool: IPricePredictPool, betIndex: number) {
    const tx = this.getTx();
    tx.moveCall({
      target: `${this.packageId}::${this.modulePool}::claim`,
      typeArguments: [pool.marketCoinType, pool.bettingCoinType],
      arguments: [tx.object(pool.id), tx.pure.u64(betIndex)],
    });
    return tx;
  }
}
