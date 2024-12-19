import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import '../styles/Home.css';
import { FaHeart, FaComment, FaShare, FaSearch, FaPlus, FaUser, FaPlay, FaSignOutAlt, FaBell } from 'react-icons/fa';
import CreateRecipeModal from './CreateRecipeModal';
import Profile from './Profile';
import RecipeDetails from './RecipeDetails';
import { 
  FacebookShareButton, 
  WhatsappShareButton, 
  TwitterShareButton,
  FacebookIcon,
  WhatsappIcon,
  TwitterIcon
} from 'react-share';
import UserProfile from './UserProfile';

const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'just now';
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    // For older dates, show the date in a friendly format
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
};

function Home() {
  const [recipes, setRecipes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedShareRecipe, setSelectedShareRecipe] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedUsername, setSelectedUsername] = useState(null);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [notificationCommentId, setNotificationCommentId] = useState(null);
  const notificationsRef = useRef(notifications);

  // Add ref for search container
  const searchContainerRef = useRef(null);

  // Add notification ref
  const notificationRef = useRef(null);

  const refreshToken = async () => {
    try {
      const oldToken = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/refresh-token', {
        token: oldToken
      });
      const newToken = response.data.token;
      localStorage.setItem('token', newToken);
      return newToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      localStorage.removeItem('token');
      window.location.href = '/';
      return null;
    }
  };

  const fetchRecipes = useCallback(async () => {
    try {
      let token = localStorage.getItem('token');
      
      if (!token) {
        token = await refreshToken();
        if (!token) return;
      }

      const response = await axios.get('http://localhost:5000/api/recipes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipes(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          const response = await axios.get('http://localhost:5000/api/recipes', {
            headers: { Authorization: `Bearer ${newToken}` }
          });
          setRecipes(response.data);
        }
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedNotifications = response.data.map(newNotif => {
        const existingNotif = notificationsRef.current.find(n => n.id === newNotif.id);
        return existingNotif ? { ...newNotif, is_read: existingNotif.is_read } : newNotif;
      });
      
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(() => {
      if (!showNotifications) {
        fetchNotifications();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications, showNotifications]);

  const handleRecipeDeleted = () => {
    fetchRecipes();
  };

  const filteredRecipes = recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleLike = async (recipeId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/recipes/${recipeId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRecipes(); // Refresh recipes to update like count
    } catch (error) {
      console.error('Error liking recipe:', error);
    }
  };

  const handleShare = (recipe) => {
    setSelectedShareRecipe(recipe);
    setShowShareModal(true);
  };

  const handleNotificationClick = async (notification) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/notifications/${notification.id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === notification.id
            ? { ...notif, is_read: true }
            : notif
        )
      );

      const recipe = recipes.find(r => r.id === notification.recipe_id);
      if (recipe) {
        setSelectedRecipe({
          ...recipe,
          initialTab: 'comments',
          highlightCommentId: notification.comment_id
        });
        setNotificationCommentId(notification.comment_id);
      }

      setUnreadCount(prev => Math.max(0, prev - 1));
      setShowNotifications(false);
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const scrollToTop = () => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleUsernameClick = (username, event) => {
    event.stopPropagation(); // Prevent recipe card click
    setSelectedUsername(username);
    setIsUserProfileOpen(true);
  };

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
        setSearchQuery('');  // Optional: clear search when closing
      }
    }

    // Add event listener when search is open
    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  // Add click outside handler for notifications
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/notifications/mark-all-read',
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({
          ...notification,
          is_read: true
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleRecipeUpdate = (updatedRecipe) => {
    setRecipes(prevRecipes => 
      prevRecipes.map(recipe => 
        recipe.id === updatedRecipe.id ? updatedRecipe : recipe
      )
    );
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="logo" onClick={scrollToTop}>
          <h1>Foodopia</h1>
          <img 
            src="/burger-camera-logo.png"
            alt="Foodopia Logo" 
            className="burger-logo"
          />
        </div>
        <div className="header-right">
          <div 
            ref={searchContainerRef}
            className={`search-container ${isSearchOpen ? 'active' : ''}`}
          >
            {isSearchOpen && filteredRecipes.length > 0 && (
              <div className="search-results-count">
                {filteredRecipes.length} {filteredRecipes.length === 1 ? 'result' : 'results'}
              </div>
            )}
            <button 
              className="search-toggle"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <FaSearch />
            </button>
            {isSearchOpen && (
              <input
                type="text"
                placeholder="Search recipes or chefs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus
              />
            )}
          </div>
          <div 
            ref={notificationRef}
            className="notifications-container"
          >
            <button 
              className="notification-btn" 
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  {notifications.length > 0 && (
                    <button 
                      className="mark-all-read"
                      onClick={handleMarkAllRead}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="no-notifications">
                    <div className="empty-icon">🔔</div>
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="notifications-list">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="notification-avatar">
                          {notification.from_user_image ? (
                            <img 
                              src={notification.from_user_image} 
                              alt={notification.from_username} 
                            />
                          ) : (
                            <div className="default-avatar">
                              <FaUser />
                            </div>
                          )}
                        </div>
                        <div className="notification-content">
                          <p>{notification.message}</p>
                          <span className="notification-time">
                            {formatRelativeTime(notification.created_at)}
                          </span>
                        </div>
                        {!notification.is_read && <div className="unread-dot" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="add-recipe-btn" onClick={() => setIsModalOpen(true)}>
            <FaPlus />
            Add Recipe
          </button>
          <div className="user-profile" onClick={() => setIsProfileOpen(true)}>
            <FaUser />
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      <main>
        <div className="welcome-section">
          <h1>Welcome to Foodopia</h1>
          <p>Embark on a culinary journey and share your gastronomic creations!</p>
        </div>

        <div className="recipe-grid">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <div key={recipe.id} className="recipe-card">
                <div className="recipe-author">
                  <div className="author-avatar" onClick={(e) => handleUsernameClick(recipe.author, e)}>
                    {recipe.author_image ? (
                      <img 
                        src={recipe.author_image} 
                        alt={recipe.author} 
                        className="author-image"
                      />
                    ) : (
                      <div className="default-avatar">
                        <FaUser />
                      </div>
                    )}
                  </div>
                  <span 
                    className="author-name"
                    onClick={(e) => handleUsernameClick(recipe.author, e)}
                  >
                    {recipe.author}
                  </span>
                </div>

                <div className="recipe-image">
                  {recipe.video_url ? (
                    <>
                      <video 
                        src={recipe.video_url}
                        poster={recipe.thumbnail_url || 'https://via.placeholder.com/400x300?text=Recipe'}
                        onClick={() => setSelectedRecipe(recipe)}
                      />
                      <div className="video-indicator">
                        <FaPlay />
                      </div>
                    </>
                  ) : (
                    <img 
                      src={recipe.image_url || 'https://via.placeholder.com/400x300?text=Recipe'} 
                      alt={recipe.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=Recipe';
                      }}
                    />
                  )}
                </div>
                
                <div className="recipe-details">
                  <h3>{recipe.name}</h3>
                  <div className="recipe-stats">
                    <button 
                      className={`stat-btn ${recipe.liked ? 'liked' : ''}`}
                      onClick={() => handleLike(recipe.id)}
                    >
                      <FaHeart />
                      <span>{recipe.likes}</span>
                    </button>
                    <button 
                      className="stat-btn"
                      onClick={() => setSelectedRecipe(recipe)}
                    >
                      <FaComment />
                      <span>{recipe.comments}</span>
                    </button>
                    <button 
                      className="stat-btn"
                      onClick={() => handleShare(recipe)}
                    >
                      <FaShare />
                    </button>
                    <button 
                      className="view-recipe" 
                      onClick={() => setSelectedRecipe(recipe)}
                    >
                      View Recipe
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <h3>No recipes found</h3>
              <p>Try searching for something else</p>
            </div>
          )}
        </div>
      </main>

      <CreateRecipeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onRecipeCreated={fetchRecipes}
      />

      <Profile 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onRecipeDeleted={handleRecipeDeleted}
      />

      {selectedRecipe && (
        <RecipeDetails 
          recipe={selectedRecipe} 
          onClose={() => {
            setSelectedRecipe(null);
            setNotificationCommentId(null); // Reset notification comment ID
          }} 
          onUpdate={handleRecipeUpdate}
          notificationCommentId={notificationCommentId}
        />
      )}

      {showShareModal && selectedShareRecipe && (
        <div className="share-modal">
          <div className="share-content">
            <h3>Share Recipe</h3>
            <div className="share-buttons">
              <FacebookShareButton 
                url={`${window.location.origin}/recipe/${selectedShareRecipe.id}`}
                quote={`Check out this recipe for ${selectedShareRecipe.name}!`}
              >
                <FacebookIcon size={32} round />
              </FacebookShareButton>
              <WhatsappShareButton
                url={`${window.location.origin}/recipe/${selectedShareRecipe.id}`}
                title={`Check out this recipe for ${selectedShareRecipe.name}!`}
              >
                <WhatsappIcon size={32} round />
              </WhatsappShareButton>
              <TwitterShareButton
                url={`${window.location.origin}/recipe/${selectedShareRecipe.id}`}
                title={`Check out this recipe for ${selectedShareRecipe.name}!`}
              >
                <TwitterIcon size={32} round />
              </TwitterShareButton>
            </div>
            <div className="share-link">
              <input 
                type="text" 
                value={`${window.location.origin}/recipe/${selectedShareRecipe.id}`}
                readOnly
              />
              <button onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/recipe/${selectedShareRecipe.id}`);
                alert('Link copied to clipboard!');
              }}>
                Copy Link
              </button>
            </div>
            <button className="close-share" onClick={() => setShowShareModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {isUserProfileOpen && (
        <UserProfile
          username={selectedUsername}
          isOpen={isUserProfileOpen}
          onClose={() => {
            setIsUserProfileOpen(false);
            setSelectedUsername(null);
          }}
        />
      )}
    </div>
  );
}

export default Home;