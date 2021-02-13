import React, { Component } from "react";

class Footer extends Component {
  render() {
    return (
      <>
        <div className="pt-12 footer-nord-finance">
          <a href="#">
            <p className="text-center text-xs">
              By unlocking Your wallet You agree to our
              <span className="primary-color"> Terms of Service, Privacy </span>
              and <span className="primary-color"> Cookie Policy </span>.
            </p>
          </a>

          <a href="#">
            <p className="pt-4 text-xs text-center">
              Disclaimer: Wallets are provided by External Providers and by
              selecting you agree to Terms of<br></br>those Providers. Your
              access to the wallet might be reliant on the External Provider
              <br></br>
              being operational.
            </p>
          </a>
        </div>
      </>
    );
  }
}

export default Footer;
