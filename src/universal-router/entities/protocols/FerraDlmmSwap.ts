import {
  Transaction,
  TransactionResult,
} from '@mysten/sui/transactions';
import { Coin, Percent } from '../../../core';
import { Protocol } from '../../constants';
import { Swap, SwapConstructorOptions } from '../Swap';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui.js/utils';

export interface DipCoinDexSwapProtocolConfig {
  wrappedRouterPackageId: string;
  globalConfigObjectId: string;
}

export interface FerraDlmmSwapOptions<CInput extends Coin, COutput extends Coin>
  extends SwapConstructorOptions<
    CInput,
    COutput,
    DipCoinDexSwapProtocolConfig
  > {
  xForY: boolean;
}

export class FerraDlmmSwap<
  CInput extends Coin,
  COutput extends Coin
> extends Swap<
  CInput,
  COutput,
  DipCoinDexSwapProtocolConfig,
  FerraDlmmSwapOptions<CInput, COutput>
> {
  public readonly xForY!: boolean;
  public readonly swapTimestampMs!: number;
  public readonly signatures!: string[];

  constructor(options: FerraDlmmSwapOptions<CInput, COutput>) {
    super(options);
    this.xForY = options.xForY;
  }

  public override protocol(): Protocol {
    return Protocol.FERRA_DLMM;
  }

  public swap =
    (routeObject: TransactionResult) =>
    (tx: Transaction): void => {
      const { wrappedRouterPackageId, globalConfigObjectId } =
        this.protocolConfig;
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
          tx.object(globalConfigObjectId),
          tx.object(this.pool.id),
          tx.object(SUI_CLOCK_OBJECT_ID),
        ],
      });
    };
}
