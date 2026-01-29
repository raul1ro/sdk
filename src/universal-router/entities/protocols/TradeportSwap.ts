import { Transaction, TransactionResult } from '@mysten/sui/transactions';
import { BigintIsh, Coin, Fraction, Percent } from '../../../core';
import { Swap, SwapConstructorOptions } from '../Swap';
import { Protocol } from '../../constants';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils';

export interface TradeportRouterConfig {
  wrappedRouterPackageId: string;
  poolRegistryObjectId: string;
  versionedObjectId: string;
}

interface TradeportSwapOptions<CInput extends Coin, COutput extends Coin>
  extends SwapConstructorOptions<CInput, COutput, TradeportRouterConfig> {
  xForY: boolean;
  poolFee: BigintIsh;
  sqrtPriceX64Limit: BigintIsh;
  minSqrtPriceX64HasLiquidity: BigintIsh;
  maxSqrtPriceX64HasLiquidity: BigintIsh;
}

export class TradeportSwap<
  CInput extends Coin,
  COutput extends Coin
> extends Swap<
  CInput,
  COutput,
  TradeportRouterConfig,
  TradeportSwapOptions<CInput, COutput>
> {
  public readonly xForY!: boolean;
  public readonly poolFee!: BigintIsh;
  public readonly sqrtPriceX64Limit!: BigintIsh;
  public readonly minSqrtPriceX64HasLiquidity!: BigintIsh;
  public readonly maxSqrtPriceX64HasLiquidity!: BigintIsh;

  constructor(options: TradeportSwapOptions<CInput, COutput>) {
    super(options);
    this.xForY = options.xForY;
    this.poolFee = options.poolFee;
    this.sqrtPriceX64Limit = options.sqrtPriceX64Limit;
    this.maxSqrtPriceX64HasLiquidity = options.maxSqrtPriceX64HasLiquidity;
    this.minSqrtPriceX64HasLiquidity = options.minSqrtPriceX64HasLiquidity;
  }

  public override protocol(): Protocol {
    return Protocol.TRADEPORT;
  }

  public swap =
    (routeObject: TransactionResult, slippage: Percent) =>
    (tx: Transaction): void => {
      const sqrtPriceX64LimitAdjusted = this.xForY
        ? new Fraction(this.sqrtPriceX64Limit).multiply(
            new Percent(1).subtract(slippage)
          )
        : new Fraction(this.sqrtPriceX64Limit).multiply(slippage.add(1));

      const {
        wrappedRouterPackageId,
        poolRegistryObjectId,
        versionedObjectId,
      } = this.protocolConfig;
      tx.moveCall({
        target: `${wrappedRouterPackageId}::swap_router::swap_exact_input`,
        typeArguments: [this.input.coinType, this.output.coinType],
        arguments: [
          routeObject,
          tx.object(poolRegistryObjectId),
          tx.pure.u64(this.poolFee.toString()),
          tx.pure.u128(
            this.xForY
              ? Fraction.max(
                  sqrtPriceX64LimitAdjusted,
                  new Fraction(this.minSqrtPriceX64HasLiquidity)
                ).toFixed(0)
              : Fraction.min(
                  sqrtPriceX64LimitAdjusted,
                  new Fraction(this.maxSqrtPriceX64HasLiquidity)
                ).toFixed(0)
          ),
          tx.object(versionedObjectId),
          tx.object(SUI_CLOCK_OBJECT_ID),
        ],
      });
    };
}
