import { Transaction, TransactionResult } from '@mysten/sui/transactions';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils';
import { Coin } from '../../../core';
import { Protocol } from '../../constants';
import { Swap, SwapConstructorOptions } from '../Swap';

export interface BoltProtocolConfig {
  wrappedRouterPackageId: string;
}
export interface BoltSwapOptions<CInput extends Coin, COutput extends Coin>
  extends SwapConstructorOptions<CInput, COutput, BoltProtocolConfig> {
  xForY: boolean;
}

export class BoltSwap<CInput extends Coin, COutput extends Coin> extends Swap<
  CInput,
  COutput,
  BoltProtocolConfig,
  BoltSwapOptions<CInput, COutput>
> {
  public readonly xForY!: boolean;

  constructor(options: BoltSwapOptions<CInput, COutput>) {
    super(options);
    this.xForY = options.xForY;
  }

  public protocol(): Protocol {
    return Protocol.BOLT;
  }

  public swap =
    (routeObject: TransactionResult) =>
    (tx: Transaction): void => {
      const { wrappedRouterPackageId } = this.protocolConfig;
      const oraclePriceId = this.oracles?.[0]?.priceId as string;
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
          tx.object(oraclePriceId),
          tx.object(SUI_CLOCK_OBJECT_ID),
        ],
      });
    };
}
