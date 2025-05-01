import React from "react";
import { Link } from "react-router-dom";
import "./../styles/AdminPage.css";

const AdminPage = () => {
  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      <ul>
        <li>
          <Link to="/admin/restaurants">Manage Restaurants</Link>
        </li>
        <li>
          <Link to="/admin/comments">Manage Comments</Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminPage;