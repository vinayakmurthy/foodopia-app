import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaUser, FaHeart, FaComment, FaMapMarkerAlt, FaGlobe, FaAward } from 'react-icons/fa';
import '../styles/UserProfile.css';
import RecipeDetails from './RecipeDetails';

function UserProfile({ username, isOpen, onClose }) {
  const [profile, setProfile] = useState(null);
  const [userRecipes, setUserRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && username) {
      fetchUserProfile();
      fetchUserRecipes();
    }
  }, [isOpen, username]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/users/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setIsFollowing(response.data.is_following);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserRecipes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/recipes/user/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserRecipes(response.data);
    } catch (error) {
      console.error('Error fetching user recipes:', error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem('token');
      const newFollowingState = !isFollowing;
      
      // Update UI optimistically
      setIsFollowing(newFollowingState);
      setProfile(prev => ({
        ...prev,
        followers_count: prev.followers_count + (newFollowingState ? 1 : -1)
      }));

      if (newFollowingState) {
        await axios.post(`http://localhost:5000/api/users/${username}/follow`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.delete(`http://localhost:5000/api/users/${username}/follow`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Refresh both profiles
      await fetchUserProfile();
      
      // Trigger profile update event
      window.dispatchEvent(new CustomEvent('profileUpdated'));

    } catch (error) {
      // Revert optimistic updates
      setIsFollowing(!isFollowing);
      setProfile(prev => ({
        ...prev,
        followers_count: prev.followers_count + (isFollowing ? 1 : -1)
      }));

      console.error('Error toggling follow:', error);
      if (error.response) {
        alert(error.response.data.message || 'Error following/unfollowing user');
      }
    }
  };

  const getBadgeColor = (level) => {
    switch (level) {
      case 'Kitchen Rookie': 
        return 'linear-gradient(135deg, #4CAF50, #45a049)';
      case 'Sous Chef': 
        return 'linear-gradient(135deg, #2196F3, #1976D2)';
      case 'Master Chef': 
        return 'linear-gradient(135deg, #FF9800, #F57C00)';
      case 'Culinary Legend': 
        return 'linear-gradient(135deg, #E91E63, #C2185B)';
      default: 
        return 'linear-gradient(135deg, #9ca3af, #6b7280)';
    }
  };

  if (!isOpen || !profile) return null;

  return (
    <div className="profile-overlay">
      <div className="profile-modal">
        <button className="close-profile-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="profile-content">
          <div className="profile-header">
            <div className="profile-image-section">
              <div className="profile-image-container">
                {profile.profile_image ? (
                  <img src={profile.profile_image} alt={profile.username} className="profile-avatar"/>
                ) : (
                  <div className="default-profile">
                    <FaUser className="default-profile-icon" />
                  </div>
                )}
              </div>
              <h2 className="profile-username">{profile.username}</h2>
            </div>

            <div className="profile-info">
              <div className="profile-header-content">
                <div className="profile-main-info">
                  {profile.cooking_level && (
                    <div 
                      className="cooking-badge"
                      style={{ background: getBadgeColor(profile.cooking_level) }}
                    >
                      <FaAward />
                      <span>{profile.cooking_level}</span>
                    </div>
                  )}
                  <button 
                    className={`follow-btn ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollowToggle}
                    disabled={isLoading}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>

                {profile.location && (
                  <div className="profile-location">
                    <FaMapMarkerAlt />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>

              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-number">{profile.recipes_count}</span>
                  <span className="stat-label">posts</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{profile.followers_count}</span>
                  <span className="stat-label">followers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{profile.following_count}</span>
                  <span className="stat-label">following</span>
                </div>
              </div>

              <div className="profile-bio">
                <p className="bio">{profile.bio || 'No bio yet'}</p>
                {profile.social_links?.website && (
                  <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer" className="website-link">
                    <FaGlobe /> Website
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="recipes-grid">
            {userRecipes.map((recipe) => (
              <div 
                key={recipe.id} 
                className="recipe-post"
                onClick={() => setSelectedRecipe(recipe)}
              >
                <img 
                  src={recipe.image_url || 'https://via.placeholder.com/300'} 
                  alt={recipe.name} 
                />
                <div className="post-overlay">
                  <div className="post-stats">
                    <span><FaHeart /> {recipe.likes || 0}</span>
                    <span><FaComment /> {recipe.comments || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedRecipe && (
          <RecipeDetails 
            recipe={selectedRecipe} 
            onClose={() => setSelectedRecipe(null)} 
          />
        )}
      </div>
    </div>
  );
}

export default UserProfile; 