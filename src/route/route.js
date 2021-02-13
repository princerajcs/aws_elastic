import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from "../view/HomePage";
import Dashboard from "../view/DashBoard";
import Error from "../view/Error";
class PublicRoute extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Home}></Route>
          <Route exact path="/dashboard" component={Dashboard}></Route>
          <Route component={Error} />
        </Switch>
      </Router>
    );
  }
}

export default PublicRoute;
