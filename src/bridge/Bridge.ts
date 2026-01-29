import { TransactionArgument } from '@mysten/sui/transactions';
import {
  erc20Abi,
  maxUint64,
  parseAbi,
  parseSignature,
  PublicClient,
  WalletClient,
} from 'viem';
import { NETWORK, TxBuilder } from '../core';
import { CONFIGS, IBridgeConfig } from './constants';
import { stringToCharCodes } from './helper';

type EvmAddress = `0x${string}`;

export class Bridge extends TxBuilder {
  private readonly packageId!: string;
  private readonly modulePool = 'bridge_manager';
  private config: IBridgeConfig;

  constructor(network: NETWORK) {
    super(network);
    this.config = CONFIGS[network];
    this.packageId = this.config.packageId;
  }

  async permit(walletClient: WalletClient, publicClient: PublicClient) {
    const tx = this.getTx();
    const permit = await this.signPermit(walletClient, publicClient);
    const permitSigner = stringToCharCodes(permit.permitSignerAddress);
    const r = stringToCharCodes(permit.r);
    const s = stringToCharCodes(permit.s);
  
    tx.moveCall({
      target: `${this.packageId}::${this.modulePool}::permit`,
      arguments: [
        tx.object(this.config.versionedObjectId),
        tx.pure.vector('u8', permitSigner),
        tx.pure.u64(maxUint64),
        tx.pure.u64(permit.deadline),
        tx.pure.u64(permit.v as bigint),
        tx.pure.vector('u8', r),
        tx.pure.vector('u8', s),
      ],
    });

    return tx;
  }

  private async getNonce(evmPublicKey: EvmAddress, publicClient: PublicClient): Promise<bigint> {
    const usdcAbi = parseAbi([
      'function nonces(address owner) view returns (uint256)',
    ]);

    const nonce = await publicClient.readContract({
      address: this.config.arbitrum.usdcAddress as EvmAddress,
      abi: usdcAbi,
      functionName: 'nonces',
      args: [evmPublicKey],
      authorizationList: undefined
    });

    return nonce;
  }

  private async signPermit(walletClient: WalletClient, publicClient: PublicClient) {
    const publicKey = walletClient.account?.address ?? '';
    const nonce = await this.getNonce(publicKey as EvmAddress, publicClient);

    const payload = {
      owner: publicKey,
      spender: this.config.arbitrum.bridgeAddress,
      value: maxUint64.toString(),
      nonce,
      deadline:
        Math.floor(Date.now() / 1000) + this.config.permitDeadlineSecond,
    };

    const domain = {
      name: this.config.arbitrum.usdcName,
      version: this.config.arbitrum.chain.version,
      chainId: this.config.arbitrum.chain.id,
      verifyingContract: this.config.arbitrum.usdcAddress,
    };

    const permitTypes = {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    };

    const dataToSign = {
      domain,
      types: permitTypes,
      primaryType: 'Permit',
      message: payload,
      payload,
    };

    const signature = await walletClient.signTypedData(dataToSign as any);
    const signatureParsed = parseSignature(signature);

    return {
      r: signatureParsed.r,
      s: signatureParsed.s,
      v: signatureParsed.v,
      deadline: payload.deadline,
      permitSignerAddress: payload.owner,
    };
  }

  async getAllowance(publicClient: PublicClient, owner: string) {
    const allowance = await publicClient.readContract({
      address: this.config.arbitrum.usdcAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [
        owner as EvmAddress,
        this.config.arbitrum.bridgeAddress as EvmAddress,
      ],
      authorizationList: undefined
    });
    return allowance.toString();
  }

  async getMaxDeposit(publicClient: PublicClient) {
    const balance = await publicClient.readContract({
      address: this.config.arbitrum.usdcAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [
        this.config.arbitrum.bridgeAddress as `0x${string}`
      ],
      authorizationList: undefined
    });
    return balance;
  }

  deposit(
    coin: { type: string; object: string | TransactionArgument },
    primaryAddress: string
  ) {
    const tx = this.getTx();
    tx.moveCall({
      target: `${this.packageId}::${this.modulePool}::deposit`,
      typeArguments: [this.config.coinTypeArgs],
      arguments: [
        tx.object(this.config.versionedObjectId),
        tx.object(this.config.treasuryObjectId),
        typeof coin.object === 'string' ? tx.object(coin.object) : coin.object,
        tx.pure.vector('u8', stringToCharCodes(primaryAddress)),
      ],
    });
    return tx;
  }
}
