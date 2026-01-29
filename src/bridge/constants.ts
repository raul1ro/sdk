export interface IBridgeConfig {
  packageId: string;
  versionedObjectId: string;
  treasuryObjectId: string;
  txStatusObjectId: string;
  coinTypeArgs: string;
  arbitrum: {
    chain: {
      id: number;
      rpcUrl: string;
      version: string;
    };
    usdcAddress: string;
    bridgeAddress: string;
    hyperLiquidAddress: string;
    usdcName: string;
  };
  permitDeadlineSecond: number;
}

export const CONFIGS: {
  mainnet: IBridgeConfig;
  testnet: IBridgeConfig;
} = {
  mainnet: {
    packageId:
      '0x10847461e9082108a764664f5634377168c841d2daf81c2a3de0baa9a42254bd',
    versionedObjectId:
      '0xf52c4b2af16221e86a0eb606748e70313ae15cdfb0264d7b3fef0c607e501ec6',
    treasuryObjectId:
      '0x202a3db8723923130e4ff4baaba240fa1f6711acb085f42682fa20d999432b7d',
    txStatusObjectId:
      '0x4249a9f4eeecf47a1eae43ae145545fcb22ec663ef58ebed458c4117fa638469',
    coinTypeArgs:
      '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
    arbitrum: {
      chain: {
        id: 42161,
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        version: '2',
      },
      usdcAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      bridgeAddress: '0x640cbD3728CF363570d5f2a021861eDD3e7EcaCE',
      hyperLiquidAddress: 'string',
      usdcName: 'USD Coin',
    },
    permitDeadlineSecond: 86400 * 365 * 200,
  },
  testnet: {
    packageId: '',
    versionedObjectId: '',
    treasuryObjectId: '',
    txStatusObjectId: '',
    coinTypeArgs: '0x2::sui::SUI',
    arbitrum: {
      chain: {
        id: 42161,
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        version: '2',
      },
      usdcAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      bridgeAddress: '0xa7f2dD4f18A4658Cbcad70cC885eb7AC63AdfA79',
      hyperLiquidAddress: 'string',
      usdcName: 'USD Coin',
    },
    permitDeadlineSecond: 86400 * 365 * 200,
  },
};
