import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import "./../styles/RestaurantDetails.css";

const RestaurantDetails = () => {
  const { place_id } = useParams(); 
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(UserContext);
  const [restaurant, setRestaurant] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/restaurants/${place_id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRestaurant(data);
        setLikes(data.likes || 0);
        setDislikes(data.dislikes || 0);
        setComments(data.comments || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [place_id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please log in to comment.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/restaurants/${place_id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ comment: newComment }),
      });
      if (response.ok) {
        const newCommentData = await response.json();
        setComments([...comments, newCommentData]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert("Please log in to like.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/restaurants/${place_id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        setLikes(likes + 1);
      }
    } catch (error) {
      console.error("Error liking restaurant:", error);
    }
  };

  const handleDislike = async () => {
    if (!isAuthenticated) {
      alert("Please log in to dislike.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/restaurants/${place_id}/dislike`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        setDislikes(dislikes + 1);
      }
    } catch (error) {
      console.error("Error disliking restaurant:", error);
    }
  };

  if (loading) {
    return <p className="loading-text">Loading restaurant details...</p>;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Error: {error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="error-message">
        <p>Restaurant not found</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="restaurant-details">
      <button onClick={() => navigate(-1)} className="back-button">Go Back</button>
      <h2>{restaurant.name}</h2>
      <p><strong>Address:</strong> {restaurant.address}</p>
      <p><strong>Rating:</strong> {restaurant.rating} ({restaurant.total_ratings} reviews)</p>

      <div className="like-dislike">
        <button onClick={handleLike} className="like-button">👍 {likes}</button>
        <button onClick={handleDislike} className="dislike-button">👎 {dislikes}</button>
      </div>

      <div className="comments-section">
        <h3>Comments</h3>
        {comments.map((comment, index) => (
          <p key={index} className="comment">{comment}</p>
        ))}
        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              required
            />
            <button type="submit">Submit</button>
          </form>
        ) : (
          <p>Please log in to leave a comment.</p>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetails;