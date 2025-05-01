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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("newest");
  const commentsPerPage = 5;
  const commentLimit = 250;

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/restaurants/${place_id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRestaurant(data);

        // Fetch comments
        const commentsResponse = await fetch(`http://localhost:5000/api/restaurants/${place_id}/comments`);
        if (!commentsResponse.ok) {
          throw new Error(`HTTP error! status: ${commentsResponse.status}`);
        }
        const commentsData = await commentsResponse.json();
        setComments(commentsData);
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
      alert("Please log in to leave a comment.");
      return;
    }
    if (newComment.trim().length === 0) {
      alert("Comment cannot be empty.");
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
        setComments([newCommentData, ...comments]);
        setNewComment("");
        alert("Your comment has been submitted and is pending approval.");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to submit your comment. Please try again.");
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Sort comments based on the selected order
  const sortedComments = [...comments].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.created_at) - new Date(a.created_at); // Newest first
    } else {
      return new Date(a.created_at) - new Date(b.created_at); // Oldest first
    }
  });

  // Calculate the comments to display for the current page
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = sortedComments.slice(indexOfFirstComment, indexOfLastComment);

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

  const handleGoogleSearch = () => {
    const query = `${restaurant.name}, ${restaurant.address}, ${restaurant.city}`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
  };

  const handleGoogleMaps = () => {
    const { lat, lng } = restaurant;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  return (
    <div className="restaurant-details">
      <button onClick={() => navigate(-1)} className="back-button">Go Back</button>
      <div className="top-section">
        {/* Photos Section */}
        <div className="photos-section">
          <h3>Photos</h3>
          <p>Photo gallery will be displayed here.</p>
        </div>

        {/* Map Section */}
        <div className="map-section">
          <h3>Map</h3>
          <p>Map showing the location of the restaurant will be displayed here.</p>
          <p><strong>Latitude:</strong> {restaurant.lat}</p>
          <p><strong>Longitude:</strong> {restaurant.lng}</p>
          <button onClick={handleGoogleSearch} className="google-button">
            Search on Google
          </button>
          <button onClick={handleGoogleMaps} className="google-button">
            Open in Google Maps
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <h3>Restaurant Information</h3>
        <p><strong>Name:</strong> {restaurant.name}</p>
        <p><strong>Address:</strong> {restaurant.address}</p>
        <p><strong>City:</strong> {restaurant.city || "Unknown City"}</p>
        <p><strong>Rating:</strong> {restaurant.rating} ({restaurant.total_ratings} reviews)</p>
      </div>

      <div className="comments-section">
        <h3>Leave a Comment</h3>
        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => {
                if (e.target.value.length <= commentLimit) {
                  setNewComment(e.target.value);
                }
              }}
              placeholder="Add a comment..."
              maxLength={commentLimit}
              required
            />
            <p className="comment-limit">
              {newComment.length}/{commentLimit} characters
            </p>
            <button type="submit">Submit</button>
          </form>
        ) : (
          <p>Please log in to leave a comment.</p>
        )}

        <h3>Comments</h3>

        {/* Sorting Dropdown */}
        <div className="sorting">
          <label htmlFor="sortOrder">Sort by:</label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {comments.length === 0 ? (
          <p>No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment">
              <p><strong>{comment.username}:</strong> {comment.comment}</p>
              <small>
                Posted on: {new Date(comment.created_at).toLocaleString()}
                {comment.status === "pending" && " (Pending Approval)"}
              </small>
            </div>
          ))
        )}

        {/* Pagination */}
        {comments.length > commentsPerPage && (
          <div className="pagination">
            {Array.from({ length: Math.ceil(comments.length / commentsPerPage) }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={currentPage === index + 1 ? "active" : ""}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetails;