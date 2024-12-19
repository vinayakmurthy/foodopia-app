// src/components/CreateRecipe.js
import React, { useState } from 'react';
import axios from 'axios';

const CreateRecipe = () => {
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recipeName || !ingredients || !instructions) {
      setError('Please fill in all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('recipeName', recipeName);
    formData.append('ingredients', ingredients);
    formData.append('instructions', instructions);
    if (image) formData.append('image', image);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/upload-recipe', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // After successful upload, reset form and add more functionality
      setRecipeName('');
      setIngredients('');
      setInstructions('');
      setImage(null);
      alert('Recipe added successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload recipe');
    }
  };

  return (
    <div className="create-recipe">
      <h2>Upload Recipe</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Recipe Name"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
        />
        <textarea
          placeholder="Ingredients"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        <textarea
          placeholder="Instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button type="submit">Submit Recipe</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default CreateRecipe;
