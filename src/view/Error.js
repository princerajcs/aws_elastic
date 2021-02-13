import React from "react";
import Layout from "../Layout";

const Error = () => {
  return (
    <Layout>
      <div>
        <p className="error flex pr-4 uppercase mt-7 font-bold text-sm">
          Error: Page does not exist!
        </p>
      </div>
    </Layout>
  );
};

export default Error;
