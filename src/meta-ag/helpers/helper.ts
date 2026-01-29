import { SOURCES_MAP } from '../constants';
import { Exchange, Protocol } from '../types';

export class Helper {
  public static convertProtocolByAg(exchange: Exchange, sources?: Protocol[]) {
    if (!sources || sources.length == 0) {
      return null;
    }

    return sources
      .map((source) => {
        if (exchange == Exchange.BLUEFIN && source == Protocol.STEAMM) {
          return ['steamm', 'steamm_oracle_quoter', 'steamm_oracle_quoter_v2'];
        }

        if (exchange == Exchange.CETUS && source == Protocol.STEAMM) {
          return ['STEAMM', 'STEAMM_OMM_V2'];
        }

        return this.getValue(exchange, source);
      })
      .flat()
      .filter((item) => !!item);
  }

  private static getValue(exchange: Exchange, key: Protocol) {
    return SOURCES_MAP.get(exchange)?.get(key) ?? null;
  }
}
