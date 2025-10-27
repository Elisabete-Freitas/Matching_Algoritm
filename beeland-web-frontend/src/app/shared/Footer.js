import React, { Component } from "react";
// import { Trans } from 'react-i18next';
import "./footer.css";
import LogoFunding from "../assets/funding-logo.png";

class Footer extends Component {
  render() {
    return (
      <footer className="footer">
        <div
          className="container-fluid"
          style={{
            textDecoration: "none",
            color: "#59817F",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding:0,
            margin:0
          }}
        >
          <div>
            <img src={LogoFunding} width={550} style={{
              paddingRight:20}
            } />
          </div>
          <div>
            &copy;2024 - <span>developed by </span>
            <b>MORECOLAB</b> 
           
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;
