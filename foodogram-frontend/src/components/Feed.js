// src/components/Feed.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/posts');
        setPosts(response.data);
      } catch (err) {
        console.error('Error fetching posts', err);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="feed">
      {posts.map((post) => (
        <div key={post.id} className="post">
          <h3>{post.recipeName}</h3>
          <img src={post.imageUrl} alt={post.recipeName} />
          <p>{post.description}</p>
          <div className="post-actions">
            <button>Like</button>
            <button>Comment</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Feed;
