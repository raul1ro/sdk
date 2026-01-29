import { Transaction, TransactionResult } from '@mysten/sui/transactions';
import { Coin, Percent } from '../../../core';
import { Swap, SwapConstructorOptions } from '../Swap';
import { Protocol } from '../../constants';

export interface SuiRewardsMeSwapProtocolConfig {
  wrappedRouterPackageId: string;
  configObjectId: string;
}

export interface SuiRewardsMeSwapSwapOptions<
  CInput extends Coin,
  COutput extends Coin
> extends SwapConstructorOptions<
    CInput,
    COutput,
    SuiRewardsMeSwapProtocolConfig
  > {
  xForY: boolean;
}

export class SuiRewardsMeSwap<
  CInput extends Coin,
  COutput extends Coin
> extends Swap<
  CInput,
  COutput,
  SuiRewardsMeSwapProtocolConfig,
  SuiRewardsMeSwapSwapOptions<CInput, COutput>
> {
  public readonly xForY!: boolean;

  constructor(options: SuiRewardsMeSwapSwapOptions<CInput, COutput>) {
    super(options);
    this.xForY = options.xForY;
  }

  public override protocol(): Protocol {
    return Protocol.SUI_REWARDS;
  }

  public swap =
    (routeObject: TransactionResult, slippage: Percent) =>
    (tx: Transaction): void => {
      const { wrappedRouterPackageId, configObjectId } = this.protocolConfig;
      tx.moveCall({
        target: `${wrappedRouterPackageId}::swap_router::${
          this.xForY ? 'swap_exact_x_to_y' : 'swap_exact_y_to_x'
        }`,
        typeArguments: [
          this.xForY ? this.input.coinType : this.output.coinType,
          this.xForY ? this.output.coinType : this.input.coinType,
        ],
        arguments: [
          routeObject,
          tx.object(configObjectId),
          tx.object(this.pool.id),
          tx.object('0x6'),
        ],
      });
    };
}
