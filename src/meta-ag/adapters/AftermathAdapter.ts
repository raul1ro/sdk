import {
  ExchangeAdapter,
  NormalizedQuote,
  QuoteResult,
} from './ExchangeAdapter';
import {
  Aftermath,
  RouterCompleteTradeRoute,
  RouterProtocolName,
} from 'aftermath-ts-sdk';
import { Exchange, QuoteQueryParams } from '../types';
import { Helper } from '../helpers';
import {
  Transaction,
  TransactionObjectArgument,
} from '@mysten/sui/transactions';

export class AftermathAdapter
  implements ExchangeAdapter<RouterCompleteTradeRoute>
{
  constructor(private sdk: Aftermath) {}

  name() {
    return Exchange.AFTERMATH;
  }

  async init() {
    await this.sdk.init();
  }

  private toNormalized(
    route: RouterCompleteTradeRoute
  ): NormalizedQuote<RouterCompleteTradeRoute> | null {
    const amountOut = route?.coinOut?.amount
      ? BigInt(route.coinOut.amount)
      : BigInt(0);
    return { exchange: this.name(), raw: route, amountOut };
  }

  async getRoutes(
    params: QuoteQueryParams
  ): Promise<NormalizedQuote<RouterCompleteTradeRoute> | null> {
    const router = this.sdk.Router();
    try {
      const route = await router.getCompleteTradeRouteGivenAmountIn({
        coinInType: params.tokenIn,
        coinOutType: params.tokenOut,
        coinInAmount: BigInt(params.amountIn),
        protocolBlacklist: Helper.convertProtocolByAg(
          Exchange.AFTERMATH,
          params.excludeSources
        ) as RouterProtocolName[],
        protocolWhitelist: Helper.convertProtocolByAg(
          Exchange.AFTERMATH,
          params.includeSources
        ) as RouterProtocolName[],
      });
      return this.toNormalized(route);
    } catch (error: any) {
      throw new Error(
        `Get quote of ${this.name()} failed due to error ${error.message}`
      );
    }
  }

  async buildTx(
    tx: Transaction,
    quote: QuoteResult<RouterCompleteTradeRoute>,
    sender: string,
    slippage: number,
    coinIn?: TransactionObjectArgument
  ) {
    const router = this.sdk.Router();
    const { tx: newTx, coinOutId } =
      await router.addTransactionForCompleteTradeRoute({
        tx,
        walletAddress: sender,
        completeRoute: quote.route,
        slippage: slippage,
        coinInId: coinIn,
      });
    return { coinOut: coinOutId as any, tx: newTx };
  }
}
