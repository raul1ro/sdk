import {
  ExchangeAdapter,
  NormalizedQuote,
  QuoteResult,
} from './ExchangeAdapter';
import {
  getQuote,
  buildTx,
  SourceDex,
  QuoteResponse,
} from '@bluefin-exchange/bluefin7k-aggregator-sdk';
import {
  Transaction,
  TransactionObjectArgument,
} from '@mysten/sui/transactions';
import { Exchange, QuoteQueryParams } from '../types';
import { Helper } from '../helpers';

export class BluefinAdapter implements ExchangeAdapter<QuoteResponse> {
  name() {
    return Exchange.BLUEFIN;
  }

  private toNormalized(
    q: QuoteResponse
  ): NormalizedQuote<QuoteResponse> | null {
    const amountOut = q?.returnAmount
      ? BigInt(q.returnAmountWithDecimal)
      : BigInt(0);
    return { exchange: this.name(), raw: q, amountOut };
  }

  async getRoutes(
    params: QuoteQueryParams
  ): Promise<NormalizedQuote<QuoteResponse> | null> {
    try {
      const resp = await getQuote({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn,
        sources: params.includeSources
          ? (Helper.convertProtocolByAg(
              Exchange.BLUEFIN,
              params.includeSources
            ) as SourceDex[])
          : undefined,
      });
      return this.toNormalized(resp);
    } catch (error: any) {
      throw new Error(
        `Get quote of ${this.name()} failed due to error ${error.message}`
      );
    }
  }

  async buildTx(
    tx: Transaction,
    quote: QuoteResult<QuoteResponse>,
    sender: string,
    slippage: number,
    coinIn: TransactionObjectArgument
  ) {
    const { coinOut } = await buildTx({
      quoteResponse: quote.route,
      accountAddress: sender,
      slippage: slippage,
      commission: { partner: sender, commissionBps: 0 },
      extendTx: {
        tx,
        coinIn,
      },
    });

    return { coinOut: coinOut as any, tx };
  }
}
