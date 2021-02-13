import React, { Component } from "react";
import Layout from "../Layout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Numbro from "numbro";
import Logo from "../assets/images/logo.png";
import Dot from "../assets/images/dot.svg";
import Arrow from "../assets/images/arrow.svg";
import Loading from "../assets/images/loading.svg";
import LeftArrow from "../assets/images/back.svg";
import Info from "../assets/images/info.svg";
import Sidebar from "../components/sidebar";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import {
  networkData,
  coingeckoPriceEndPoint,
  apyEndPoints,
  vaultData,
  nordGovernanceData,
  BalanceUpdateInterval,
} from "../config/config";
import LoadingOverlay from "react-loading-overlay";
import Logout from "../assets/images/logout.svg";
import Window from "../assets/images/window.png";
import axios from "axios";
import Modal from "react-modal";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    background: "#e6e7ee",
    border: "0",
    borderRadius: "5px",
  },
};

class DashBoard extends Component {
  web3;
  constructor(props) {
    super(props);
    this.state = {
      accounts: [],
      address: "",
      vaultSupply: [],
      totalSupply: null,
      balance: [],
      nordBalance: [],
      token: [],
      nTokenBalance: [],
      dAmount: "",
      wAmount: "",
      details: true,
      tempkey: null,
      infiniteApproval: true,
      isWaiting: false,
      isLoading: false,
      loadingMessage: "",
      depositErr: "",
      withdrawErr: "",
      isInitialLoading: true,
      transactionHash: "",
      apy_vaults: [],
      apy_nord: [],
      isConfirmPopupOpen: false,
      confirmPopupType: "",
      displayInfiniteSwitch: false,
      selectedToken: [],
      balanceUpdationTimeout: null,
    };
    this.web3Modal = new Web3Modal({
      cacheProvider: false,
      providerOptions: this.getProviderOptions(),
    });
    this._handleChange = this._handleChange.bind(this);
    this.updateBalance = this.updateBalance.bind(this);
  }

