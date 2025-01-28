import React from "react";
import NavBar from "./NavBar";
import FileUpload from "./FileUpload";

const Dashboard = () => {
  return (
    <div>
      {/* <NavBar /> */}
      <div style={{ margin: "50px auto", width: "80%" }}>
        <FileUpload />
      </div>
    </div>
  );
};

export default Dashboard;
