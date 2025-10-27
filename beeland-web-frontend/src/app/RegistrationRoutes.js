import React, { Component, Suspense, lazy } from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import Spinner from "../app/shared/Spinner";


const RegisterPage = lazy(()=> import("./register/RegisterPage"));
const BeekeeperRegistration = lazy(()=> import("./register/RegisterBeekeeper"));
const FarmerRegistration = lazy(()=> import("./register/RegisterFarmer"));

class RegiterRoutes extends Component {
  render() {
    return (
      <Suspense fallback={<Spinner />}>
        <Switch>
        
          <Route exact path="/register" component={RegisterPage} />   
          <Route exact path="/beekeeper-registration" component={BeekeeperRegistration} />
          <Route exact path="/farmer-registration" component={FarmerRegistration} />

        
          
          
          
          {/* ROTAS EM STANDBY*/}
        

          {/* <Route path="/error-pages/error-404" component={Error404} />
          <Route path="/error-pages/error-500" component={Error500} />  */}

          <Redirect to="/" />
        </Switch>
      </Suspense>
    );
  }
}

export default RegiterRoutes;
