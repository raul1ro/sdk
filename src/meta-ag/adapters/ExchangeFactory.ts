import { ExchangeAdapter } from './ExchangeAdapter';
import { AftermathAdapter } from './AftermathAdapter';
import { BluefinAdapter } from './BluefinAdapter';
import { FlowxAdapter } from './FlowxAdapter';
import { Aftermath } from 'aftermath-ts-sdk';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Exchange, NETWORK } from '../types';
import { AggregatorClient } from '@cetusprotocol/aggregator-sdk';
import { CetusAdapter } from './CetusAdapter';

export class ExchangeFactory {
  static createAll(
    network: NETWORK,
    includeExchanges?: Exchange[]
  ): ExchangeAdapter[] {
    const suiClient = new SuiClient({ url: getFullnodeUrl(network) });
    const aftermath = new Aftermath(network.toUpperCase());
    const cetusClient = new AggregatorClient({ client: suiClient as any });
    if (includeExchanges) {
      return includeExchanges
        .map((ex) => {
          switch (ex) {
            case Exchange.AFTERMATH:
              return [new AftermathAdapter(aftermath)];
            case Exchange.BLUEFIN:
              return [new BluefinAdapter()];
            case Exchange.CETUS:
              return [new CetusAdapter(cetusClient)];
            case Exchange.FLOWX:
              return [new FlowxAdapter(network, suiClient)];
            default:
              return [];
          }
        })
        .flat();
    }
    return [
      new AftermathAdapter(aftermath),
      new BluefinAdapter(),
      new FlowxAdapter(network, suiClient),
      new CetusAdapter(cetusClient),
    ];
  }
}