  getProviderOptions = () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: process.env.REACT_APP_INFURA_ID,
        },
        display: {
          description: "Scan with a wallet to connect",
        },
      },
    };
    return providerOptions;
  };

  async onConnect() {
    const currentProvider = this.web3.currentProvider;
    if (currentProvider.close) {
      await currentProvider.close();
    }
    if (currentProvider.disconnect) {
      await currentProvider.disconnect();
    }
    await this.web3Modal.clearCachedProvider();
    const provider = await this.web3Modal.connect();
    this.web3 = new Web3(provider);
    await this.subscribeProvider(provider);
    const account = await this.web3.eth.getAccounts();
    const network = await this.web3.eth.net.getId();
    const check = !networkData.networkID.includes(network);
    if (account !== undefined && account !== null && account.length) {
      this.setState(() => {
        return {
          isInitialLoading: false,
          isLoading: true,
          accounts: account,
          address:
            account[0].substr(0, 6) +
            "..." +
            account[0].substr(account[0].length - 4),
        };
      });
      if (check) {
        this.networkChange();
      }
      this.updateBalance();
    } else {
      await this.logOut();
    }
  }

  async componentDidMount() {
    if (this.web3Modal.cachedProvider) {
      const provider = await this.web3Modal.connect();
      this.web3 = new Web3(provider);
      await this.subscribeProvider(provider);
      const account = await this.web3.eth.getAccounts();
      const network = await this.web3.eth.net.getId();
      const check = !networkData.networkID.includes(network);
      await this.setState(() => {
        return {
          isInitialLoading: false,
          isLoading: true,
          accounts: account,
          address:
            account[0].substr(0, 6) +
            "..." +
            account[0].substr(account[0].length - 4),
        };
      });
      if (check) {
        this.networkChange();
      } else {
        this.updateBalance();
      }
    } else {
      window.location.href = "/";
    }
  }

  /* async componentDidUpdate() {
    if (this.state.isInitialLoading || !this.state.accounts) {
      this.logOut();
    }
  } */

  async componentDidCatch(error, info) {
    if (error) {
      console.log(
        `Error occured in Dashboard component: ${error} Info: ${info}`
      );
    }
    this.logout();
  }

  async logOut() {
    const provider = this.web3.currentProvider;
    if (provider.close) {
      await provider.close();
    }
    if (provider.disconnect) {
      await provider.disconnect();
    }
    this.web3.currentProvider = null;
    this.web3Modal.clearCachedProvider();
    window.location.href = "/";
  }

  networkChange() {
    this.setState(() => {
      return { networkError: true, isLoading: false, isWaiting: false };
    });
    toast.clearWaitingQueue();
    toast.warn("Please switch over to " + networkData.networkName + ".", {
      containerId: "networkErr",
      position: "top-right",
      autoClose: false,
      hideProgressBar: true,
      closeOnClick: false,
      closeButton: false,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
    });
  }

  async subscribeProvider(provider) {
    provider.on("disconnect", async () => {
      if (provider.close) {
        await provider.close();
      }
      if (provider.disconnect) {
        await provider.disconnect();
      }
      await this.web3Modal.clearCachedProvider();
    });
    provider.on("accountsChanged", async (account) => {
      if (account) {
        await this.setState({
          accounts: account,
          address:
            account[0].substr(0, 6) +
            "..." +
            account[0].substr(account[0].length - 4),
          isLoading: true,
          dAmount: "",
          wAmount: "",
          depositErr: "",
          withdrawErr: "",
        });
        this.updateBalance();
      } else {
        this.logout();
      }
    });
    provider.on("chainChanged", async () => {
      const network = await this.web3.eth.net.getId();
      const check = !networkData.networkID.includes(network);
      if (check) {
        this.networkChange();
      } else {
        toast.clearWaitingQueue();
        toast.dismiss();
        await this.setState({
          networkError: false,
        });
        await this.setState({
          isLoading: true,
        });
        this.updateBalance();
      }
    });

    provider.on("networkChanged", async () => {
      const chainId = await this.web3.eth.getChainId();
      const check = !networkData.networkID.includes(chainId);
      if (check) {
        this.networkChange();
      } else {
        toast.clearWaitingQueue();
        toast.dismiss();
        await this.setState({
          networkError: false,
        });
        await this.setState({
          isLoading: true,
        });
        this.updateBalance();
      }
    });
  }

  async getAPY() {
    const vault_apy = [];
    const nord_apy = [];
    const apyResults = await Promise.allSettled([
      axios.get(apyEndPoints.savings),
      axios.get(apyEndPoints.nord),
    ]);
    const vaultAPYdata = this.isPromiseFullfilled(apyResults[0], "Savings APY")
      ? apyResults[0].value
      : [];
    const nordAPYdata = this.isPromiseFullfilled(apyResults[0], "Savings APY")
      ? apyResults[1].value
      : [];
    for (const index in vaultAPYdata.data) {
      vault_apy.push(vaultAPYdata.data[index].apyInceptionSample);
      nord_apy.push(nordAPYdata.data[index].apy);
    }
    this.setState({ apy_vaults: vault_apy, apy_nord: nord_apy });
  }

  async updateNordBalance() {
    if (this.state.accounts) {
      const nordRewardsPrecision =
        nordGovernanceData[0].web3EquivalentPrecision;
      const allPromises = [];
      const nordRewardsContract = new this.web3.eth.Contract(
        nordGovernanceData[0].nordABI.abi,
        nordGovernanceData[0].contract
      );
      const claimContract = new this.web3.eth.Contract(
        nordGovernanceData[0].claimABI.abi,
        nordGovernanceData[0].claimAddress
      );
      allPromises.push(
        nordRewardsContract.methods
          .balanceOf(this.state.accounts[0])
          .call({ from: this.state.accounts[0] })
      );

      allPromises.push(
        claimContract.methods
          .getTotalRewardBalance()
          .call({ from: this.state.accounts[0] })
      );

      const promiseResults = await Promise.allSettled(allPromises);
      const bal = this.isPromiseFullfilled(promiseResults[0], "Nord Rewards")
        ? this.web3.utils.fromWei(promiseResults[0].value, nordRewardsPrecision)
        : 0;
      const unclaimedBal = this.isPromiseFullfilled(
        promiseResults[1],
        "Nord Unclaimed Rewards"
      )
        ? this.web3.utils.fromWei(promiseResults[1].value, nordRewardsPrecision)
        : 0;
      this.setState(() => {
        return {
          nTokenBalance: [bal, unclaimedBal],
        };
      });
    } else {
      this.logOut();
    }
  }

  async updateBalance() {
    if (this.state.balanceUpdationTimeout) {
      clearTimeout(this.state.balanceUpdationTimeout);
    }
    if (this.state.accounts) {
      const tokenName = [];
      const allPromises = [];
      allPromises.push(axios.get(coingeckoPriceEndPoint));

      for (const x of vaultData) {
        const vaultContract = new this.web3.eth.Contract(
          x.vaultABI.abi,
          x.contract
        );
        const ercContract = new this.web3.eth.Contract(x.ercABI.abi, x.erc);

        allPromises.push(
          vaultContract.methods
            .underlyingBalanceWithInvestment()
            .call({ from: this.state.accounts[0] })
        );
        allPromises.push(
          vaultContract.methods
            .getPricePerFullShare()
            .call({ from: this.state.accounts[0] })
        );
        allPromises.push(
          ercContract.methods
            .balanceOf(this.state.accounts[0])
            .call({ from: this.state.accounts[0] })
        );

        allPromises.push(
          vaultContract.methods
            .balanceOf(this.state.accounts[0])
            .call({ from: this.state.accounts[0] })
        );
        if (!this.state.token.length) {
          tokenName.push(x.subname);
        }
      }

      allPromises.push(this.updateNordBalance());
      allPromises.push(this.getAPY());

      const results = await Promise.allSettled(allPromises);
      const balances = this.processBalanceResults(results, vaultData);
      this.setState(() => {
        return {
          sharePrice: balances.sharePrices,
          balance: balances.ercBalances,
          vaultSupply: balances.vaultBalances,
          totalSupply: balances.totalSupply,
          nordBalance: balances.nTokenBalances,
        };
      });
      if (!this.state.token.length) {
        this.setState(() => {
          return { token: tokenName };
        });
      }
      const interval = setTimeout(
        this.updateBalance,
        BalanceUpdateInterval * 1000
      );
      this.setState(() => {
        return {
          isLoading: false,
          balanceUpdationTimeout: interval,
        };
      });
    } else {
      this.logOut();
    }
  }

  processBalanceResults(results, vaults) {
    const coingeckoData = this.isPromiseFullfilled(results[0], "coingecko")
      ? results[0].value.data
      : {};
    let index = 0;
    const balanceResults = {};
    balanceResults.totalSupply = 0;
    balanceResults.vaultBalances = [];
    balanceResults.sharePrices = [];
    balanceResults.ercBalances = [];
    balanceResults.nTokenBalances = [];
    for (const vault of vaults) {
      const vaultBalance = this.isPromiseFullfilled(
        results[index * 4 + 1],
        `${vault.subname}`
      )
        ? results[index * 4 + 1].value
        : 0;
      balanceResults.vaultBalances.push(
        this.web3.utils.fromWei(vaultBalance, vault.web3EquivalentPrecision)
      );
      balanceResults.totalSupply +=
        (vaultBalance * coingeckoData[vault.priceApiName].usd) /
        Math.pow(10, vault.precision);

      balanceResults.sharePrices.push(
        this.isPromiseFullfilled(results[index * 4 + 2])
          ? results[index * 4 + 2].value
          : 0
      );
      balanceResults.ercBalances.push(
        this.isPromiseFullfilled(results[index * 4 + 3], `${vault.subname}`)
          ? this.web3.utils.toBN(results[index * 4 + 3].value)
          : 0
      );
      balanceResults.nTokenBalances.push(
        this.isPromiseFullfilled(results[index * 4 + 4], `${vault.subname}`)
          ? this.web3.utils.toBN(results[index * 4 + 4].value)
          : 0
      );
      index++;
    }

    return balanceResults;
  }

  isPromiseFullfilled(result, info) {
    if (result.status === "fulfilled") {
      return true;
    } else {
      console.log(
        `Error while resolving a promise: ${result.reason} ${info || ""}`
      );
      return false;
    }
  }

  async deposit() {
    const amt = this.web3.utils.toBN(
      this.web3.utils.toWei(
        this.state.dAmount,
        vaultData[this.state.tempkey].web3EquivalentPrecision
      )
    );
    let approveFlag = false;
    let approvedBalFlag = false;
    let depositFlag = false;
    const approve = new this.web3.eth.Contract(
      vaultData[this.state.tempkey].ercABI.abi,
      vaultData[this.state.tempkey].erc
    );
    if (this.state.displayInfiniteSwitch) {
      if (this.state.infiniteApproval) {
        this.setState(() => {
          return {
            isWaiting: true,
            loadingMessage:
              "Waiting for " +
              vaultData[this.state.tempkey].subname +
              " allowance approval",
          };
        });
        const maxAmt = this.web3.utils.toBN(
          "115792089237316195423570985008687907853269984665640564039457584007913129639935"
        );
        await approve.methods
          .approve(vaultData[this.state.tempkey].contract, maxAmt)
          .send({ from: this.state.accounts[0] }, (error, tHash) => {
            if (error) {
              console.log(`Error while sending approve tx: ${error}`);
              return;
            }
            this.setState(() => {
              return { transactionHash: tHash };
            });
          })
          .then(function (receipt) {
            approveFlag = receipt.status;
            console.log(receipt);
          })
          .catch(function (err) {
            console.log(err);
          });
      } else {
        this.setState(() => {
          return {
            isWaiting: true,
            loadingMessage:
              "Waiting for allowance approval of " +
              Numbro(
                Math.trunc(Number(this.state.dAmount) * 10000) / 10000
              ).format({
                thousandSeparated: true,
                trimMantissa: true,
                mantissa: 4,
                spaceSeparated: false,
              }) +
              " " +
              vaultData[this.state.tempkey].subname,
          };
        });
        await approve.methods
          .approve(vaultData[this.state.tempkey].contract, amt)
          .send({ from: this.state.accounts[0] }, (error, tHash) => {
            if (error) {
              console.log(`Error while sending approve tx: ${error}`);
              return;
            }
            this.setState(() => {
              return { transactionHash: tHash };
            });
          })
          .then(function (receipt) {
            approveFlag = receipt.status;
            console.log(receipt);
          })
          .catch(function (err) {
            console.log(err);
          });
      }
      this.setState(() => {
        return { isWaiting: false };
      });
    } else {
      approvedBalFlag = true;
      approveFlag = true;
      toast.success(
        Numbro(Math.trunc(this.state.dAmount * 10000) / 10000).format({
          thousandSeparated: true,
          trimMantissa: true,
          mantissa: 4,
          spaceSeparated: false,
        }) +
          " " +
          vaultData[this.state.tempkey].subname +
          " has already been pre-approved",
        {
          containerId: "Err",
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
        }
      );
    }
    if (approveFlag) {
      if (!approvedBalFlag) {
        if (this.state.infiniteApproval) {
          toast.success(
            vaultData[this.state.tempkey].ntokenname +
              " Contract is trusted now!",
            {
              containerId: "Err",
              position: "bottom-left",
              autoClose: 5000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: false,
              progress: undefined,
            }
          );
        } else {
          toast.success(
            Numbro(Math.trunc(this.state.dAmount * 10000) / 10000).format({
              thousandSeparated: true,
              trimMantissa: true,
              mantissa: 4,
              spaceSeparated: false,
            }) +
              " " +
              vaultData[this.state.tempkey].subname +
              " has been successfully approved for deposit transfer!",
            {
              containerId: "Err",
              position: "bottom-left",
              autoClose: 5000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: false,
              progress: undefined,
            }
          );
        }
      }
      const vaultDeposit = new this.web3.eth.Contract(
        vaultData[this.state.tempkey].vaultABI.abi,
        vaultData[this.state.tempkey].contract
      );
      vaultDeposit.transactionConfirmationBlocks = 48;
      this.setState(() => {
        return {
          isWaiting: true,
          loadingMessage: "Depositing...",
          transactionHash: "",
        };
      });
      await vaultDeposit.methods
        .deposit(amt)
        .send({ from: this.state.accounts[0] }, (error, tHash) => {
          if (error) {
            console.log(`Error while sending deposit tx: ${error}`);
            return;
          }
          this.setState(() => {
            return { transactionHash: tHash };
          });
        })
        .then(function (vreceipt) {
          console.log(vreceipt);
          depositFlag = vreceipt.status;
        })
        .catch(function (error) {
          depositFlag = false;
          console.log(error);
        });
      if (depositFlag) {
        toast.success(
          Numbro(Math.trunc(this.state.dAmount * 10000) / 10000).format({
            thousandSeparated: true,
            trimMantissa: true,
            mantissa: 4,
            spaceSeparated: false,
          }) +
            " " +
            vaultData[this.state.tempkey].subname +
            " has been successfully deposited!",
          {
            containerId: "Err",
            position: "bottom-left",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            progress: undefined,
          }
        );
        this.setState(() => {
          return {
            loadingMessage: "Updating Balance...",
            transactionHash: "",
          };
        });
        await this.updateBalance();
        this.setState(() => {
          return {
            isWaiting: false,
            dAmount: "",
            wAmount: "",
          };
        });
      } else {
        this.setState(() => {
          return {
            isWaiting: false,
          };
        });
        toast.error(
          "Failed to deposit " +
            Numbro(Math.trunc(this.state.dAmount * 10000) / 10000).format({
              thousandSeparated: true,
              trimMantissa: true,
              mantissa: 4,
              spaceSeparated: false,
            }) +
            " " +
            vaultData[this.state.tempkey].subname +
            "!",
          {
            containerId: "Err",
            position: "bottom-left",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          }
        );
      }
    } else {
      this.setState(() => {
        return {
          isWaiting: false,
        };
      });
      toast.error(
        "Failed to approve transfer of " +
          Numbro(Math.trunc(this.state.dAmount * 10000) / 10000).format({
            thousandSeparated: true,
            trimMantissa: true,
            mantissa: 4,
            spaceSeparated: false,
          }) +
          " " +
          vaultData[this.state.tempkey].subname +
          "!",
        {
          containerId: "Err",
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
    }
    this.updateBalance();
  }

  async withdraw() {
    const amt = this.web3.utils.toBN(
      this.web3.utils.toWei(
        this.state.wAmount,
        vaultData[this.state.tempkey].web3EquivalentPrecision
      )
    );
    let withdrawFlag = false;
    const vaultWithdraw = new this.web3.eth.Contract(
      vaultData[this.state.tempkey].vaultABI.abi,
      vaultData[this.state.tempkey].contract
    );
    vaultWithdraw.transactionConfirmationBlocks = 48;
    this.setState(() => {
      return { isWaiting: true, loadingMessage: "Withdrawing..." };
    });
    await vaultWithdraw.methods
      .withdraw(amt)
      .send({ from: this.state.accounts[0] }, (error, tHash) => {
        if (error) {
          console.log(`Error while sending withdraw tx: ${error}`);
          return;
        }
        this.setState(() => {
          return { transactionHash: tHash };
        });
      })
      .then(function (receipt) {
        withdrawFlag = receipt.status;
        console.log(receipt);
      })
      .catch(function (error) {
        withdrawFlag = false;
        console.log(error);
      });
    if (withdrawFlag) {
      toast.success(
        this.state.wAmount +
          " " +
          vaultData[this.state.tempkey].ntokenname +
          " has been successfully withdrawn",
        {
          containerId: "Err",
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
        }
      );
      this.setState(() => {
        return {
          loadingMessage: "Updating Balance...",
          transactionHash: "",
        };
      });
      await this.updateBalance();
      this.setState(() => {
        return {
          isWaiting: false,
          dAmount: "",
          wAmount: "",
        };
      });
    } else {
      this.setState(() => {
        return { isWaiting: false, transactionHash: "" };
      });
      toast.error(
        "Failed to withdraw " +
          this.state.wAmount +
          " " +
          vaultData[this.state.tempkey].ntokenname,
        {
          containerId: "Err",
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
    }
    this.updateBalance();
  }

  claimReward = async () => {
    if (this.state.nTokenBalance[1] > 0) {
      let claimFlag = false;
      const claimContract = new this.web3.eth.Contract(
        nordGovernanceData[0].claimABI.abi,
        nordGovernanceData[0].claimAddress
      );
      claimContract.transactionConfirmationBlocks = 48;
      this.setState(() => {
        return { isWaiting: true, loadingMessage: "Claiming Rewards..." };
      });
      await claimContract.methods
        .claimAggregatedRewards()
        .send({ from: this.state.accounts[0] })
        .then(function (receipt) {
          claimFlag = receipt.status;
          console.log(receipt);
        })
        .catch(function (error) {
          console.log(error);
        });
      this.setState(() => {
        return { isWaiting: false };
      });
      if (claimFlag) {
        toast.success("Nord Rewards has been successfully claimed", {
          containerId: "Err",
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
        });
      } else {
        toast.error("Failed to claim Nord Rewards", {
          containerId: "Err",
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } else {
      toast.error("No Unclaimed Balance Available", {
        containerId: "Err",
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    await this.updateBalance();
  };

  handleCardClick = (index) => {
    this.setState({
      tempkey: index,
      details: false,
    });
  };

  handleCardClose = () => {
    this.setState({
      tempkey: null,
      details: true,
      dAmount: "",
      wAmount: "",
      depositErr: "",
      withdrawErr: "",
    });
  };

  handlePopupClose = async (confirm) => {
    const orderType = this.state.confirmPopupType;
    await this.setState({
      isConfirmPopupOpen: false,
      confirmPopupType: "",
    });
    if (confirm) {
      if (orderType === "Deposit") {
        this.deposit();
      } else {
        this.withdraw();
      }
    } else {
      toast.error(orderType + " Order Cancelled!", {
        containerId: "Err",
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  openConfirmationPopup = (popupType) => {
    const tokens = [
      vaultData[this.state.tempkey].subname,
      vaultData[this.state.tempkey].ntokenname,
    ];
    this.setState({
      isConfirmPopupOpen: true,
      confirmPopupType: popupType,
      selectedToken: tokens,
    });
  };

  handleAmountChange = async (event, inputType) => {
    const clippedFormat = new RegExp(
      /* eslint-disable-next-line */
      "^\\d+(\\.\\d{0," + vaultData[this.state.tempkey].precision + "})?$"
    );
    if (clippedFormat.test(event.target.value) || !event.target.value) {
      if (inputType === "Deposit") {
        await this.setState(() => {
          return {
            dAmount: event.target.value,
            depositErr: "",
          };
        });
        this.handleBalanceCheck(
          this.state.dAmount,
          this.state.balance[this.state.tempkey],
          "Deposit",
          false
        );
      } else if (inputType === "Withdrawal") {
        await this.setState(() => {
          return {
            wAmount: event.target.value,
            withdrawErr: "",
          };
        });
        this.handleBalanceCheck(
          this.state.wAmount,
          this.state.nordBalance[this.state.tempkey],
          "Withdrawal",
          false
        );
      }
    }
  };

  handleBalanceCheck = async (amt, balance, inputType, buttonActionFlag) => {
    let amount = amt;
    let error = "";
    if (buttonActionFlag && !Number(amount)) {
      amount = "";
      error = "Please enter a valid " + inputType + " amount!!!";
    } else if (
      Number(amount) &&
      this.web3.utils
        .toBN(
          this.web3.utils.toWei(
            amt,
            vaultData[this.state.tempkey].web3EquivalentPrecision
          )
        )
        .gt(this.web3.utils.toBN(balance))
    ) {
      amount = amt;
      if (inputType === "Deposit") {
        error =
          "Insufficient " +
          vaultData[this.state.tempkey].subname +
          " Balance!!!";
      } else if (inputType === "Withdrawal") {
        error =
          "Insufficient " +
          vaultData[this.state.tempkey].ntokenname +
          " Balance!!!";
      }
    } else {
      if (buttonActionFlag) {
        amount =
          amt.substring(0, amt.length - 1) +
          amt.substring(amt.length - 1, amt.length).replace(".", "");
      } else {
        amount = amt;
      }
      error = "";
    }

    if (inputType === "Deposit") {
      let showInfiniteSwitch = false;
      if (buttonActionFlag && !error) {
        const approve = new this.web3.eth.Contract(
          vaultData[this.state.tempkey].ercABI.abi,
          vaultData[this.state.tempkey].erc
        );
        const approvedBal = this.web3.utils.toBN(
          await approve.methods
            .allowance(
              this.state.accounts[0],
              vaultData[this.state.tempkey].contract
            )
            .call({ from: this.state.accounts[0] })
        );
        showInfiniteSwitch = this.web3.utils
          .toBN(
            this.web3.utils.toWei(
              amt,
              vaultData[this.state.tempkey].web3EquivalentPrecision
            )
          )
          .gt(approvedBal);
      }
      await this.setState({
        dAmount: amount,
        depositErr: error,
        displayInfiniteSwitch: showInfiniteSwitch,
      });
    } else if (inputType === "Withdrawal") {
      await this.setState({
        wAmount: amount,
        withdrawErr: error,
        displayInfiniteSwitch: false,
      });
    }
    if (buttonActionFlag && !error) {
      this.openConfirmationPopup(inputType);
    }
  };

  _handleChange = () => {
    console.log("entry :", this.state.infiniteApproval);
    this.setState(
      {
        infiniteApproval: !this.state.infiniteApproval,
      },
      () => {
        console.log("came here ", this.state.infiniteApproval);
      }
    );
  };

  render() {
    return (
      <>
        <LoadingOverlay active={this.state.networkError}>
          <LoadingOverlay
            active={this.state.isWaiting}
            spinner={
              <div align="center">
                <img src={Loading} alt="" />
              </div>
            }
            className="custom-loading-overlay"
            text={
              <div align="center">
                <p className="loading-message-text">
                  <strong>{this.state.loadingMessage}</strong>
                  {this.state.transactionHash ? (
                    <a
                      href={
                        networkData.etherscanURL +
                        "tx/" +
                        this.state.transactionHash
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={Window}
                        alt="Etherscan"
                        className="h-4 mb-7 ml-1 inline cursor-pointer"
                      />
                    </a>
                  ) : (
                    <p />
                  )}
                </p>
                <p className="refresh-text">
                  Please do not press the back button or refresh the page.
                </p>
              </div>
            }
          >
            <Sidebar
              tokens={this.state.token}
              vSupply={this.state.vaultSupply}
              tSupply={this.state.totalSupply}
              nBal={this.state.nTokenBalance}
              claim={this.claimReward}
              loading={this.state.isLoading}
            />
            <Layout>
              <div className="flex justify-between px-8 py-8">
                <img src={Logo} alt="" className="h-24" />
                <div className="inline-flex">
                  <p className="wallet-label flex pr-4 uppercase mt-3 font-bold text-sm">
                    Your Wallet:
                  </p>

                  <button
                    className="flex py-3 px-6 justify-between cursor-pointer your-wallet-card  focus:outline-none"
                    onClick={() => this.onConnect()}
                    disabled={this.state.isLoading}
                  >
                    {this.state.address}&nbsp;&nbsp;
                    <img src={Dot} alt="dot" className="" />
                  </button>

                  <img
                    src={Logout}
                    alt="logout"
                    className="h-8 mt-1 pl-4 cursor-pointer"
                    onClick={() => this.logOut()}
                  />
                </div>
              </div>
              <LoadingOverlay
                active={this.state.isLoading}
                spinner={
                  <div align="center">
                    <img src={Loading} alt="" />
                  </div>
                }
                text="Loading..."
                styles={{
                  overlay: {
                    position: "absolute",
                    height: "100%",
                    width: "100%",
                    top: "0px",
                    left: "0px",
                    display: "flex",
                    textAlign: "center",
                    fontSize: "1.2em",
                    color: "#888888",
                    background: "#e6e7ee",
                    zIndex: 800,
                  },
                }}
              >
                <div className="grid grid-cols-3 px-8 py-8 gap-4 cards-container">
                  {this.state.details ? (
                    vaultData.map((data, index) => (
                      <div
                        className="card-coin cursor-pointer"
                        key={index}
                        onClick={() => this.handleCardClick(index)}
                      >
                        <div className="flex ">
                          <img
                            src={data.icon}
                            alt=""
                            className="pr-6 card-icon-img"
                          />
                          <p className="font-bold">
                            {data.name} <br></br>{" "}
                            <span className="text-xs font-extralight	">
                              {data.subname}
                            </span>
                          </p>
                        </div>
                        <img
                          src={Arrow}
                          alt=""
                          className="mb-8 ml-24 arrow-card"
                        />
                        <div className="flex pt-4">
                          <p className="text-sm text-color pr-12">APY </p>
                          <p className="font-bold text-sm">
                            {(this.state.apy_vaults[data.id]
                              ? Numbro(this.state.apy_vaults[data.id]).format({
                                  thousandSeparated: true,
                                  trimMantissa: true,
                                  mantissa: 2,
                                  spaceSeparated: false,
                                })
                              : "0") + " %"}
                          </p>
                        </div>
                        <div className="flex pt-2">
                          <p className="text-sm text-color pr-4">Nord APY </p>
                          <p className="font-bold text-sm">
                            {(this.state.apy_nord[data.id]
                              ? Numbro(this.state.apy_nord[data.id]).format({
                                  thousandSeparated: true,
                                  trimMantissa: true,
                                  mantissa: 2,
                                  spaceSeparated: false,
                                })
                              : "0") + " %"}
                          </p>
                        </div>
                        <div className="flex pt-4">
                          <p className="text-sm text-color pr-10">
                            {data.subname}{" "}
                          </p>
                          <p className="font-bold text-sm">
                            {(this.state.balance[data.id]
                              ? this.web3.utils
                                  .toBN(this.state.balance[data.id])
                                  .lt(
                                    this.web3.utils.toBN(
                                      this.web3.utils.toWei(
                                        this.web3.utils.toBN(100000)
                                      ),
                                      vaultData[data.id].web3EquivalentPrecision
                                    )
                                  )
                                ? Numbro(
                                    Math.trunc(
                                      this.web3.utils.fromWei(
                                        this.state.balance[data.id],
                                        vaultData[data.id]
                                          .web3EquivalentPrecision
                                      ) * 100
                                    ) / 100
                                  ).format({
                                    thousandSeparated: true,
                                    trimMantissa: true,
                                    mantissa: 2,
                                    spaceSeparated: false,
                                  })
                                : Numbro(
                                    Math.trunc(
                                      this.web3.utils.fromWei(
                                        this.state.balance[data.id],
                                        vaultData[data.id]
                                          .web3EquivalentPrecision
                                      ) * 100
                                    ) / 100
                                  )
                                    .format({
                                      thousandSeparated: true,
                                      trimMantissa: true,
                                      mantissa: 2,
                                      average: true,
                                      spaceSeparated: false,
                                    })
                                    .toUpperCase()
                              : "0") +
                              " " +
                              data.subname}
                          </p>
                        </div>
                        <div className="flex pt-2">
                          <p className="text-sm text-color pr-8">
                            {data.ntokenname}{" "}
                          </p>
                          <p className="font-bold text-sm">
                            {(this.state.nordBalance[data.id]
                              ? this.web3.utils
                                  .toBN(this.state.nordBalance[data.id])
                                  .lt(
                                    this.web3.utils.toBN(
                                      this.web3.utils.toWei(
                                        this.web3.utils.toBN(100000)
                                      ),
                                      vaultData[data.id].web3EquivalentPrecision
                                    )
                                  )
                                ? Numbro(
                                    Math.trunc(
                                      this.web3.utils.fromWei(
                                        this.state.nordBalance[data.id],
                                        vaultData[data.id]
                                          .web3EquivalentPrecision
                                      ) * 100
                                    ) / 100
                                  ).format({
                                    thousandSeparated: true,
                                    trimMantissa: true,
                                    mantissa: 2,
                                    spaceSeparated: false,
                                  })
                                : Numbro(
                                    Math.trunc(
                                      this.web3.utils.fromWei(
                                        this.state.nordBalance[data.id],
                                        vaultData[data.id]
                                          .web3EquivalentPrecision
                                      ) * 100
                                    ) / 100
                                  )
                                    .format({
                                      thousandSeparated: true,
                                      trimMantissa: true,
                                      mantissa: 2,
                                      average: true,
                                      spaceSeparated: false,
                                    })
                                    .toUpperCase()
                              : "0") +
                              " " +
                              data.ntokenname}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    // <div>{vaultData[this.state.tempkey].name}</div>
                    <div className="coin-card-expand col-span-3 grid grid-cols-3">
                      <div className="col-span-3">
                        <div
                          className="back-container"
                          onClick={() => this.handleCardClose()}
                        >
                          <img
                            src={LeftArrow}
                            alt=""
                            className="mb-8 ml-4 cursor-pointer"
                          />
                          <p className="back-label">Back</p>
                        </div>
                      </div>
                      <div className="col-span-1 inline-block coin-expand-card-partial">
                        <div className="flex ">
                          <img
                            src={vaultData[this.state.tempkey].icon}
                            alt=""
                            className="pr-6"
                          />
                          <p className="pr-8 font-bold">
                            {vaultData[this.state.tempkey].name} <br></br>{" "}
                            <span className="text-xs font-extralight	">
                              {vaultData[this.state.tempkey].subname}
                            </span>
                          </p>
                          {/* <img src={Close} alt="" className="mb-8 ml-24" /> */}
                        </div>
                        <div className="flex pt-4 staking-key-v-container">
                          <p className="text-sm text-color pr-12">APY </p>
                          <p className="font-bold text-sm">
                            {(this.state.apy_vaults[this.state.tempkey]
                              ? Numbro(
                                  this.state.apy_vaults[this.state.tempkey]
                                ).format({
                                  thousandSeparated: true,
                                  trimMantissa: true,
                                  mantissa: 2,
                                  spaceSeparated: false,
                                })
                              : "0") + " %"}
                          </p>
                        </div>
                        <div className="flex pt-2 staking-key-v-container">
                          <p className="text-sm text-color pr-4">Nord APY </p>
                          <p className="font-bold text-sm">
                            {(this.state.apy_nord[this.state.tempkey]
                              ? Numbro(
                                  this.state.apy_nord[this.state.tempkey]
                                ).format({
                                  thousandSeparated: true,
                                  trimMantissa: true,
                                  mantissa: 2,
                                  spaceSeparated: false,
                                })
                              : "0") + " %"}
                          </p>
                        </div>
                        <div className="flex pt-4 staking-key-v-container">
                          <p className="text-sm text-color pr-10">
                            {vaultData[this.state.tempkey].subname}{" "}
                          </p>
                          <p className="font-bold text-sm">
                            {(this.state.balance[this.state.tempkey]
                              ? this.web3.utils
                                  .toBN(this.state.balance[this.state.tempkey])
                                  .lt(
                                    this.web3.utils.toBN(
                                      this.web3.utils.toWei(
                                        this.web3.utils.toBN(100000)
                                      ),
                                      vaultData[this.state.tempkey]
                                        .web3EquivalentPrecision
                                    )
                                  )
                                ? Numbro(
                                    Math.trunc(
                                      this.web3.utils.fromWei(
                                        this.state.balance[this.state.tempkey],
                                        vaultData[this.state.tempkey]
                                          .web3EquivalentPrecision
                                      ) * 100
                                    ) / 100
                                  ).format({
                                    thousandSeparated: true,
                                    trimMantissa: true,
                                    mantissa: 2,
                                    spaceSeparated: false,
                                  })
                                : Numbro(
                                    Math.trunc(
                                      this.web3.utils.fromWei(
                                        this.state.balance[this.state.tempkey],
                                        vaultData[this.state.tempkey]
                                          .web3EquivalentPrecision
                                      ) * 100
                                    ) / 100
                                  )
                                    .format({
                                      thousandSeparated: true,
                                      trimMantissa: true,
                                      mantissa: 2,
                                      average: true,
                                      spaceSeparated: false,
                                    })
                                    .toUpperCase()
                              : "0") +
                              " " +
                              vaultData[this.state.tempkey].subname}
                          </p>
                        </div>
                        <div className="flex pt-2 staking-key-v-container">
                          <p className="text-sm text-color pr-8 ">
                            {vaultData[this.state.tempkey].ntokenname}{" "}
                          </p>
                          <p className="font-bold text-sm">
                            {(this.state.nordBalance[this.state.tempkey]
                              ? this.web3.utils
                                  .toBN(
                                    this.state.nordBalance[this.state.tempkey]
                                  )
                                  .lt(
                                    this.web3.utils.toBN(
                                      this.web3.utils.toWei(
                                        this.web3.utils.toBN(100000)
                                      ),
                                      vaultData[this.state.tempkey]
                                        .web3EquivalentPrecision
                                    )
                                  )
                                ? Numbro(
                                    Math.trunc(
                                      this.web3.utils.fromWei(
                                        this.state.nordBalance[
                                          this.state.tempkey
                                        ],
                                        vaultData[this.state.tempkey]
                                          .web3EquivalentPrecision
                                      ) * 100
                                    ) / 100
                                  ).format({
                                    thousandSeparated: true,
                                    trimMantissa: true,
                                    mantissa: 2,
                                    spaceSeparated: false,
                                  })
                                : Numbro(
                                    Math.trunc(
                                      this.web3.utils.fromWei(
                                        this.state.nordBalance[
                                          this.state.tempkey
                                        ],
                                        vaultData[this.state.tempkey]
                                          .web3EquivalentPrecision
                                      ) * 100
                                    ) / 100
                                  )
                                    .format({
                                      thousandSeparated: true,
                                      trimMantissa: true,
                                      mantissa: 2,
                                      average: true,
                                      spaceSeparated: false,
                                    })
                                    .toUpperCase()
                              : "0") +
                              " " +
                              vaultData[this.state.tempkey].ntokenname}
                          </p>
                        </div>
                      </div>
                      <div className="col-span-1 mb-8 text-center inline-block coin-expand-card-partial">
                        <input
                          className="py-3 px-4 rounded nord-card-input"
                          id="deposit"
                          type="text"
                          autoFocus
                          placeholder={
                            "Enter " +
                            vaultData[this.state.tempkey].subname +
                            " deposit amount"
                          }
                          value={this.state.dAmount}
                          onChange={(e) =>
                            this.handleAmountChange(e, "Deposit")
                          }
                        />
                        <div className="percentage-holder">
                          <button
                            className="single-percentage-btn"
                            onClick={() => {
                              const amt = this.web3.utils
                                .toBN(this.state.balance[this.state.tempkey])
                                .div(this.web3.utils.toBN(4));
                              this.setState({
                                dAmount: this.web3.utils.fromWei(
                                  amt,
                                  vaultData[this.state.tempkey]
                                    .web3EquivalentPrecision
                                ),
                                depositErr: "",
                              });
                            }}
                          >
                            25%
                          </button>
                          <button
                            className="single-percentage-btn"
                            onClick={() => {
                              const amt = this.web3.utils
                                .toBN(this.state.balance[this.state.tempkey])
                                .div(this.web3.utils.toBN(2));
                              this.setState({
                                dAmount: this.web3.utils.fromWei(
                                  amt,
                                  vaultData[this.state.tempkey]
                                    .web3EquivalentPrecision
                                ),
                                depositErr: "",
                              });
                            }}
                          >
                            50%
                          </button>
                          <button
                            className="single-percentage-btn"
                            onClick={() => {
                              const amt = this.web3.utils
                                .toBN(this.state.balance[this.state.tempkey])
                                .mul(this.web3.utils.toBN(3))
                                .div(this.web3.utils.toBN(4));
                              this.setState({
                                dAmount: this.web3.utils.fromWei(
                                  amt,
                                  vaultData[this.state.tempkey]
                                    .web3EquivalentPrecision
                                ),
                                depositErr: "",
                              });
                            }}
                          >
                            75%
                          </button>
                          <button
                            className="single-percentage-btn"
                            onClick={() => {
                              const amt = this.web3.utils.toBN(
                                this.state.balance[this.state.tempkey]
                              );
                              this.setState({
                                dAmount: this.web3.utils.fromWei(
                                  amt,
                                  vaultData[this.state.tempkey]
                                    .web3EquivalentPrecision
                                ),
                                depositErr: "",
                              });
                            }}
                          >
                            100%
                          </button>
                        </div>
                        <div>
                          <p className="tertiary-color text-sm text-center">
                            {this.state.depositErr ? (
                              this.state.depositErr
                            ) : (
                              <br />
                            )}
                          </p>
                        </div>
                        <div className="text-center btn-action-container">
                          <button
                            className=" flex py-3 px-6 justify-between btn-deposit cursor-pointer focus:outline-none"
                            onClick={() => {
                              this.handleBalanceCheck(
                                this.state.dAmount,
                                this.state.balance[this.state.tempkey],
                                "Deposit",
                                true
                              );
                            }}
                            disabled={this.state.depositErr}
                          >
                            DEPOSIT
                          </button>
                        </div>
                      </div>
                      <div className="col-span-1 text-center inline-block coin-expand-card-partial">
                        <div className="text-center">
                          <input
                            className="py-3 px-4 rounded nord-card-input"
                            id="withdraw"
                            type="text"
                            autoFocus
                            placeholder={
                              "Enter " +
                              vaultData[this.state.tempkey].ntokenname +
                              " withdraw amount"
                            }
                            value={this.state.wAmount}
                            onChange={(e) =>
                              this.handleAmountChange(e, "Withdrawal")
                            }
                          />
                        </div>
                        <div className="percentage-holder">
                          <button
                            className="single-percentage-btn"
                            onClick={() => {
                              const amt = this.web3.utils
                                .toBN(
                                  this.state.nordBalance[this.state.tempkey]
                                )
                                .div(this.web3.utils.toBN(4));
                              this.setState({
                                wAmount: this.web3.utils.fromWei(
                                  amt,
                                  vaultData[this.state.tempkey]
                                    .web3EquivalentPrecision
                                ),
                                withdrawErr: "",
                              });
                            }}
                          >
                            25%
                          </button>
                          <button
                            className="single-percentage-btn"
                            onClick={() => {
                              const amt = this.web3.utils
                                .toBN(
                                  this.state.nordBalance[this.state.tempkey]
                                )
                                .div(this.web3.utils.toBN(2));
                              this.setState({
                                wAmount: this.web3.utils.fromWei(
                                  amt,
                                  vaultData[this.state.tempkey]
                                    .web3EquivalentPrecision
                                ),
                                withdrawErr: "",
                              });
                            }}
                          >
                            50%
                          </button>
                          <button
                            className="single-percentage-btn"
                            onClick={() => {
                              const amt = this.web3.utils
                                .toBN(
                                  this.state.nordBalance[this.state.tempkey]
                                )
                                .mul(this.web3.utils.toBN(3))
                                .div(this.web3.utils.toBN(4));
                              this.setState({
                                wAmount: this.web3.utils.fromWei(
                                  amt,
                                  vaultData[this.state.tempkey]
                                    .web3EquivalentPrecision
                                ),
                                withdrawErr: "",
                              });
                            }}
                          >
                            75%
                          </button>
                          <button
                            className="single-percentage-btn"
                            onClick={() => {
                              const amt = this.web3.utils.toBN(
                                this.state.nordBalance[this.state.tempkey]
                              );
                              this.setState({
                                wAmount: this.web3.utils.fromWei(
                                  amt,
                                  vaultData[this.state.tempkey]
                                    .web3EquivalentPrecision
                                ),
                                withdrawErr: "",
                              });
                            }}
                          >
                            100%
                          </button>
                        </div>
                        <div>
                          <p
                            className={
                              this.state.withdrawErr
                                ? "tertiary-color text-sm text-center"
                                : "secondary-color text-sm text-center"
                            }
                          >
                            {this.state.withdrawErr ? (
                              this.state.withdrawErr
                            ) : Number(this.state.wAmount) ? (
                              "You will receive " +
                              Numbro(
                                Math.trunc(
                                  this.state.wAmount *
                                    100 *
                                    this.web3.utils.fromWei(
                                      this.state.sharePrice[this.state.tempkey],
                                      vaultData[this.state.tempkey]
                                        .web3EquivalentPrecision
                                    )
                                ) / 100
                              ).format({
                                thousandSeparated: true,
                                trimMantissa: true,
                                mantissa: 2,
                                spaceSeparated: false,
                              }) +
                              " " +
                              vaultData[this.state.tempkey].subname
                            ) : (
                              <br />
                            )}
                          </p>
                        </div>
                        <div className="btn-action-container">
                          <button
                            className="flex z-50 py-3 px-6 justify-between btn-deposit cursor-pointer focus:outline-none"
                            onClick={() => {
                              this.handleBalanceCheck(
                                this.state.wAmount,
                                this.state.nordBalance[this.state.tempkey],
                                "Withdrawal",
                                true
                              );
                            }}
                            disabled={this.state.withdrawErr}
                          >
                            WITHDRAW
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </LoadingOverlay>
              <ToastContainer
                enableMultiContainer
                containerId={"networkErr"}
                limit={1}
                position={toast.POSITION.TOP_LEFT}
              />
              <ToastContainer
                enableMultiContainer
                containerId={"Err"}
                position={toast.POSITION.BOTTOM_RIGHT}
              />
              <Modal
                isOpen={this.state.isConfirmPopupOpen}
                shouldCloseOnOverlayClick={false}
                shouldCloseOnEsc={false}
                style={customStyles}
                contentLabel="Example Modal"
              >
                <div className="">
                  <div className="flex justify-center mb-8">
                    <p className="text-3xl">
                      {"Confirm " + this.state.confirmPopupType + " Amount"}
                    </p>
                  </div>
                  <div>
                    <div className="flex pt-2 justify-between gap-4">
                      <p className="text-sm text-color text-left ">
                        {this.state.confirmPopupType + " Amount"}
                      </p>
                      <p className="font-bold text-sm-right text-right ">
                        {this.state.confirmPopupType === "Deposit"
                          ? (this.state.dAmount &&
                            this.state.dAmount.indexOf(".") !== -1
                              ? this.state.dAmount.substring(
                                  0,
                                  this.state.dAmount.indexOf(".")
                                ) +
                                this.state.dAmount.substring(
                                  this.state.dAmount.indexOf("."),
                                  this.state.dAmount.indexOf(".") + 7
                                )
                              : this.state.dAmount) +
                            " " +
                            this.state.selectedToken[0]
                          : (this.state.wAmount &&
                            this.state.wAmount.indexOf(".") !== -1
                              ? this.state.wAmount.substring(
                                  0,
                                  this.state.wAmount.indexOf(".")
                                ) +
                                this.state.wAmount.substring(
                                  this.state.wAmount.indexOf("."),
                                  this.state.wAmount.indexOf(".") + 7
                                )
                              : this.state.wAmount) +
                            " " +
                            this.state.selectedToken[1]}
                      </p>
                    </div>
                    <div className="flex pt-2 justify-between gap-4">
                      <p className="text-sm text-color pr-80 ">Vault</p>
                      <p className="font-bold text-sm-right">
                        {this.state.selectedToken[1]}
                      </p>
                    </div>
                    {this.state.displayInfiniteSwitch ? (
                      <div className="flex pt-2 justify-between gap-4">
                        <p className="text-sm text-color">
                          {"Infinite approval - Trust " + " Contract forever"}
                          <div className="tooltip">
                            <img
                              src={Info}
                              alt=""
                              className="mb-1 ml-1 h-4 w-4 cursor-pointer"
                            />
                            <span className="tooltiptext">
                              {"By toggling this, You are agreeing to trust the contract to approve and spend infinite amount of " +
                                this.state.selectedToken[0] +
                                ",saving you any extra gas fee in subsequent " +
                                this.state.selectedToken[0] +
                                " deposit transaction"}
                            </span>
                          </div>
                        </p>
                        <div>
                          <label>
                            <input
                              id="infiniteApproval"
                              checked={this.state.infiniteApproval}
                              value={this.state.infiniteApproval}
                              onChange={this._handleChange}
                              className="switch"
                              type="checkbox"
                            />
                            <div>
                              <div></div>
                            </div>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <p />
                    )}
                    <div className="flex mt-10 gap-6 justify-end">
                      <button
                        className=" flex py-2 px-6 btn-cancel cursor-pointer focus:outline-none"
                        onClick={() => {
                          this.handlePopupClose(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className=" flex py-2 px-6 btn-continue cursor-pointer focus:outline-none"
                        onClick={() => {
                          this.handlePopupClose(true);
                        }}
                      >
                        Yes and Continue
                      </button>
                    </div>
                  </div>
                </div>
              </Modal>
            </Layout>
          </LoadingOverlay>
        </LoadingOverlay>
      </>
    );
  }
}

export default DashBoard;
