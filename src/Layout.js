import React, { Component } from "react";
import PropTypes from "prop-types";

class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    console.log(props);
  }

  render() {
    return (
      <>
        <div className="body-container flex flex-col items-start justify-start flex-1 overflow-y-auto p-1 bg-gray-200  h-screen">
          <div className="min-h-full min-w-full max-w-full">
            {this.props.children}
          </div>
        </div>
      </>
    );
  }
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
