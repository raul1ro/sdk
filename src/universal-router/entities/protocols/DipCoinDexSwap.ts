import { Transaction, TransactionResult } from '@mysten/sui/transactions';
import { Coin, Percent } from '../../../core';
import { Swap, SwapConstructorOptions } from '../Swap';
import { Protocol } from '../../constants';

export interface DipCoinDexSwapProtocolConfig {
  wrappedRouterPackageId: string;
  globalObjectId: string;
}

export interface DipCoinDexSwapSwapOptions<
  CInput extends Coin,
  COutput extends Coin
> extends SwapConstructorOptions<
    CInput,
    COutput,
    DipCoinDexSwapProtocolConfig
  > {
  xForY: boolean;
}

export class DipCoinDexSwap<
  CInput extends Coin,
  COutput extends Coin
> extends Swap<
  CInput,
  COutput,
  DipCoinDexSwapProtocolConfig,
  DipCoinDexSwapSwapOptions<CInput, COutput>
> {
  public readonly xForY!: boolean;

  constructor(options: DipCoinDexSwapSwapOptions<CInput, COutput>) {
    super(options);
    this.xForY = options.xForY;
  }

  public override protocol(): Protocol {
    return Protocol.DIPCOIN;
  }

  public swap =
    (routeObject: TransactionResult, slippage: Percent) =>
    (tx: Transaction): void => {
      const { wrappedRouterPackageId, globalObjectId } = this.protocolConfig;
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
          tx.object(globalObjectId),
          tx.object(this.pool.id),
        ],
      });
    };
}
