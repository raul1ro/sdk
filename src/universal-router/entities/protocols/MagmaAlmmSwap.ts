import { Transaction, TransactionResult } from '@mysten/sui/transactions';
import { Coin } from '../../../core';
import { Protocol } from '../../constants';
import { Swap, SwapConstructorOptions } from '../Swap';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils';

export interface DipCoinDexSwapProtocolConfig {
  wrappedRouterPackageId: string;
  globalConfigObjectId: string;
  factoryConfigObjectId: string;
}

export interface MagmaAlmmSwapOptions<CInput extends Coin, COutput extends Coin>
  extends SwapConstructorOptions<
    CInput,
    COutput,
    DipCoinDexSwapProtocolConfig
  > {
  xForY: boolean;
}

export class MagmaAlmmSwap<
  CInput extends Coin,
  COutput extends Coin
> extends Swap<
  CInput,
  COutput,
  DipCoinDexSwapProtocolConfig,
  MagmaAlmmSwapOptions<CInput, COutput>
> {
  public readonly xForY!: boolean;
  public readonly swapTimestampMs!: number;
  public readonly signatures!: string[];

  constructor(options: MagmaAlmmSwapOptions<CInput, COutput>) {
    super(options);
    this.xForY = options.xForY;
  }

  public override protocol(): Protocol {
    return Protocol.MAGMA_ALMM;
  }

  public swap =
    (routeObject: TransactionResult) =>
    (tx: Transaction): void => {
      const {
        wrappedRouterPackageId,
        globalConfigObjectId,
        factoryConfigObjectId,
      } = this.protocolConfig;
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
          tx.object(this.pool.id),
          tx.object(factoryConfigObjectId),
          tx.object(globalConfigObjectId),
          tx.object(SUI_CLOCK_OBJECT_ID),
        ],
      });
    };
}
