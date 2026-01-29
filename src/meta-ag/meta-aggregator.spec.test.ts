import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { MetaAgQuoter } from './MetaAggregatorQuoter';
import { Exchange } from './types';
import { Transaction } from '@mysten/sui/transactions';

describe('MetaAgQuoter', () => {
  let quoter: MetaAgQuoter;
  const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

  it('getBestRoute should success', async () => {
    const sender =
      '0x935029ca5219502a47ac9b69f556ccf6e2198b5e7815cf50f68846f723739cbd';
    quoter = new MetaAgQuoter('mainnet');
    const params = {
      tokenIn: '0x2::sui::SUI',
      tokenOut:
        '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      amountIn: '10000000000',
    };

    const quote = await quoter.getBestRoute(params);
    if (!quote) {
      throw new Error('Can not get best route');
    }

    if (quote.exchange === Exchange.AFTERMATH) {
      const txb = new Transaction();
      const { coinOut, tx } = await quoter.buildTransaction(
        txb,
        quote,
        sender,
        1
      );

      if (!tx) {
        throw new Error('Can not build transaction');
      }

      tx.transferObjects([coinOut], sender);

      const resp = await client.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: sender,
      });

      expect(resp.effects.status.status).toEqual('success');

      if (resp.effects.status.status !== 'success') {
        console.dir(resp.error, { depth: 10 });
      }
    } else {
      const tx = new Transaction();
      const { coinOut } = await quoter.buildTransaction(tx, quote, sender, 1);

      tx.transferObjects([coinOut], sender);

      const resp = await client.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: sender,
      });

      expect(resp.effects.status.status).toEqual('success');

      if (resp.effects.status.status !== 'success') {
        console.dir(resp.error, { depth: 10 });
      }
    }
  });

  it('Build tx with Aftermath', async () => {
    quoter = new MetaAgQuoter('mainnet', [Exchange.AFTERMATH]);

    expect(quoter.getAdapters().length).toEqual(1);
    expect(quoter.getAdapters()[0].name()).toEqual(Exchange.AFTERMATH);

    const params = {
      tokenIn: '0x2::sui::SUI',
      tokenOut:
        '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      amountIn: '10000000000',
    };

    const quote = await quoter.getBestRoute(params);

    expect(quote?.exchange).toEqual(Exchange.AFTERMATH);

    const txb = new Transaction();
    const { coinOut, tx } = await quoter.buildTransaction(
      txb,
      quote,
      '0x935029ca5219502a47ac9b69f556ccf6e2198b5e7815cf50f68846f723739cbd',
      1
    );

    if (!tx) {
      throw new Error('Can not build transaction');
    }

    tx.transferObjects(
      [coinOut],
      '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7'
    );

    const resp = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender:
        '0x935029ca5219502a47ac9b69f556ccf6e2198b5e7815cf50f68846f723739cbd',
    });

    expect(resp.effects.status.status).toEqual('success');

    if (resp.effects.status.status !== 'success') {
      console.dir(resp.error, { depth: 10 });
    }
  });

  it('Build tx with Cetus', async () => {
    quoter = new MetaAgQuoter('mainnet', [Exchange.CETUS]);

    expect(quoter.getAdapters().length).toEqual(1);
    expect(quoter.getAdapters()[0].name()).toEqual(Exchange.CETUS);

    const params = {
      tokenIn: '0x2::sui::SUI',
      tokenOut:
        '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      amountIn: '10000000000',
    };

    const quote = await quoter.getBestRoute(params);

    expect(quote?.exchange).toEqual(Exchange.CETUS);

    const tx = new Transaction();
    const { coinOut } = await quoter.buildTransaction(
      tx,
      quote,
      '0x935029ca5219502a47ac9b69f556ccf6e2198b5e7815cf50f68846f723739cbd',
      1
    );

    tx.transferObjects(
      [coinOut],
      '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7'
    );

    const resp = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender:
        '0x935029ca5219502a47ac9b69f556ccf6e2198b5e7815cf50f68846f723739cbd',
    });

    expect(resp.effects.status.status).toEqual('success');

    if (resp.effects.status.status !== 'success') {
      console.dir(resp.error, { depth: 10 });
    }
  });

  it('Build tx with Bluefin', async () => {
    quoter = new MetaAgQuoter('mainnet', [Exchange.BLUEFIN]);

    expect(quoter.getAdapters().length).toEqual(1);
    expect(quoter.getAdapters()[0].name()).toEqual(Exchange.BLUEFIN);

    const params = {
      tokenIn: '0x2::sui::SUI',
      tokenOut:
        '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      amountIn: '10000000000',
    };

    const quote = await quoter.getBestRoute(params);

    expect(quote?.exchange).toEqual(Exchange.BLUEFIN);

    const tx = new Transaction();
    const { coinOut } = await quoter.buildTransaction(
      tx,
      quote,
      '0x935029ca5219502a47ac9b69f556ccf6e2198b5e7815cf50f68846f723739cbd',
      1
    );

    tx.transferObjects(
      [coinOut],
      '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7'
    );

    const resp = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender:
        '0x935029ca5219502a47ac9b69f556ccf6e2198b5e7815cf50f68846f723739cbd',
    });

    expect(resp.effects.status.status).toEqual('success');

    if (resp.effects.status.status !== 'success') {
      console.dir(resp.error, { depth: 10 });
    }
  });

  it('Build tx with Flowx', async () => {
    quoter = new MetaAgQuoter('mainnet', [Exchange.FLOWX]);

    expect(quoter.getAdapters().length).toEqual(1);
    expect(quoter.getAdapters()[0].name()).toEqual(Exchange.FLOWX);

    const params = {
      tokenIn: '0x2::sui::SUI',
      tokenOut:
        '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      amountIn: '10000000000',
    };

    const quote = await quoter.getBestRoute(params);

    expect(quote?.exchange).toEqual(Exchange.FLOWX);

    const tx = new Transaction();
    const { coinOut } = await quoter.buildTransaction(
      tx,
      quote,
      '0x935029ca5219502a47ac9b69f556ccf6e2198b5e7815cf50f68846f723739cbd',
      1
    );

    tx.transferObjects(
      [coinOut],
      '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7'
    );

    const resp = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender:
        '0x935029ca5219502a47ac9b69f556ccf6e2198b5e7815cf50f68846f723739cbd',
    });

    expect(resp.effects.status.status).toEqual('success');

    if (resp.effects.status.status !== 'success') {
      console.dir(resp.error, { depth: 10 });
    }
  });
});
