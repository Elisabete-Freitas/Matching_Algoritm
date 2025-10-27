import React, { Component, Suspense, lazy } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Spinner from "../app/shared/Spinner";

const Login = lazy(() => import("./Login"));
const HomePage = lazy(() => import("./home/HomePage"));
const DashboardFarmerPage = lazy(()=> import("./dashboard/DashboardFarmerPage"));
const DashboardBeekeeperPage = lazy(()=> import("./dashboard/DashboardBeekeeperPage"));
const RegisterPage = lazy(()=> import("./register/RegisterPage"));
const BeekeeperRegistration = lazy(()=> import("./register/RegisterBeekeeper"));
const FarmerRegistration = lazy(()=> import("./register/RegisterFarmer"));
const NotificationsPage = lazy(()=> import("./notifications/NotificationsPage"));
const ProfilePage = lazy(()=> import("./profile/ProfilePage"));
const SettingsPage = lazy(()=> import("./system/SettingsPage"));
const PollinationPage = lazy(()=> import("./Pollination/pollination"));
const DashboardAdmin = lazy(()=> import("./Admin/AdminDashboard"));
const FarmerEdit = lazy(()=> import("./EditUser/EditFarmer"));
const BeekeeperEdit = lazy(()=> import("./EditUser/EditBeekeeper"));

class AppRoutes extends Component {
  render() {
    return (
      <Suspense fallback={<Spinner />}>
        <Switch>
          <ProtectedRoute exact path="/" component={HomePage} allowedRoles={['beekeeper', 'farmer','admin']}/>
          <ProtectedRoute exact path="/dashboard-farmer" component={DashboardFarmerPage} allowedRoles={'farmer'}/>
          <ProtectedRoute exact path="/dashboard-beekeeper" component={DashboardBeekeeperPage} allowedRoles={'beekeeper'}/>
          <ProtectedRoute exact path="/dashboard-admin" component={DashboardAdmin} allowedRoles={'admin'}/>

          <ProtectedRoute exact path="/notifications" component={NotificationsPage} allowedRoles={['beekeeper', 'farmer']}/>
          <ProtectedRoute exact path="/profile" component={ProfilePage} allowedRoles={['beekeeper', 'farmer']}/>
          <ProtectedRoute exact path="/pollination" component={PollinationPage} allowedRoles={['beekeeper', 'farmer']}/>
          <ProtectedRoute exact path="/settings" component={SettingsPage} allowedRoles={['admin']}/>

          <Route exact path="/register" component={RegisterPage} />   
          <Route exact path="/beekeeper-registration" component={BeekeeperRegistration} />
          <Route exact path="/farmer-registration" component={FarmerRegistration} />

          <Route exact path="/beekeeper-edit" component={BeekeeperEdit} allowedRoles={['beekeeper']}/>
          <Route exact path="/farmer-edit" component={FarmerEdit} allowedRoles={[ 'farmer']} />

          <Route exact path="/login" component={Login} />        
                    
          {/* ROTAS EM STANDBY*/}        

          {/* <Route path="/error-pages/error-404" component={Error404} />
          <Route path="/error-pages/error-500" component={Error500} />  */}

          <Redirect to="/" />
        </Switch>
      </Suspense>
    );
  }
}

export default AppRoutes;
