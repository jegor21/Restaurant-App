import React, { useEffect, useState } from "react";
import "./../styles/ManageComments.css";

const ManageComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/comments", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  const handleApproveComment = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/admin/comments/${id}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setComments(comments.filter((comment) => comment.id !== id));
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
      setComments(comments.filter((comment) => comment.id !== id));
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
    return <p>Loading comments...</p>;
  }

  return (
    <div className="manage-comments">
      <h1>Manage Comments</h1>
      <table className="comments-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Restaurant</th>
            <th>Comment</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((comment) => (
            <tr key={comment.id}>
              <td>{comment.username}</td>
              <td>{comment.restaurant_name}</td>
              <td>{comment.comment}</td>
              <td>{new Date(comment.created_at).toLocaleString()}</td>
              <td>
                <button onClick={() => handleApproveComment(comment.id)}>Approve</button>
                <button onClick={() => handleRejectComment(comment.id)}>Reject</button>
                <button onClick={() => handleDeleteComment(comment.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageComments;