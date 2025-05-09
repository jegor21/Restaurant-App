import React, { useEffect, useState, useContext, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../UserContext";
import "./../styles/RestaurantDetails.css";
import { useTranslation } from 'react-i18next';


const randomImages = [
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
  "https://images.unsplash.com/photo-1505275350441-83dcda8eeef5",
  "https://images.unsplash.com/photo-1497644083578-611b798c60f3",
  "https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6"
];

const getRandomImage = (id) => {
  const hash = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % randomImages.length;
  return randomImages[index];
};




const RestaurantDetails = () => {
  const { place_id } = useParams();

  const randomImage = useMemo(() => {
    const key = `restaurantImage_${place_id}`;
    const saved = localStorage.getItem(key);
    if (saved) return saved;

    const index = Math.floor(Math.random() * randomImages.length);
    const selected = randomImages[index];
    localStorage.setItem(key, selected);
    return selected;
  }, [place_id]);
  
  
  const location = useLocation();
  const passedPhoto = location.state?.photo;

  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useContext(UserContext);
  const assignedPhoto = location.state?.photo || null;
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

  


  const getAssignedImageFromLocalStorage = (restaurant) => {
    const storedImages = JSON.parse(localStorage.getItem("assignedRestaurantImages")) || {};
    return storedImages[restaurant.id] || storedImages[restaurant.place_id] || null;
  };
  
  
  
  const getPhotoUrl = (restaurant) => {
    const photo = restaurant?.photos;
    if (!photo || photo === "/uploads/no-photo.jpg" || photo === "null") {
      return randomImage;
    }
    return `http://localhost:5000${photo}`;
  };
  
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('photo', file);
  
    try {
      const response = await fetch(`http://localhost:5000/api/admin/restaurants/${restaurant.id}/photo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        setRestaurant({ ...restaurant, photos: data.photo_src });
        alert('Photo uploaded successfully');
      } else {
        throw new Error('Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    }
  };

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


  const sortedComments = [...comments].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.created_at) - new Date(a.created_at); 
    } else {
      return new Date(a.created_at) - new Date(b.created_at); 
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
      <button onClick={() => navigate("/restaurants")} className="back-button">
      Return to Restaurants
    </button>
      {isAdmin && (
        <div className="admin-actions">
          <button onClick={() => setEditing(true)} className="update-button">Update Details</button>
          <button onClick={handleDeleteRestaurant} className="delete-button">Delete Restaurant</button>
        </div>
      )}
      <div className="top-section">
  <div className="photos-section">
    <h3>Photo</h3>
    <img
          src={getPhotoUrl(restaurant)}
          alt={restaurant?.name || "Restaurant"}
          className="restaurant-photo"
        />





    {isAdmin && editing && (
      <div>
        <label htmlFor="photo">Upload Photo:</label>
        <input type="file" id="photo" onChange={handlePhotoUpload} />
      </div>
    )}
  </div>


        {/* Map Section */}
        <div className="map-section">
          <h3>Map</h3>
          {restaurant.lat && restaurant.lng ? (
            <MapContainer
              center={[restaurant.lat, restaurant.lng]}
              zoom={15}
              style={{ height: "300px", width: "100%", borderRadius: "8px" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[restaurant.lat, restaurant.lng]}>
                <Popup>
                  {restaurant.name} <br /> {restaurant.address}
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <p>Location data is not available for this restaurant.</p>
          )}
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
            <button onClick={handleGoogleSearch} className="google-button">
            Search on Google
          </button>
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