import {
  coinWithBalance,
  Transaction,
  TransactionObjectArgument,
} from '@mysten/sui/transactions';
import { NETWORK } from '../core';
import {
  ExchangeAdapter,
  NormalizedQuote,
  QuoteResult,
} from './adapters/ExchangeAdapter';
import { ExchangeFactory } from './adapters/ExchangeFactory';
import { Exchange, QuoteQueryParams } from './types';
import invariant from 'tiny-invariant';
import { normalizeStructTag, SUI_TYPE_ARG } from '@mysten/sui/utils';

export class MetaAgQuoter {
  private readonly adapters: ExchangeAdapter[];

  constructor(
    public readonly network: NETWORK,
    public readonly includeExchanges?: Exchange[]
  ) {
    this.adapters = ExchangeFactory.createAll(network, includeExchanges);
  }

  async getBestRoute(params: QuoteQueryParams): Promise<QuoteResult | null> {
    await Promise.all(this.adapters.map((a) => a.init?.()));
    const routes = (
      await Promise.all(this.adapters.map((a) => a.getRoutes(params)))
    ).filter((r) => r);

    if (routes.length === 0) return null;

    const best = routes.reduce((prev, curr) =>
      this.score(curr) > this.score(prev) ? curr : prev
    );

    if (!best) {
      return null;
    }

    return {
      exchange: best.exchange,
      tokenIn: normalizeStructTag(params.tokenIn),
      amountIn: params.amountIn,
      route: best.raw,
    };
  }

  async buildTransaction(
    tx: Transaction,
    quote: QuoteResult<any> | null,
    sender: string,
    slippage: number,
    coinIn?: TransactionObjectArgument
  ) {
    if (!quote) {
      throw new Error('Invalid Quote');
    }

    if (!coinIn && quote.exchange !== Exchange.AFTERMATH) {
      invariant(sender, 'SENDER');

      coinIn = coinWithBalance({
        balance: BigInt(quote.amountIn.toString()),
        type: quote.tokenIn,
        useGasCoin: quote.tokenIn === normalizeStructTag(SUI_TYPE_ARG),
      })(tx);
    }

    const adapter = this.adapters.find((a) => a.name() === quote.exchange);
    if (!adapter) {
      throw new Error('Cannot get Adapter');
    }

    return adapter.buildTx(tx, quote, sender, slippage, coinIn);
  }

  private score(route: NormalizedQuote | null) {
    if (!route) return 0;
    const out = route.amountOut;
    return out;
  }

  //test-only
  public getAdapters() {
    return this.adapters;
  }
}
