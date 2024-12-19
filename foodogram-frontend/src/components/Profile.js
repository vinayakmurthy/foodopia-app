// frontend/src/components/Profile.js
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { FaTimes, FaEdit, FaUser, FaHeart, FaComment, FaShare, FaCamera, FaUtensils, FaBookmark, FaClock, FaMapMarkerAlt, FaInstagram, FaTwitter, FaGlobe, FaAward, FaUpload } from 'react-icons/fa';
import axios from 'axios';
import '../styles/Profile.css';
import RecipeDetails from './RecipeDetails';
import { jwtDecode } from 'jwt-decode';

function Profile({ isOpen, onClose, onRecipeDeleted }) {
    const [profile, setProfile] = useState({
        username: '',
        bio: '',
        profile_image: null
    });
    const [stats, setStats] = useState({
        recipes_count: 0,
        followers_count: 0,
        following_count: 0
    });
    const [activeTab, setActiveTab] = useState('posts');
    const [isEditing, setIsEditing] = useState(false);
    const [myRecipes, setMyRecipes] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [editingBadge, setEditingBadge] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [availableBadges, setAvailableBadges] = useState([]);

    const badgeOptions = [
        {
            level: 'Kitchen Rookie',
            description: 'Just starting out in the culinary world',
            color: 'linear-gradient(135deg, #4CAF50, #45a049)'
        },
        {
            level: 'Sous Chef',
            description: 'Getting comfortable with cooking techniques',
            color: 'linear-gradient(135deg, #2196F3, #1976D2)'
        },
        {
            level: 'Master Chef',
            description: 'Expert in creating delicious dishes',
            color: 'linear-gradient(135deg, #FF9800, #F57C00)'
        },
        {
            level: 'Culinary Legend',
            description: 'A true master of the kitchen',
            color: 'linear-gradient(135deg, #E91E63, #C2185B)'
        }
    ];

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/cooking-badges', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAvailableBadges(response.data);
            } catch (error) {
                console.error('Error fetching badges:', error);
            }
        };

        if (isOpen) {
            fetchProfile();
            fetchMyRecipes();
            fetchBadges();
        }
    }, [isOpen]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const decoded = jwtDecode(token);
            const username = decoded.username;

            const response = await axios.get(`http://localhost:5000/api/users/${username}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProfile(response.data);
            setStats({
                recipes_count: response.data.recipes_count || 0,
                followers_count: response.data.followers_count || 0,
                following_count: response.data.following_count || 0
            });

            if (response.data.profile_image) {
                setImagePreview(response.data.profile_image);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchMyRecipes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/my-recipes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Fetched recipes:', response.data);
            setMyRecipes(response.data);
        } catch (error) {
            console.error('Error fetching recipes:', error);
        }
    };

    const fetchSavedRecipes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/saved-recipes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedRecipes(response.data);
        } catch (error) {
            console.error('Error fetching saved recipes:', error);
        }
    };

    useEffect(() => {
        if (isOpen && activeTab === 'saved') {
            fetchSavedRecipes();
        }
    }, [isOpen, activeTab]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size too large. Please choose an image under 5MB.');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        // Create a preview immediately for better UX
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('profile_image', file);

            console.log('Uploading file:', file);

            const response = await axios.put(
                'http://localhost:5000/api/profile',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log('Upload response:', response.data);

            if (response.data.profile_image) {
                setImagePreview(response.data.profile_image);
                setProfile(prev => ({ ...prev, profile_image: response.data.profile_image }));
            } else {
                throw new Error('No profile image URL in response');
            }
        } catch (error) {
            console.error('Error uploading profile image:', error);
            // Revert preview if upload fails
            setImagePreview(profile.profile_image);
            alert('Failed to upload profile picture. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('username', profile.username);
            formData.append('bio', profile.bio);
            if (profile.profile_image) {
                formData.append('profile_image', profile.profile_image);
            }

            await axios.put('http://localhost:5000/api/profile', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setIsEditing(false);
            fetchProfile();
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleRecipeClick = (recipe) => {
        setSelectedRecipe(recipe);
    };

    const handleDeleteRecipe = async (recipeId, event) => {
        event.stopPropagation();
        if (window.confirm('chef, are you sure you want to delete this recipe?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/recipes/${recipeId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMyRecipes(myRecipes.filter(recipe => recipe.id !== recipeId));
                if (onRecipeDeleted) {
                    onRecipeDeleted();
                }
            } catch (error) {
                console.error('Error deleting recipe:', error);
            }
        }
    };

    const handleUnsaveRecipe = async (recipeId, event) => {
        event.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:5000/api/recipes/${recipeId}/save`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setSavedRecipes(savedRecipes.filter(recipe => recipe.id !== recipeId));
        } catch (error) {
            console.error('Error unsaving recipe:', error);
        }
    };

    const CookingBadge = ({ level }) => {
        const getBadgeColor = () => {
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

        return (
            <div 
                className="cooking-badge"
                style={{ background: getBadgeColor() }}
            >
                <FaAward />
                <span>{level}</span>
            </div>
        );
    };

    const handleRemoveProfilePicture = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete('http://localhost:5000/api/profile/image', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setImagePreview(null);
            setProfile(prev => ({ ...prev, profile_image: null }));
        } catch (error) {
            console.error('Error removing profile picture:', error);
        }
    };

    const handleRemoveBadge = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                'http://localhost:5000/api/profile',
                { remove_cooking_level: 'true' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProfile({ ...profile, cooking_level: null });
            setEditingBadge(false);
        } catch (error) {
            console.error('Error removing badge:', error);
        }
    };

    const handleBadgeUpdate = async (badge) => {
        try {
            const token = localStorage.getItem('token');
            console.log('Updating badge to:', badge); // Debug log

            const response = await axios.put(
                'http://localhost:5000/api/profile',
                { cooking_level: badge },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Badge update response:', response.data); // Debug log

            if (response.data.message === 'Profile updated successfully') {
                setProfile(prev => ({ ...prev, cooking_level: badge }));
                setEditingBadge(false);
            }
        } catch (error) {
            console.error('Error updating badge:', error.response?.data || error);
            alert('Failed to update badge. Please try again.');
        }
    };

    const getBadgeDescription = (badge) => {
        switch (badge) {
            case 'Kitchen Rookie':
                return "Just starting your culinary journey";
            case 'Sous Chef':
                return "Comfortable with various cooking techniques";
            case 'Master Chef':
                return "Expert in creating amazing dishes";
            case 'Culinary Legend':
                return "A true master of the culinary arts";
            default:
                return "";
        }
    };

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const decoded = jwtDecode(token);
            const username = decoded.username;

            const response = await axios.get(`http://localhost:5000/api/users/${username}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data);
            setStats({
                recipes_count: response.data.recipes_count || 0,
                followers_count: response.data.followers_count || 0,
                following_count: response.data.following_count || 0
            });
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    useEffect(() => {
        const handleProfileUpdate = () => {
            fetchUserProfile();
        };

        window.addEventListener('profileUpdated', handleProfileUpdate);
        return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
    }, []);

    const handleBadgeSelect = async (badge) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                'http://localhost:5000/api/profile',
                { cooking_level: badge },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProfile({ ...profile, cooking_level: badge });
            setEditingBadge(false);
        } catch (error) {
            console.error('Error updating badge:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="profile-overlay">
            <div className="profile-modal">
                <button className="close-profile-btn" onClick={onClose}>
                    <FaTimes />
                </button>
                
                <div className="profile-content">
                    <div className="profile-header">
                        <div 
                            className="profile-image-container"
                            onClick={() => document.getElementById('profile-image-input').click()}
                        >
                            {imagePreview ? (
                                <>
                                    <img 
                                        src={imagePreview} 
                                        alt="Profile" 
                                        className="profile-avatar"
                                    />
                                    <div 
                                        className="profile-image-actions"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button 
                                            className="image-action-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                document.getElementById('profile-image-input').click();
                                            }}
                                        >
                                            <FaCamera /> Change Photo
                                        </button>
                                        <button 
                                            className="image-action-btn remove"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveProfilePicture();
                                            }}
                                        >
                                            <FaTimes /> Remove Photo
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="default-profile">
                                        <FaUser className="default-profile-icon" />
                                    </div>
                                    <div className="upload-prompt">
                                        <FaUpload className="upload-icon" />
                                        <span className="upload-text">Click to upload profile picture</span>
                                    </div>
                                </>
                            )}
                            <input
                                id="profile-image-input"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden-input"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        <div className="profile-info">
                            <div className="profile-main-info">
                                <h2 className="profile-name">{profile.username}</h2>
                                {profile.cooking_level ? (
                                    <div 
                                        className="cooking-badge" 
                                        onClick={() => setEditingBadge(true)}
                                        style={{ 
                                            background: badgeOptions.find(b => b.level === profile.cooking_level)?.color 
                                        }}
                                    >
                                        <FaAward />
                                        <span>{profile.cooking_level}</span>
                                    </div>
                                ) : (
                                    <button 
                                        className="add-badge-btn"
                                        onClick={() => setEditingBadge(true)}
                                    >
                                        <FaAward />
                                        <span>Add Cooking Level</span>
                                    </button>
                                )}
                            </div>

                            <div className="profile-stats">
                                <div className="stat">
                                    <span className="stat-value">{stats.recipes_count}</span>
                                    <span className="stat-label">Posts</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{stats.followers_count}</span>
                                    <span className="stat-label">Followers</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{stats.following_count}</span>
                                    <span className="stat-label">Following</span>
                                </div>
                            </div>

                            <div className="profile-bio">
                                <p>{profile.bio || 'No bio yet'}</p>
                                {profile.website && (
                                    <a href={profile.website} target="_blank" rel="noopener noreferrer">
                                        <FaGlobe /> {profile.website}
                                    </a>
                                )}
                            </div>

                            <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                                <FaEdit /> Edit Profile
                            </button>
                        </div>
                    </div>

                    <div className="profile-tabs">
                        <button 
                            className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('posts')}
                        >
                            POSTS
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
                            onClick={() => setActiveTab('saved')}
                        >
                            SAVED
                        </button>
                    </div>

                    {activeTab === 'posts' ? (
                        <div className="recipes-grid">
                            {myRecipes.map((recipe) => (
                                <div 
                                    key={recipe.id} 
                                    className="recipe-post"
                                    onClick={() => handleRecipeClick(recipe)}
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
                                    <button 
                                        className="delete-recipe-btn"
                                        onClick={(e) => handleDeleteRecipe(recipe.id, e)}
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ))}
                            {myRecipes.length === 0 && (
                                <div className="no-recipes">
                                    You haven't posted any recipes yet
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="recipes-grid">
                            {savedRecipes.map((recipe) => (
                                <div 
                                    key={recipe.id} 
                                    className="recipe-post"
                                    onClick={() => handleRecipeClick(recipe)}
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
                                    <button 
                                        className="unsave-recipe-btn"
                                        onClick={(e) => handleUnsaveRecipe(recipe.id, e)}
                                    >
                                        <FaBookmark />
                                    </button>
                                </div>
                            ))}
                            {savedRecipes.length === 0 && (
                                <div className="no-recipes">
                                    No saved recipes yet
                                </div>
                            )}
                        </div>
                    )}

                    {selectedRecipe && (
                        <RecipeDetails 
                            recipe={selectedRecipe} 
                            onClose={() => setSelectedRecipe(null)} 
                        />
                    )}

                    {editingBadge && (
                        <div className="badge-selector-modal">
                            <div className="badge-selector-content">
                                <h3>Choose Your Cooking Level</h3>
                                <div className="badge-options">
                                    {badgeOptions.map((badge) => (
                                        <div
                                            key={badge.level}
                                            className={`badge-option ${badge.level.replace(' ', '-')} ${
                                                selectedBadge === badge.level ? 'selected' : ''
                                            }`}
                                            onClick={() => setSelectedBadge(badge.level)}
                                        >
                                            <FaAward 
                                                className="badge-icon"
                                                style={{ 
                                                    color: selectedBadge === badge.level ? '#e066ff' : '#9ca3af',
                                                    transform: selectedBadge === badge.level ? 'scale(1.1)' : 'scale(1)'
                                                }} 
                                            />
                                            <div>
                                                <h4>{badge.level}</h4>
                                                <p className="badge-description">{badge.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="badge-selector-actions">
                                    <button 
                                        className="badge-selector-btn cancel"
                                        onClick={() => {
                                            setEditingBadge(false);
                                            setSelectedBadge(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className="badge-selector-btn save"
                                        onClick={() => handleBadgeSelect(selectedBadge)}
                                        disabled={!selectedBadge}
                                    >
                                        Save Badge
                                    </button>
                                </div>
                                {profile.cooking_level && (
                                    <button 
                                        className="badge-remove-btn"
                                        onClick={handleRemoveBadge}
                                    >
                                        <FaTimes /> Remove Current Badge
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;
