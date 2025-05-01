import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import "./../styles/RestaurantDetails.css";

const RestaurantDetails = () => {
  const { place_id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useContext(UserContext);
  const [restaurant, setRestaurant] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("newest");
  const commentsPerPage = 5;
  const commentLimit = 250;
  const [editing, setEditing] = useState(false);

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

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    console.log("Authorization Header:", `Bearer ${localStorage.getItem("token")}`);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (response.ok) {
        setComments(comments.filter((comment) => comment.id !== commentId));
        alert("Comment deleted successfully.");
      } else {
        throw new Error("Failed to delete comment.");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const handleDeleteRestaurant = async () => {
    if (!window.confirm("Are you sure you want to delete this restaurant and all its comments?")) return;
  
    try {
      const response = await fetch(`http://localhost:5000/api/admin/restaurants/${restaurant.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (response.ok) {
        alert("Restaurant and associated comments deleted successfully.");
        navigate("/"); 
      } else {
        throw new Error("Failed to delete restaurant.");
      }
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      alert("Failed to delete restaurant. Please try again.");
    }
  };

  const handleUpdateRestaurant = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch(`http://localhost:5000/api/admin/restaurants/${restaurant.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(restaurant),
      });
  
      if (response.ok) {
        alert("Restaurant updated successfully.");
        setEditing(false);
      } else {
        throw new Error("Failed to update restaurant.");
      }
    } catch (error) {
      console.error("Error updating restaurant:", error);
      alert("Failed to update restaurant. Please try again.");
    }
  };

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
      {isAdmin && (
        <div className="admin-actions">
          <button onClick={() => setEditing(true)} className="update-button">Update Details</button>
          <button onClick={handleDeleteRestaurant} className="delete-button">Delete Restaurant</button>
        </div>
      )}
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
        {editing ? (
          <form onSubmit={handleUpdateRestaurant} className="update-form">
            <div>
              <label htmlFor="name">Name:</label>
              <input
                id="name"
                type="text"
                value={restaurant.name}
                onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
                placeholder="Restaurant Name"
                required
              />
            </div>
            <div>
              <label htmlFor="address">Address:</label>
              <input
                id="address"
                type="text"
                value={restaurant.address}
                onChange={(e) => setRestaurant({ ...restaurant, address: e.target.value })}
                placeholder="Address"
                required
              />
            </div>
            <div>
              <label htmlFor="city">City:</label>
              <input
                id="city"
                type="text"
                value={restaurant.city}
                onChange={(e) => setRestaurant({ ...restaurant, city: e.target.value })}
                placeholder="City"
                required
              />
            </div>
            <div>
              <label htmlFor="rating">Rating:</label>
              <input
                id="rating"
                type="number"
                value={restaurant.rating}
                onChange={(e) => setRestaurant({ ...restaurant, rating: e.target.value })}
                placeholder="Rating"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-button">Save Changes</button>
              <button type="button" onClick={() => setEditing(false)} className="cancel-button">Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <p><strong>Name:</strong> {restaurant.name}</p>
            <p><strong>Address:</strong> {restaurant.address}</p>
            <p><strong>City:</strong> {restaurant.city || "Unknown City"}</p>
            <p><strong>Rating:</strong> {restaurant.rating} ({restaurant.total_ratings} reviews)</p>
          </>
        )}
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

        {sortedComments.map((comment) => (
          <div key={comment.id} className="comment">
            <p><strong>{comment.username}:</strong> {comment.comment}</p>
            <small>
              Posted on: {new Date(comment.created_at).toLocaleString()}
              {comment.status === "pending" && " (Pending Approval)"}
            </small>
            {isAdmin && (
              <button onClick={() => handleDeleteComment(comment.id)} className="delete-comment-button">
                Delete Comment
              </button>
            )}
          </div>
        ))}

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