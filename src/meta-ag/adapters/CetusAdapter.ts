import {
  ExchangeAdapter,
  NormalizedQuote,
  QuoteResult,
} from './ExchangeAdapter';

import { Exchange, QuoteQueryParams } from '../types';
import { Helper } from '../helpers';
import {
  AggregatorClient,
  Path,
  RouterError,
} from '@cetusprotocol/aggregator-sdk';
import { BN } from 'bn.js';
import {
  Transaction,
  TransactionObjectArgument,
} from '@mysten/sui/transactions';

type RouterDataV3 = {
  quoteID?: string;
  amountIn: any;
  amountOut: any;
  byAmountIn: boolean;
  paths: Path[];
  insufficientLiquidity: boolean;
  deviationRatio?: number;
  packages?: Map<string, string>;
  totalDeepFee?: number;
  error?: RouterError;
  overlayFee?: number;
};

export class CetusAdapter implements ExchangeAdapter<RouterDataV3> {
  constructor(private client: AggregatorClient) {}

  name() {
    return Exchange.CETUS;
  }

  private toNormalized(
    route: RouterDataV3 | null
  ): NormalizedQuote<RouterDataV3> | null {
    if (!route) return null;
    const amountOut = route.amountOut ? BigInt(route.amountOut) : BigInt(0);
    return { exchange: this.name(), raw: route, amountOut };
  }

  async getRoutes(
    params: QuoteQueryParams
  ): Promise<NormalizedQuote<RouterDataV3> | null> {
    try {
      const router = await this.client.findRouters({
        from: params.tokenIn,
        target: params.tokenOut,
        amount: new BN(params.amountIn),
        byAmountIn: true,
        providers: params.includeSources
          ? (Helper.convertProtocolByAg(
              Exchange.CETUS,
              params.includeSources
            ) as string[])
          : undefined,
      });
      return this.toNormalized(router);
    } catch (error: any) {
      throw new Error(
        `Get quote of ${this.name()} failed due to error ${error.message}`
      );
    }
  }

  async buildTx(
    tx: Transaction,
    quote: QuoteResult<RouterDataV3>,
    sender: string,
    slippage: number,
    coinIn: TransactionObjectArgument
  ) {
    tx.setSender(sender);
    const targetCoin: any = await this.client.routerSwap({
      router: quote.route,
      txb: tx as any,
      inputCoin: coinIn as any,
      slippage,
    });

    return { coinOut: targetCoin, tx };
  }
}
