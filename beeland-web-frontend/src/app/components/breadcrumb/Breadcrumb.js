import React from "react";
import { useHistory } from "react-router-dom";
import { MdOutlineHome } from "react-icons/md";
import "./Breadcrumb.css"; // Make sure to create a corresponding CSS file

const Breadcrumb = ({ pageName }) => {
  const history = useHistory();
  return (
    <div className="breadcrumb">
      <span className="breadcrumb-home-link " onClick={() => history.push("/")}>
        <MdOutlineHome size={25}/> <span style={{marginLeft:"0.5rem"}}>Home</span>
      </span>

      <span style={{margin:"0rem 0.5rem"}}> &gt; </span>
      <span className="breadcrumb-current-page">{pageName}</span>
    </div>
  );
};

export default Breadcrumb;
