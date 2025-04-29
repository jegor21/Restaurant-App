import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import "./../styles/RestaurantDetails.css";

const RestaurantDetails = () => {
  const { id } = useParams();
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
        const response = await fetch(`http://localhost:5000/api/restaurants/${id}`);
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
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please log in to comment.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/restaurants/${id}/comments`, {
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
      const response = await fetch(`http://localhost:5000/api/restaurants/${id}/like`, {
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
      const response = await fetch(`http://localhost:5000/api/restaurants/${id}/dislike`, {
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
    return <p className="loading-text">Загрузка данных ресторана...</p>;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Ошибка: {error}</p>
        <button onClick={() => navigate(-1)}>Назад</button>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="error-message">
        <p>Ресторан не найден</p>
        <button onClick={() => navigate(-1)}>Назад</button>
      </div>
    );
  }

  return (
    <div className="restaurant-details">
      <button onClick={() => navigate(-1)} className="back-button">Назад</button>
      <h2>{restaurant.name}</h2>
      <p><strong>Адрес:</strong> {restaurant.address}</p>
      <p><strong>Рейтинг:</strong> {restaurant.rating} ({restaurant.total_ratings} отзывов)</p>

      <div className="like-dislike">
        <button onClick={handleLike} className="like-button">👍 {likes}</button>
        <button onClick={handleDislike} className="dislike-button">👎 {dislikes}</button>
      </div>

      <div className="comments-section">
        <h3>Комментарии</h3>
        {comments.map((comment, index) => (
          <p key={index} className="comment">{comment}</p>
        ))}
        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Добавить комментарий..."
              required
            />
            <button type="submit">Отправить</button>
          </form>
        ) : (
          <p>Пожалуйста, войдите, чтобы оставить комментарий.</p>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetails;