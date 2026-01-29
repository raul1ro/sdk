export interface IPerpConfig {
  packageId: string;
  vaultObjectId: string;
  adminCapObjectId: string;
}

export const CONFIGS: {
  mainnet: IPerpConfig;
  testnet: IPerpConfig;
} = {
  mainnet: {
    packageId:
      '0x601047df6c9a19af5484870450b9caf76a9207daeba6177c2728e9b91f545ee8',
    vaultObjectId:
      '0xe6a84cb89183a0f1be00ce525c9d9f5260ef1ccf5454ac177329b1b31c7dc802',
    adminCapObjectId:
      '0xcc7ee7fdbd544f930a88bb99cd4fc66d3c992ebc9740ea88e05e30c14a4961d7',
  },
  testnet: {
    packageId: '',
    vaultObjectId: '',
    adminCapObjectId: '',
  },
};
