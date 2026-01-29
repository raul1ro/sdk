import { Transaction, TransactionResult } from '@mysten/sui/transactions';
import { Coin } from '../../../core';
import { Protocol } from '../../constants';
import { Swap, SwapConstructorOptions } from '../Swap';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils';

export interface CetusDlmmSwapProtocolConfig {
  wrappedRouterPackageId: string;
  globalConfigObjectId: string;
  versionedObjectId: string;
}

export interface CetusDlmmSwapOptions<CInput extends Coin, COutput extends Coin>
  extends SwapConstructorOptions<CInput, COutput, CetusDlmmSwapProtocolConfig> {
  xForY: boolean;
}

export class CetusDlmmSwap<
  CInput extends Coin,
  COutput extends Coin
> extends Swap<
  CInput,
  COutput,
  CetusDlmmSwapProtocolConfig,
  CetusDlmmSwapOptions<CInput, COutput>
> {
  public readonly xForY!: boolean;
  public readonly swapTimestampMs!: number;
  public readonly signatures!: string[];

  constructor(options: CetusDlmmSwapOptions<CInput, COutput>) {
    super(options);
    this.xForY = options.xForY;
  }

  public override protocol(): Protocol {
    return Protocol.CETUS_DLMM;
  }

  public swap =
    (routeObject: TransactionResult) =>
    (tx: Transaction): void => {
      const {
        wrappedRouterPackageId,
        globalConfigObjectId,
        versionedObjectId,
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
          tx.object(globalConfigObjectId),
          tx.object(versionedObjectId),
          tx.object(SUI_CLOCK_OBJECT_ID),
        ],
      });
    };
}
