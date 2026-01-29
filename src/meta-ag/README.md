# MetaAgQuoter API

MetaAgQuoter is a class for aggregating swap quotes and building transactions across multiple Sui DEXs.

## Constructor

### `new MetaAgQuoter(network: NETWORK, includeExchanges?: Exchange[])`

- `network`: Sui network name (`mainnet`, `testnet`, etc.)
- `includeExchanges` (optional): Array of exchanges to use. If omitted, all supported exchanges are included.

---

## Methods

### `getBestRoute(params: QuoteQueryParams): Promise<QuoteResult | null>`

Fetches the best swap route from all enabled exchanges.

- `params`: Object containing swap parameters:
  - `tokenIn`: Input token address.
  - `tokenOut`: Output token address.
  - `amountIn`: Amount to swap.
  - ...other query options.

**Returns:**  
A `QuoteResult` object with the best route, or `null` if no route is found.

---

### `buildTransaction(tx: Transaction, quote: QuoteResult, sender: string, slippage: number, coinIn?: TransactionObjectArgument): Promise<any>`

Builds a Sui transaction for the given quote.

- `tx`: The transaction object to build on.
- `quote`: The best route quote returned from `getBestRoute`.
- `sender`: The sender address.
- `slippage`: Slippage in basis points.
- `coinIn` (optional): The input coin object. If not provided, it will be auto-selected except for Aftermath exchange.

**Returns:**  
An object containing the output coin and, for Aftermath, the updated transaction.

**Example:**

```typescript
const quote = await quoter.getBestRoute(params);
const { coinOut, tx: aftermathTx } = await quoter.buildTransaction(tx, quote, sender, 100);
(aftermathTx ?? tx).transferObjects([coinOut], sender);
```

---

### `getAdapters(): ExchangeAdapter[]`

Returns the list of enabled exchange adapters.

---

## Usage Example

```typescript
import { MetaAgQuoter } from './MetaAggregatorQuoter';

const quoter = new MetaAgQuoter('mainnet', [Exchange.CETUS, Exchange.BLUEFIN]);
const params = {
  tokenIn: '0x2::sui::SUI',
  tokenOut: '0x...::usdc::USDC',
  amountIn: '10000000000',
};

const quote = await quoter.getBestRoute(params);
const txb = new Transaction()
const { coinOut, tx } = await quoter.buildTransaction(txb quote, sender, 100);
tx.transferObjects([coinOut], sender);
```

## Development

See `meta-aggregator.spec.test.ts` for more details
