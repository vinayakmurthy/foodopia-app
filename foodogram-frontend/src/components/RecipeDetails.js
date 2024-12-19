import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaTimes, FaHeart, FaRegHeart, FaComment, FaShare, FaClock, FaSmile, FaBookmark, FaPause, FaPlay, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import '../styles/RecipeDetails.css';
import axios from 'axios';
import { formatRelativeTime } from '../utils/dateUtils';

function RecipeDetails({ 
  recipe, 
  onClose, 
  onUpdate, 
  notificationCommentId
}) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(recipe?.initialTab === 'comments');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isReading, setIsReading] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState(window.speechSynthesis);
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const videoRef = useRef(null);
  const commentsRef = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translatedContent, setTranslatedContent] = useState(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioQueue, setAudioQueue] = useState([]);
  const [isPreloading, setIsPreloading] = useState(false);
  const audioQueueRef = useRef([]);
  const [progress, setProgress] = useState(0);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const languageOptions = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'ml', name: 'മലയാളം (Malayalam)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'es', name: 'Español (Spanish)' },
    { code: 'fr', name: 'Français (French)' },
    { code: 'de', name: 'Deutsch (German)' },
    { code: 'it', name: 'Italiano (Italian)' },
    { code: 'pt', name: 'Português (Portuguese)' },
    { code: 'ru', name: 'Русский (Russian)' },
    { code: 'ja', name: '日本語 (Japanese)' },
    { code: 'ko', name: '한국어 (Korean)' },
    { code: 'zh', name: '中文 (Chinese)' },
    { code: 'ar', name: 'العربية (Arabic)' }
  ];

  const fetchComments = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/recipes/${recipe.id}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [recipe?.id]);

  const checkLikeStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/recipes/${recipe.id}/like-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsLiked(response.data.liked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  }, [recipe?.id]);

  const checkSaveStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/recipes/${recipe.id}/save-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsSaved(response.data.saved);
    } catch (error) {
      console.error('Error checking save status:', error);
    }
  }, [recipe?.id]);

  useEffect(() => {
    if (!recipe) return;
    fetchComments();
    checkLikeStatus();
    checkSaveStatus();
    setLikeCount(recipe.likes || 0);
  }, [recipe, fetchComments, checkLikeStatus, checkSaveStatus]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showEmojiPicker && 
        !event.target.closest('.emoji-picker-container') && 
        !event.target.closest('.emoji-button')
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  useEffect(() => {
    if (notificationCommentId) {
      setShowComments(true);
      
      setTimeout(() => {
        const commentElement = document.getElementById(`comment-${notificationCommentId}`);
        if (commentElement && commentsRef.current) {
          // Scroll to comment
          commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Reset animation properly
          commentElement.classList.remove('highlighted');
          // Force a reflow
          void commentElement.offsetHeight;
          // Add highlight class again
          commentElement.classList.add('highlighted');
          
          // Remove highlight after animation
          setTimeout(() => {
            commentElement.classList.remove('highlighted');
          }, 3000);
        }
      }, 300);
    }
  }, [notificationCommentId]);

  useEffect(() => {
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, [speechSynthesis]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/recipes/${recipe.id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsLiked(response.data.liked);
      setLikeCount(response.data.likeCount);
      
      const likeButton = document.querySelector('.quick-action-btn.liked');
      if (likeButton) {
        likeButton.classList.add('like-animation');
        setTimeout(() => likeButton.classList.remove('like-animation'), 300);
      }

      if (onUpdate) {
        onUpdate({
          ...recipe,
          likes: response.data.likeCount,
          liked: response.data.liked
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/recipes/${recipe.id}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setComments(prev => [response.data.comment, ...prev]);
      setNewComment('');
      
      const commentForm = document.querySelector('.comment-form');
      commentForm.classList.add('success');
      setTimeout(() => commentForm.classList.remove('success'), 1000);
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEmojiClick = (emojiData) => {
    const comment = newComment;
    const text = comment.slice(0, cursorPosition) + emojiData.emoji + comment.slice(cursorPosition);
    setNewComment(text);
    const input = document.getElementById('comment-input');
    const newCursorPos = cursorPosition + emojiData.emoji.length;
    setCursorPosition(newCursorPos);
    
    // Focus back on input after emoji selection
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const handleInputClick = (e) => {
    setCursorPosition(e.target.selectionStart);
  };

  const handleInputChange = (e) => {
    setNewComment(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleSave = async () => {
    try {
      console.log('Attempting to save recipe:', recipe.id);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/recipes/${recipe.id}/save`,
        {},
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Save response:', response.data);
      setIsSaved(response.data.saved);
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  const handleVolumeChange = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const vol = (e.clientX - rect.left) / rect.width;
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const translateRecipe = async (language) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/translate',
        {
          text: [recipe.name, recipe.ingredients, recipe.instructions],
          targetLanguage: language
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setTranslatedContent({
        name: response.data.translations[0],
        ingredients: response.data.translations[1],
        instructions: response.data.translations[2]
      });
    } catch (error) {
      console.error('Translation error:', error);
    }
  };

  const splitIntoSmallerChunks = (text) => {
    const sentences = text.split(/[.!?।]/);
    const chunks = [];
    let currentChunk = [];
    let currentLength = 0;

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      // Aim for chunks of about 100-150 characters
      if (currentLength + trimmedSentence.length > 150) {
        chunks.push(currentChunk.join('. ') + '.');
        currentChunk = [trimmedSentence];
        currentLength = trimmedSentence.length;
      } else {
        currentChunk.push(trimmedSentence);
        currentLength += trimmedSentence.length;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join('. ') + '.');
    }

    return chunks;
  };

  const preloadAudio = async (text, languageCode) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios({
        method: 'post',
        url: 'http://localhost:5000/api/text-to-speech',
        data: { text, languageCode },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve) => {
        audio.addEventListener('canplaythrough', () => resolve({ audio, url: audioUrl }), { once: true });
        audio.load();
      });
    } catch (error) {
      console.error('Error preloading audio:', error);
      throw error;
    }
  };

  const readRecipe = async () => {
    try {
      if (isReading) {
        if (window.recipeAudio) {
          window.recipeAudio.pause();
          window.recipeAudio.removeEventListener('timeupdate', null);
          window.recipeAudio.removeEventListener('ended', null);
          window.recipeAudio.removeEventListener('error', null);
        }
        if (currentAudioUrl) {
          URL.revokeObjectURL(currentAudioUrl);
        }
        window.recipeAudio = null;
        setCurrentAudioUrl(null);
        setIsReading(false);
        setIsAudioLoading(false);
        setProgress(0);
        return;
      }

      if (window.recipeAudio) {
        window.recipeAudio.pause();
        window.recipeAudio.removeEventListener('timeupdate', null);
        window.recipeAudio.removeEventListener('ended', null);
        window.recipeAudio.removeEventListener('error', null);
      }
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }
      window.recipeAudio = null;
      setCurrentAudioUrl(null);

      setIsAudioLoading(true);
      setIsReading(true);
      setProgress(0);

      const content = translatedContent || recipe;
      const lang = selectedLanguage;

      const recipeText = `
        ${content.name}.
        
        Ingredients needed:
        ${content.ingredients.split('\n').map(i => i.trim()).join(', ')}.
        
        Instructions:
        ${content.instructions.split('\n').map((step, index) => `Step ${index + 1}: ${step.trim()}`).join('. ')}.
        
        Happy cooking!
      `;

      const token = localStorage.getItem('token');
      const response = await axios({
        method: 'post',
        url: 'http://localhost:5000/api/text-to-speech',
        data: { 
          text: recipeText,
          languageCode: lang 
        },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setCurrentAudioUrl(audioUrl);

      const audio = new Audio();
      
      const handleTimeUpdate = () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        setProgress(progress);
      };

      const handleEnded = () => {
        setIsReading(false);
        setIsAudioLoading(false);
        setProgress(0);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        URL.revokeObjectURL(audioUrl);
        window.recipeAudio = null;
        setCurrentAudioUrl(null);
      };

      const handleError = (error) => {
        console.error('Audio playback error:', error);
        setIsReading(false);
        setIsAudioLoading(false);
        setProgress(0);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        URL.revokeObjectURL(audioUrl);
        window.recipeAudio = null;
        setCurrentAudioUrl(null);
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      window.recipeAudio = audio;
      audio.src = audioUrl;
      
      setIsAudioLoading(false);
      await audio.play();

    } catch (error) {
      console.error('Error in readRecipe:', error);
      setIsReading(false);
      setIsAudioLoading(false);
      setProgress(0);
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }
      window.recipeAudio = null;
      setCurrentAudioUrl(null);
    }
  };

  useEffect(() => {
    if (selectedLanguage !== 'en') {
      translateRecipe(selectedLanguage);
    } else {
      setTranslatedContent(null);
    }
  }, [selectedLanguage]);

  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    loadVoices();
    
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (window.recipeAudio) {
        window.recipeAudio.pause();
        window.recipeAudio.removeEventListener('timeupdate', null);
        window.recipeAudio.removeEventListener('ended', null);
        window.recipeAudio.removeEventListener('error', null);
      }
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }
      window.recipeAudio = null;
      setCurrentAudioUrl(null);
      setIsReading(false);
      setIsAudioLoading(false);
      setProgress(0);
    };
  }, []);

  const handleClose = () => {
    if (window.recipeAudio) {
      window.recipeAudio.pause();
      window.recipeAudio.removeEventListener('timeupdate', null);
      window.recipeAudio.removeEventListener('ended', null);
      window.recipeAudio.removeEventListener('error', null);
    }
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
    }
    window.recipeAudio = null;
    setCurrentAudioUrl(null);
    setIsReading(false);
    setIsAudioLoading(false);
    setProgress(0);
    onClose();
  };

  useEffect(() => {
    const handleScroll = (e) => {
      const scrollTop = e.target.scrollTop;
      setIsHeaderVisible(scrollTop > 100);
    };

    const recipeInfo = document.querySelector('.recipe-info');
    if (recipeInfo) {
      recipeInfo.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (recipeInfo) {
        recipeInfo.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLanguages = languageOptions.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!recipe) return null;

  return (
    <div className="recipe-details-overlay" onClick={handleClose}>
      <div className={`recipe-details-modal ${isHeaderVisible ? 'floating-header-visible' : ''}`} onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={handleClose}>
          <FaTimes />
        </button>

        <div className="floating-header">
          <h2>{translatedContent ? translatedContent.name : recipe.name}</h2>
          <div className="floating-controls">
            <div className="language-selector-container" ref={dropdownRef}>
              <button 
                className="language-select-button"
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              >
                {languageOptions.find(lang => lang.code === selectedLanguage)?.name}
              </button>
              {isLanguageDropdownOpen && (
                <div className="language-dropdown">
                  <div className="language-search">
                    <input
                      type="text"
                      placeholder="Search language..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="language-options">
                    {filteredLanguages.map(lang => (
                      <button
                        key={lang.code}
                        className={`language-option ${selectedLanguage === lang.code ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          setIsLanguageDropdownOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        {lang.name}
                      </button>
                    ))}
                    {filteredLanguages.length === 0 && (
                      <div className="no-results">No languages found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="voice-control-wrapper">
              <button 
                className={`voice-assistant-btn ${isReading ? 'reading' : ''} ${isAudioLoading ? 'loading' : ''}`}
                onClick={readRecipe}
                disabled={isAudioLoading}
              >
                {isAudioLoading ? (
                  <div className="loading-spinner" />
                ) : (
                  isReading ? <FaVolumeMute /> : <FaVolumeUp />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="recipe-content">
          <div className="recipe-media">
            <div className="media-wrapper">
              {recipe.video_url ? (
                <div className="video-wrapper">
                  <video 
                    ref={videoRef}
                    src={recipe.video_url} 
                    poster={recipe.thumbnail_url}
                    className="recipe-media-item"
                    onClick={togglePlay}
                  />
                  <div className={`video-controls ${isPlaying ? 'playing' : ''}`}>
                    <button className="play-pause-btn" onClick={togglePlay}>
                      {isPlaying ? <FaPause /> : <FaPlay />}
                    </button>
                    <div className="video-progress" onClick={handleProgressClick}>
                      <div 
                        className="video-progress-filled" 
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>
                    <div className="video-time">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                    <div className="video-volume">
                      <button className="volume-btn" onClick={toggleMute}>
                        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                      </button>
                      <div className="volume-slider" onClick={handleVolumeChange}>
                        <div 
                          className="volume-filled" 
                          style={{ width: `${volume * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {isLoading && <div className="video-loading" />}
                </div>
              ) : (
                <img 
                  src={recipe.image_url || 'https://via.placeholder.com/400x300?text=Recipe'} 
                  alt={recipe.name}
                  className="recipe-media-item"
                />
              )}
            </div>
            
            <div className="recipe-actions-container">
              <div className="recipe-quick-actions">
                <button 
                  className={`quick-action-btn ${isLiked ? 'liked' : ''}`}
                  onClick={handleLike}
                >
                  {isLiked ? <FaHeart /> : <FaRegHeart />}
                  <span>{likeCount}</span>
                </button>
                <button 
                  className={`quick-action-btn ${showComments ? 'active' : ''}`}
                  onClick={() => setShowComments(!showComments)}
                >
                  <FaComment />
                  <span>{comments.length}</span>
                </button>
                <button className="quick-action-btn">
                  <FaShare />
                </button>
                <button 
                  className={`quick-action-btn ${isSaved ? 'saved' : ''}`}
                  onClick={handleSave}
                >
                  <FaBookmark />
                </button>
              </div>
            </div>
          </div>

          <div className="recipe-info">
            <div className="recipe-header">
              <div className="recipe-title-row">
                <h2>{translatedContent ? translatedContent.name : recipe.name}</h2>
                <div className="voice-controls">
                  <div className="language-selector-container" ref={dropdownRef}>
                    <button 
                      className="language-select-button"
                      onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    >
                      {languageOptions.find(lang => lang.code === selectedLanguage)?.name}
                    </button>
                    {isLanguageDropdownOpen && (
                      <div className="language-dropdown">
                        <div className="language-search">
                          <input
                            type="text"
                            placeholder="Search language..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="language-options">
                          {filteredLanguages.map(lang => (
                            <button
                              key={lang.code}
                              className={`language-option ${selectedLanguage === lang.code ? 'selected' : ''}`}
                              onClick={() => {
                                setSelectedLanguage(lang.code);
                                setIsLanguageDropdownOpen(false);
                                setSearchQuery('');
                              }}
                            >
                              {lang.name}
                            </button>
                          ))}
                          {filteredLanguages.length === 0 && (
                            <div className="no-results">No languages found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="voice-control-wrapper">
                    <button 
                      className={`voice-assistant-btn ${isReading ? 'reading' : ''} ${isAudioLoading ? 'loading' : ''}`}
                      onClick={readRecipe}
                      title={
                        isAudioLoading 
                          ? "Preparing audio..." 
                          : isReading 
                            ? "Stop reading" 
                            : "Read recipe aloud"
                      }
                      disabled={isAudioLoading}
                    >
                      {isAudioLoading ? (
                        <div className="loading-spinner" />
                      ) : (
                        isReading ? <FaVolumeMute /> : <FaVolumeUp />
                      )}
                    </button>
                    {isAudioLoading && (
                      <div className="loading-message">Preparing audio...</div>
                    )}
                    {(isReading || progress > 0) && (
                      <div className="audio-progress-bar">
                        <div 
                          className="audio-progress" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="recipe-meta">
                <div className="author-date">
                  <span className="recipe-author">by {recipe.author}</span>
                  <span className="recipe-date">
                    <FaClock /> {formatRelativeTime(recipe.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="recipe-tabs">
              <button 
                className={`tab-btn ${!showComments ? 'active' : ''}`}
                onClick={() => setShowComments(false)}
              >
                Recipe
              </button>
              <button 
                className={`tab-btn ${showComments ? 'active' : ''}`}
                onClick={() => setShowComments(true)}
              >
                Comments ({comments.length})
              </button>
            </div>

            {!showComments ? (
              <div className="recipe-details">
                <section className="recipe-section">
                  <h3>Ingredients</h3>
                  <ul className="ingredients-list">
                    {(translatedContent ? translatedContent.ingredients : recipe.ingredients)
                      .split('\n')
                      .map((ingredient, index) => (
                        <li key={index}>{ingredient.trim()}</li>
                      ))}
                  </ul>
                </section>

                <section className="recipe-section">
                  <h3>Instructions</h3>
                  <ol className="instructions-list">
                    {(translatedContent ? translatedContent.instructions : recipe.instructions)
                      .split('\n')
                      .map((step, index) => (
                        <li key={index}>{step.trim()}</li>
                      ))}
                  </ol>
                </section>
              </div>
            ) : (
              <div className="comments-section" ref={commentsRef}>
                <form onSubmit={handleCommentSubmit} className="comment-form">
                  <div className="comment-input-wrapper">
                    <textarea
                      id="comment-input"
                      value={newComment}
                      onChange={handleInputChange}
                      onClick={handleInputClick}
                      onKeyUp={(e) => setCursorPosition(e.target.selectionStart)}
                      placeholder="Share your thoughts about this recipe..."
                      rows="3"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="emoji-button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <FaSmile />
                    </button>
                  </div>
                  
                  {showEmojiPicker && (
                    <div className="emoji-picker-container">
                      <div className="emoji-picker-wrapper" onClick={e => e.stopPropagation()}>
                        <EmojiPicker
                          onEmojiClick={onEmojiClick}
                          autoFocusSearch={false}
                          theme="dark"
                          width={300}
                          height={400}
                          previewConfig={{
                            showPreview: false
                          }}
                          searchDisabled={false}
                          skinTonesDisabled
                          emojiStyle="native"
                        />
                      </div>
                    </div>
                  )}
                  
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !newComment.trim()}
                    className={isSubmitting ? 'submitting' : ''}
                  >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>

                <div className="comments-list">
                  {comments.map((comment) => (
                    <div 
                      key={comment.id}
                      id={`comment-${comment.id}`}
                      className="comment"
                    >
                      <div className="comment-header">
                        <span className="comment-author">{comment.username}</span>
                        <span className="comment-date">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="comment-content">{comment.content}</p>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <div className="no-comments">
                      Be the first to comment on this recipe!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetails;