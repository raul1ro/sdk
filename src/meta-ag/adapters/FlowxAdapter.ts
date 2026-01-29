import {
  ExchangeAdapter,
  NormalizedQuote,
  QuoteResult,
} from './ExchangeAdapter';
import {
  AggregatorQuoter,
  GetRoutesResult,
  Protocol,
  TradeBuilder,
} from '../../universal-router';
import { SuiClient } from '@mysten/sui/client';
import {
  Transaction,
  TransactionObjectArgument,
} from '@mysten/sui/transactions';
import { Exchange, NETWORK, QuoteQueryParams } from '../types';
import { Helper } from '../helpers';
import { Coin } from '../../core';

export class FlowxAdapter
  implements ExchangeAdapter<GetRoutesResult<Coin, Coin>>
{
  constructor(private network: NETWORK, private suiClient: SuiClient) {}
  name() {
    return Exchange.FLOWX;
  }

  private toNormalized(
    quote: GetRoutesResult<Coin, Coin>
  ): NormalizedQuote<GetRoutesResult<Coin, Coin>> | null {
    const amountOut = quote?.amountOut
      ? BigInt(String(quote.amountOut))
      : BigInt(0);
    return { exchange: this.name(), raw: quote, amountOut };
  }

  async getRoutes(
    params: QuoteQueryParams
  ): Promise<NormalizedQuote<GetRoutesResult<Coin, Coin>> | null> {
    const quoter = new AggregatorQuoter(this.network);
    try {
      const quote = await quoter.getRoutes({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn,
        includeSources: Helper.convertProtocolByAg(
          Exchange.FLOWX,
          params.includeSources
        ) as Protocol[],
        excludeSources: Helper.convertProtocolByAg(
          Exchange.FLOWX,
          params.excludeSources
        ) as Protocol[],
        commission: params.commission,
        maxHops: params.maxHops,
        splitDistributionPercent: params.splitDistributionPercent,
        excludePools: params.excludePools,
      });
      return this.toNormalized(quote);
    } catch (error: any) {
      throw new Error(
        `Get quote of ${this.name()} failed due to error ${error.message}`
      );
    }
  }

  async buildTx(
    tx: Transaction,
    quote: QuoteResult<GetRoutesResult<Coin, Coin>>,
    sender: string,
    slippage: number,
    coinIn: TransactionObjectArgument
  ) {
    const tradeBuilder = TradeBuilder.fromRoutes(quote.route.routes);
    const coinOut: any = await tradeBuilder
      .sender(sender)
      .slippage(slippage * 1e6)
      .build()
      .swap({ client: this.suiClient, tx, coinIn });
    return { coinOut: coinOut, tx };
  }
}
