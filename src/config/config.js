import Coin from "../assets/images/usd-coin.svg";
import Tether from "../assets/images/tether.svg";
import Dai from "../assets/images/dai.svg";
const vaultABI = require("../abi/vault.json");
const ercABI = require("../abi/ERC20.json");
const nordABI = require("../abi/DistributionToken.json");
const claimABI = require("../abi/ClaimRewardProxy.json");

const BalanceUpdateInterval = 120;
const networkData = {
  networkName: ["Kovan Testnet"],
  networkID: [42],
  etherscanURL: "https://kovan.etherscan.io/",
  infuraURL: "https://kovan.infura.io/v3/",
};
const coingeckoPriceEndPoint =
  "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin%2Ctether%2Cdai&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=true";
const apyEndPoints = {
  savings: process.env.REACT_APP_APY_ENDPOINT + "/savings/apy",
  nord: process.env.REACT_APP_APY_ENDPOINT + "/nord/apy",
};
const vaultData = [
  {
    icon: Coin,
    id: 0,
    name: "USD Coin",
    priceApiName: "usd-coin",
    precision: 6,
    web3EquivalentPrecision: "picoether",
    subname: "USDC",
    ntokenname: "nUSDC",
    contract: "0x8215F0605090c53CF9B7A37DC55fEF87E462c896",
    vaultABI: vaultABI,
    erc: "0xe22da380ee6B445bb8273C81944ADEB6E8450422",
    ercABI: ercABI,
  },
  {
    icon: Tether,
    id: 1,
    name: "Tether",
    priceApiName: "tether",
    precision: 6,
    web3EquivalentPrecision: "picoether",
    subname: "USDT",
    ntokenname: "nUSDT",
    contract: "0xFEBD7f4D268f9530631C2d597076749d9c3A92e4",
    vaultABI: vaultABI,
    erc: "0x13512979ADE267AB5100878E2e0f485B568328a4",
    ercABI: ercABI,
  },
  {
    icon: Dai,
    id: 2,
    name: "DAI Stablecoin",
    priceApiName: "dai",
    precision: 18,
    web3EquivalentPrecision: "ether",
    subname: "DAI",
    ntokenname: "nDAI",
    contract: "0x7Ba5048cb2fC33348632A1f8Bc759193C51Dc7c4",
    vaultABI: vaultABI,
    erc: "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD",
    ercABI: ercABI,
  },
];
const nordGovernanceData = [
  {
    contract: "0x3Bc26087A2db014eC59f58472333DAfbB95a603D",
    nordABI: nordABI,
    precision: 18,
    web3EquivalentPrecision: "ether",
    claimABI: claimABI,
    claimAddress: "0xcA055b07317A6ba769cE1F11e6FBEFb4774e898B",
  },
];

export {
  networkData,
  coingeckoPriceEndPoint,
  apyEndPoints,
  vaultData,
  nordGovernanceData,
  BalanceUpdateInterval,
};
