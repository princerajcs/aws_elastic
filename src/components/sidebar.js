import React, { Component } from "react";
import Iconbutton from "../assets/images/navicon.svg";
import BackIcon from "../assets/images/iconback.svg";
import Numbro from "numbro";
import PropTypes from "prop-types";

class sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
    };
  }

  handleToggle = () => {
    this.setState((state) => {
      return {
        isOpen: !state.isOpen,
      };
    });
  };

  render() {
    return (
      <>
        <div className="flex h-full flex-col sm:flex-row sm:justify-around relative">
          {this.state.isOpen ? (
            <div className="w-64 h-screen-custom bg-sidebar overflow-y-hidden">
              <div className="grid justify-center sidebar-back">
                <img
                  src={Iconbutton}
                  alt=""
                  className="h-12 cursor-pointer"
                  onClick={this.handleToggle}
                />
              </div>
              <div className="card leading-loose">
                <p className="text-sm text-color">NORD Token</p>
                <hr className="my-4"></hr>
                <div className="flex justify-between">
                  <p className="text-sm text-color">Wallet Balance</p>
                </div>
                <div className="flex justify-between ml-2">
                  <p className="font-bold">
                    {this.props.nBal[0]
                      ? this.props.nBal[0] < 100000
                        ? Numbro(this.props.nBal[0]).format({
                            thousandSeparated: true,
                            trimMantissa: true,
                            mantissa: 2,
                            spaceSeparated: false,
                          })
                        : Numbro(this.props.nBal[0])
                            .format({
                              thousandSeparated: true,
                              trimMantissa: true,
                              mantissa: 2,
                              average: true,
                              spaceSeparated: false,
                            })
                            .toUpperCase()
                      : "0"}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-color">Unclaimed Balance</p>
                </div>
                <div className="flex justify-between ml-2">
                  <p className="font-bold">
                    {this.props.nBal[1]
                      ? this.props.nBal[1] < 100000
                        ? Numbro(this.props.nBal[1]).format({
                            thousandSeparated: true,
                            trimMantissa: true,
                            mantissa: 2,
                            spaceSeparated: false,
                          })
                        : Numbro(this.props.nBal[1])
                            .format({
                              thousandSeparated: true,
                              trimMantissa: true,
                              mantissa: 2,
                              average: true,
                              spaceSeparated: false,
                            })
                            .toUpperCase()
                      : "0"}
                  </p>
                </div>
                <div className="flex justify-between">
                  <button
                    className=" flex py-1.5 px-5 justify-between btn-deposit cursor-pointer focus:outline-none"
                    onClick={() => {
                      this.props.claim();
                    }}
                    disabled={this.props.loading || !this.props.nBal[1]}
                  >
                    Claim Nord
                  </button>
                </div>
              </div>
              <div className="card leading-loose">
                <p className="text-sm text-color">Total Supply</p>
                <p className="font-bold">
                  {this.props.tSupply
                    ? this.props.tSupply < 100000
                      ? Numbro(this.props.tSupply).format({
                          thousandSeparated: true,
                          trimMantissa: true,
                          mantissa: 2,
                          spaceSeparated: false,
                        })
                      : Numbro(this.props.tSupply)
                          .format({
                            thousandSeparated: true,
                            trimMantissa: true,
                            mantissa: 2,
                            average: true,
                            spaceSeparated: false,
                          })
                          .toUpperCase()
                    : "0"}
                </p>
                <hr className="my-4"></hr>
                {this.props.tokens.map((data, index) => (
                  <div className="flex justify-between" key={index}>
                    <p className="text-sm text-color">{data}</p>
                    <p className="font-bold">
                      {this.props.vSupply[index]
                        ? this.props.vSupply[index] < 100000
                          ? Numbro(this.props.vSupply[index]).format({
                              thousandSeparated: true,
                              trimMantissa: true,
                              mantissa: 2,
                              spaceSeparated: false,
                            })
                          : Numbro(this.props.vSupply[index])
                              .format({
                                thousandSeparated: true,
                                trimMantissa: true,
                                mantissa: 2,
                                average: true,
                                spaceSeparated: false,
                              })
                              .toUpperCase()
                        : "0"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-20 h-screen-custom bg-sidebar overflow-y-hidden">
              <div className="grid justify-center sidebar-back">
                <img
                  src={BackIcon}
                  alt=""
                  className="h-12 cursor-pointer"
                  onClick={this.handleToggle}
                />
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
}

sidebar.propTypes = {
  nBal: PropTypes.array.isRequired,
  tSupply: PropTypes.array.isRequired,
  tokens: PropTypes.array.isRequired,
  vSupply: PropTypes.array.isRequired,
  claim: PropTypes.instanceOf(Promise),
  loading: PropTypes.bool.isRequired,
};

export default sidebar;
