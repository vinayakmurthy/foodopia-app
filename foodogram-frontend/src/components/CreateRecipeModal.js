import React, { useState } from 'react';
import { FaTimes, FaImage, FaVideo, FaFile, FaPlay } from 'react-icons/fa';
import axios from 'axios';
import '../styles/CreateRecipeModal.css';
import { useNavigate } from 'react-router-dom';

function CreateRecipeModal({ isOpen, onClose, onRecipeCreated }) {
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTab, setSelectedTab] = useState('image');
  const [recipeNameError, setRecipeNameError] = useState('');
  const [ingredientsError, setIngredientsError] = useState('');
  const [instructionsError, setInstructionsError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setRecipeNameError('');
    setIngredientsError('');
    setInstructionsError('');
    setError('');

    let hasError = false;

    if (!recipeName.trim()) {
      setRecipeNameError("Yo Chef, what's the name of your dish? 👨‍🍳");
      hasError = true;
    }

    if (!ingredients.trim()) {
      setIngredientsError("What's in the pot? List the ingredients! 🥘");
      hasError = true;
    }

    if (!instructions.trim()) {
      setInstructionsError("How do we cook this? Share the steps! 📝");
      hasError = true;
    }

    if (hasError) {
      setIsSubmitting(false);
      return;
    }

    const selectedFile = selectedTab === 'image' ? selectedPhoto : selectedVideo;
    if (!selectedFile) {
      setError('Add some food pics or video to make us hungry! 📸');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in again');
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('name', recipeName);
      formData.append('ingredients', ingredients);
      formData.append('instructions', instructions);
      formData.append('mediaType', selectedTab);
      formData.append('media', selectedFile);

      if (selectedTab === 'video' && videoPreview) {
        const response = await fetch(videoPreview);
        const thumbnailBlob = await response.blob();
        formData.append('thumbnail', thumbnailBlob, 'thumbnail.jpg');
      }

      const response = await axios.post(
        'http://localhost:5000/api/recipes',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.recipe) {
        resetForm();
        setError('');
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
          <div class="success-icon-container">
            <span class="chef-icon">👨‍🍳</span>
            <span class="knife-icon">🔪</span>
          </div>
          <div class="success-text">Hey Chef, your recipe has been submitted to Cook!</div>
        `;
        document.querySelector('.modal-content').prepend(successMessage);

        document.querySelector('form').classList.add('success');

        setTimeout(() => {
          document.querySelector('.modal-overlay').classList.add('fade-out');
          setTimeout(() => {
            onClose();
            if (onRecipeCreated) {
              onRecipeCreated(response.data.recipe);
            }
            navigate('/home');
          }, 300);
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating recipe:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setError('Session expired. Please log in again.');
      } else {
        setError(error.response?.data?.message || 'Failed to create recipe. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (selectedTab === 'image') {
      if (!isImage) {
        setError('Please select an image file 📸');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be under 5MB 🤔');
        return;
      }
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
      setSelectedVideo(null);
      setVideoPreview(null);
    } else {
      if (!isVideo) {
        setError('Please select a video file 🎥');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('Video must be under 50MB 🤔');
        return;
      }
      setSelectedVideo(file);
      try {
        const thumbnailBlob = await generateVideoThumbnail(file);
        const reader = new FileReader();
        reader.onload = (e) => setVideoPreview(e.target.result);
        reader.readAsDataURL(thumbnailBlob);
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        setError('Error generating video thumbnail');
      }
      setSelectedPhoto(null);
      setPhotoPreview(null);
    }
    setError('');
  };

  const generateVideoThumbnail = (videoFile) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      video.autoplay = false;
      video.muted = true;
      video.src = URL.createObjectURL(videoFile);

      // Wait for video metadata to load
      video.onloadedmetadata = () => {
        // Set video to 3rd second, or to the end if video is shorter than 3 seconds
        const targetTime = Math.min(3, video.duration);
        video.currentTime = targetTime;
      };

      // Handle the seeked event which fires when currentTime is updated
      video.onseeked = () => {
        // Set canvas size to match video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the video frame on canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(video.src);
          resolve(blob);
        }, 'image/jpeg', 0.7);
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Error loading video'));
      };
    });
  };

  const resetForm = () => {
    setRecipeName('');
    setIngredients('');
    setInstructions('');
    setSelectedPhoto(null);
    setSelectedVideo(null);
    setPhotoPreview(null);
    setVideoPreview(null);
    setError('');
    setSelectedTab('image');
    
    // Reset file input
    const fileInput = document.getElementById('media-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    setRecipeNameError('');
    setIngredientsError('');
    setInstructionsError('');
    setError('');
    onClose();
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <button className="close-button" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
          <div className="form-container">
            <div className="media-preview-section">
              {selectedTab === 'image' ? (
                selectedPhoto && photoPreview ? (
                  <div className="preview-wrapper">
                    <img src={photoPreview} alt="Preview" />
                    <div className="media-overlay">
                      <div className="media-actions">
                        <div 
                          className="action-icon"
                          onClick={() => document.getElementById('media-input').click()}
                          title="Change Photo"
                        >
                          <FaImage />
                          <span>Change</span>
                        </div>
                        <div 
                          className="action-icon"
                          onClick={() => {
                            setSelectedPhoto(null);
                            setPhotoPreview(null);
                            const fileInput = document.getElementById('media-input');
                            if (fileInput) fileInput.value = '';
                          }}
                          title="Remove"
                        >
                          <FaTimes />
                          <span>Remove</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder" onClick={() => document.getElementById('media-input').click()}>
                    <FaImage size={32} />
                    <p>Click to upload photo</p>
                  </div>
                )
              ) : (
                selectedVideo && videoPreview ? (
                  <div className="preview-wrapper">
                    <div className="video-thumbnail">
                      <img src={videoPreview} alt="Video thumbnail" />
                      <div className="play-indicator">
                        <FaPlay />
                      </div>
                    </div>
                    <div className="media-overlay">
                      <div className="media-actions">
                        <div 
                          className="action-icon"
                          onClick={() => document.getElementById('media-input').click()}
                          title="Change Video"
                        >
                          <FaVideo />
                          <span>Change</span>
                        </div>
                        <div 
                          className="action-icon"
                          onClick={() => {
                            setSelectedVideo(null);
                            setVideoPreview(null);
                            const fileInput = document.getElementById('media-input');
                            if (fileInput) fileInput.value = '';
                          }}
                          title="Remove"
                        >
                          <FaTimes />
                          <span>Remove</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder" onClick={() => document.getElementById('media-input').click()}>
                    <FaVideo size={32} />
                    <p>Click to upload video</p>
                  </div>
                )
              )}

              <div className="media-type-toggle">
                <button
                  type="button"
                  className={`toggle-btn ${selectedTab === 'image' ? 'active' : ''}`}
                  onClick={() => handleTabChange('image')}
                >
                  <FaImage /> Photo
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${selectedTab === 'video' ? 'active' : ''}`}
                  onClick={() => handleTabChange('video')}
                >
                  <FaVideo /> Video
                </button>
              </div>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type="file"
                  id="media-input"
                  onChange={handleFileSelect}
                  accept={selectedTab === 'image' ? 'image/*' : 'video/*'}
                  className="hidden"
                />
                
                <input
                  type="text"
                  value={recipeName}
                  onChange={(e) => {
                    setRecipeName(e.target.value);
                    setRecipeNameError('');
                  }}
                  placeholder="Recipe Name"
                  className={`modern-input ${recipeNameError ? 'error' : ''}`}
                />
                {recipeNameError && <div className="inline-error">{recipeNameError}</div>}
              </div>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <textarea
                  value={ingredients}
                  onChange={(e) => {
                    setIngredients(e.target.value);
                    setIngredientsError('');
                  }}
                  placeholder="Ingredients (eg. 1 cup of rice, 2 cups of water, etc.)"
                  className={`modern-textarea ${ingredientsError ? 'error' : ''}`}
                />
                {ingredientsError && <div className="inline-error">{ingredientsError}</div>}
              </div>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <textarea
                  value={instructions}
                  onChange={(e) => {
                    setInstructions(e.target.value);
                    setInstructionsError('');
                  }}
                  placeholder="Cooking Instructions"
                  className={`modern-textarea ${instructionsError ? 'error' : ''}`}
                />
                {instructionsError && <div className="inline-error">{instructionsError}</div>}
              </div>
            </div>
          </div>

          <div className="submit-btn-container">
            <button 
              type="submit" 
              className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Share Recipe'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRecipeModal; 