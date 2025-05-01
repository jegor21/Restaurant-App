import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/AdminPage.css";

const AdminPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const restaurantResponse = await fetch("http://localhost:5000/api/admin/restaurants", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const restaurantData = await restaurantResponse.json();
        setRestaurants(restaurantData);

        const commentResponse = await fetch("http://localhost:5000/api/admin/comments", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const commentData = await commentResponse.json();
        setComments(commentData);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleApproveComment = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/admin/comments/${id}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setComments(comments.map((comment) => (comment.id === id ? { ...comment, status: "approved" } : comment)));
    } catch (error) {
      console.error("Error approving comment:", error);
    }
  };

  const handleRejectComment = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/admin/comments/${id}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setComments(comments.map((comment) => (comment.id === id ? { ...comment, status: "rejected" } : comment)));
    } catch (error) {
      console.error("Error rejecting comment:", error);
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/admin/comments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setComments(comments.filter((comment) => comment.id !== id));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  if (loading) {
    return <p>Loading admin data...</p>;
  }

  return (
    <div className="admin-page">
      <h1>Admin Page</h1>
      <h2>Manage Restaurants</h2>
      <ul>
        {restaurants.map((restaurant) => (
          <li key={restaurant.id}>
            {restaurant.name} - {restaurant.city}
            {/* CRUD operations */}
          </li>
        ))}
      </ul>

      <h2>Manage Comments</h2>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            {comment.comment} - {comment.status}
            <button onClick={() => handleApproveComment(comment.id)}>Approve</button>
            <button onClick={() => handleRejectComment(comment.id)}>Reject</button>
            <button onClick={() => handleDeleteComment(comment.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPage;