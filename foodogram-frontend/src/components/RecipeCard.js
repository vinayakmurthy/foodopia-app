import React from 'react';
import { FaHeart, FaComment, FaShare, FaUser, FaPlay } from 'react-icons/fa';
import '../styles/RecipeCard.css';

function RecipeCard({ recipe, onRecipeClick }) {
    const { 
        title, 
        image_url, 
        description, 
        likes, 
        comments,
        author,          // username
        author_image     // profile picture URL
    } = recipe;

    return (
        <div className="recipe-card" onClick={() => onRecipeClick(recipe)}>
            <div className="recipe-author">
                <div className="author-avatar">
                    {author_image ? (
                        <img 
                            src={author_image} 
                            alt={author} 
                            className="author-image"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'default-avatar.png';
                            }}
                        />
                    ) : (
                        <div className="default-avatar">
                            <FaUser />
                        </div>
                    )}
                </div>
                <span className="author-name">{author || 'Anonymous User'}</span>
            </div>

            <div className="recipe-image" onClick={handleViewRecipe}>
                {recipe.video_url ? (
                    <img 
                        src={recipe.thumbnail_url || recipe.image_url} 
                        alt={recipe.name}
                        className="recipe-thumbnail"
                    />
                ) : (
                    <img 
                        src={recipe.image_url} 
                        alt={recipe.name}
                        className="recipe-thumbnail"
                    />
                )}
                {recipe.video_url && (
                    <div className="video-indicator">
                        <FaPlay />
                    </div>
                )}
            </div>

            <div className="recipe-content">
                <h3 className="recipe-title">{title}</h3>
                <p className="recipe-description">{description}</p>
                
                <div className="recipe-stats">
                    <div className="stat-item">
                        <FaHeart className="stat-icon" />
                        <span>{likes || 0}</span>
                    </div>
                    <div className="stat-item">
                        <FaComment className="stat-icon" />
                        <span>{comments || 0}</span>
                    </div>
                    <div className="stat-item">
                        <FaShare className="stat-icon" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecipeCard; 