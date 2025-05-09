import React, { useEffect, useState } from "react";
import "./../styles/ManageComments.css";

const ManageComments = () => {
  const [comments, setComments] = useState([]); // Kommentaaride hoidmiseks
  const [loading, setLoading] = useState(true); // Laadimisolek

  useEffect(() => {
    // Kommenteerimise andmete toomine serverist
    const fetchComments = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/comments", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Kasutaja autentimine
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`); // Viga andmete laadimisel
        }

        const data = await response.json(); // Kommenteerimise andmete töötlemine
        setComments(data); // Salvestame kommentaarid olekusse
      } catch (error) {
        console.error("Error fetching comments:", error); // Vea logimine
      } finally {
        setLoading(false); // Laadimise lõpp
      }
    };

    fetchComments();
  }, []);

  // Kommenteerimise kinnitamine
  const handleApproveComment = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/admin/comments/${id}/approve`, {
        method: "PUT", // PUT päring kinnitamiseks
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Kasutaja autentimine
        },
      });
      setComments(comments.filter((comment) => comment.id !== id)); // Eemaldame kinnitatud kommentaari loendist
    } catch (error) {
      console.error("Error approving comment:", error); // Vea logimine
    }
  };

  // Kommenteerimise tagasi lükkamine
  const handleRejectComment = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/admin/comments/${id}/reject`, {
        method: "PUT", // PUT päring tagasi lükkamiseks
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Kasutaja autentimine
        },
      });
      setComments(comments.filter((comment) => comment.id !== id)); // Eemaldame tagasi lükatud kommentaari loendist
    } catch (error) {
      console.error("Error rejecting comment:", error); // Vea logimine
    }
  };

  // Kommenteerimise kustutamine
  const handleDeleteComment = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/admin/comments/${id}`, {
        method: "DELETE", // DELETE päring kustutamiseks
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Kasutaja autentimine
        },
      });
      setComments(comments.filter((comment) => comment.id !== id)); // Eemaldame kustutatud kommentaari loendist
    } catch (error) {
      console.error("Error deleting comment:", error); // Vea logimine
    }
  };

  // Kui kommentaarid laadivad
  if (loading) {
    return <p>Loading comments...</p>; // Laadimise tekst
  }

  return (
    <div className="manage-comments">
      <h1>Manage Comments</h1> {/* Pealkiri */}
      <table className="comments-table">
        <thead>
          <tr>
            <th>Username</th> {/* Kasutajanimi */}
            <th>Restaurant</th> {/* Restoran */}
            <th>Comment</th> {/* Kommentaar */}
            <th>Created At</th> {/* Loome aeg */}
            <th>Actions</th> {/* Tegevused */}
          </tr>
        </thead>
        <tbody>
          {comments.map((comment) => (
            <tr key={comment.id}>
              <td>{comment.username}</td>
              <td>{comment.restaurant_name}</td>
              <td>{comment.comment}</td>
              <td>{new Date(comment.created_at).toLocaleString()}</td> {/* Kuupäeva kuvamine */}
              <td>
                {/* Kinnitamine, tagasi lükkamine, kustutamine */}
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
