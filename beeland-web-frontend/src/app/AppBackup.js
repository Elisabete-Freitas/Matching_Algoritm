import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './App.scss';
import Navbar from './shared/Navbar';
import Footer from './shared/Footer';
import { withTranslation } from "react-i18next";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Dashboard from './dashboard/Dashboard';
import Dashboard2 from './dashboard/dashboard2';
import Administration from './dashboard/Administration';
import AppRoutes from './AppRoutes';
class App extends Component {
  state = {    activeTab: 'Dashboard', // Define a tab 'Dashboard' como ativa inicialmente
}
  componentDidMount() {
    this.onRouteChanged();
  }

  handleTabChange = (tab) => {
    this.setState({ activeTab: tab });
  };
  render () {
    let navbarComponent = !this.state.isFullPageLayout ? <Navbar/> : '';
   
    let footerComponent = !this.state.isFullPageLayout ? <Footer/> : '';
    return (
      <div className="container-scroller">
      {navbarComponent}
      <div className="container-fluid page-body-wrapper">
        <div className="content-wrapper" style={{ background: "#FFFFFF" }}>
          <Tabs
            defaultActiveKey="Dashboard" // Defina a tab ativa padrão como 'Dashboard'
            activeKey={this.state.activeTab} // Use o estado 'activeTab' para controlar a tab ativa
            onSelect={this.handleTabChange} // Defina o manipulador de eventos para alterar a tab ativa
            id="uncontrolled-tab-example"
            className="mb-3"
          >
             
             <Tab eventKey="Dashboard" title="Dashboard">
              <Dashboard />
            </Tab>
            <Tab eventKey="Aministration" title="Administration">
              <Administration />
            </Tab>
            <Tab eventKey="Dashboard2" title="Dashboard2">
             <AppRoutes />
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
}





 

  onRouteChanged() {

    const { i18n } = this.props;
    const body = document.querySelector('body');
    if(this.props.location.pathname === '/layout/RtlLayout') {
      body.classList.add('rtl');
      i18n.changeLanguage('ar');
    }
    else {
      body.classList.remove('rtl')
      i18n.changeLanguage('en');
    }
    
  }

}

export default withTranslation()(withRouter(App));
