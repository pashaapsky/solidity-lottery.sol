require("@nomiclabs/hardhat-waffle");
require('hardhat-deploy');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const ALCHEMY_MAINNET_FORK_API_URL =
    "https://eth-mainnet.alchemyapi.io/v2/gIuOz3g7EgE5HwC6HrPlHDkwd0dsK7T_";
const ALCHEMY_ROPSTEN_API_URL =
    "https://eth-ropsten.alchemyapi.io/v2/76QZf78fBa-s_8XXhsTGbcGT2MZketRp";
const ALCHEMY_RINKEBY_API_URL =
    "https://eth-rinkeby.alchemyapi.io/v2/76QZf78fBa-s_8XXhsTGbcGT2MZketRp";

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.4.8",
      },
      {
        version: "0.4.11",
      },
      {
        version: "0.4.24",
      },
      {
        version: "0.8.0",
      },
    ],
  },
  testnet: {
    rinkeby: {
      ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      // forking: {
      //   url: ALCHEMY_MAINNET_FORK_API_URL,
      //   // blockNumber: 11095000
      // },
      // ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      // linkToken: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      // vrfCoordinator: "0xf0d54349aDdcf704F77AE15b96510dEA15cb7952",
      // keyHash: "0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445",
      // fee: 2,
    },
    ropsten: {
      url: ALCHEMY_ROPSTEN_API_URL,
      accounts: [process.env.META_MASK_AC1_KEY, process.env.META_MASK_AC2_KEY],
      ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    },
    rinkeby: {
      url: ALCHEMY_RINKEBY_API_URL,
      accounts: [process.env.META_MASK_AC1_KEY, process.env.META_MASK_AC2_KEY],
      ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
      linkToken: "0x01BE23585060835E02B77ef475b0Cc51aA1e0709",
      vrfCoordinator: "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B",
      keyHash: "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311",
      fee: "100000000000000000",
    },
  },
  mocha: {
    timeout: 10000000,
  },
  etherscan: {
    apiKey: process.env.ETHER_SCAN_API_KEY,
  },
};
