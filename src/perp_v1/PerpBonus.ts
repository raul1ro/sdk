import { NETWORK, TxBuilder } from '../core';
import { CONFIGS, IPerpConfig } from './constants';

export class PerpBonus extends TxBuilder {
  private readonly packageId!: string;
  private readonly modulePool = 'perp_bonus';
  private config: IPerpConfig;

  constructor(network: NETWORK) {
    super(network);
    this.config = CONFIGS[network];
    this.packageId = this.config.packageId;
  }

  depositFund(coinObjectId: string) {
    const tx = this.getTx();

    return tx.moveCall({
      target: `${this.packageId}::${this.modulePool}::admin_deposit`,
      arguments: [
        tx.object(this.config.vaultObjectId),
        tx.object(coinObjectId),
      ],
    });
  }

  withdrawFund(amount: string) {
    const tx = this.getTx();

    return tx.moveCall({
      target: `${this.packageId}::${this.modulePool}::admin_withdraw`,
      arguments: [tx.object(this.config.vaultObjectId), tx.pure.u64(amount)],
    });
  }

  grantWhitelist(accounts: string[], amounts: string[]) {
    const tx = this.getTx();

    return tx.moveCall({
      target: `${this.packageId}::${this.modulePool}::grant_whitelist`,
      arguments: [
        tx.object(this.config.adminCapObjectId),
        tx.object(this.config.vaultObjectId),
        tx.pure.vector('address', accounts),
        tx.pure.vector('u64', amounts),
      ],
    });
  }

  revokeWhitelist(accounts: string[]) {
    const tx = this.getTx();

    return tx.moveCall({
      target: `${this.packageId}::${this.modulePool}::grant_whitelist`,
      arguments: [
        tx.object(this.config.adminCapObjectId),
        tx.object(this.config.vaultObjectId),
        tx.pure.vector('address', accounts),
      ],
    });
  }

  isEligibleBonus(account: string) {
    const tx = this.getTx();

    return tx.moveCall({
      target: `${this.packageId}::${this.modulePool}::is_eligible_bonus`,
      arguments: [
        tx.object(this.config.vaultObjectId),
        tx.pure.address(account),
      ],
    });
  }

  claim() {
    const tx = this.getTx();

    return tx.moveCall({
      target: `${this.packageId}::${this.modulePool}::claim`,
      arguments: [
        tx.object(this.config.vaultObjectId),
      ],
    });
  }
}
