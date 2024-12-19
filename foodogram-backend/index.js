const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const cors = require('cors');
const verifyToken = require('./authMiddleware'); // Import the JWT middleware
const AWS = require('aws-sdk');
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('Received file:', file);
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const app = express();
const port = 80;

app.use(bodyParser.json());
app.use(cors({
  origin: 'http://51.20.74.171',  // Allow any domain to access
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
});

// At the top of your file, update the db connection
const db = mysql.createPool({
    host: '13.60.183.42',
    user: 'root',
    password: 'admin123',
    database: 'foodogram',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci'
});

// Create promise-based pool to use with async/await
const promisePool = db.promise();

// Test the connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MariaDB');
  connection.release();
});

// Serve static files from the frontend-build folder
app.use(express.static(path.join(__dirname, 'build')));

// Near the top of your file, add this for debugging
console.log('Environment variables:', {
    region: process.env.AWS_REGION,
    bucket: process.env.S3_BUCKET_NAME
});

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4'
});

const s3 = new AWS.S3();

const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');
const os = require('os');
const fs = require('fs');

// Add this function to generate thumbnail from video
const generateThumbnail = async (videoBuffer) => {
  const tempVideoPath = path.join(os.tmpdir(), `${uuidv4()}.mp4`);
  const tempThumbPath = path.join(os.tmpdir(), `${uuidv4()}.jpg`);
  
  await fs.promises.writeFile(tempVideoPath, videoBuffer);
  
  return new Promise((resolve, reject) => {
    ffmpeg(tempVideoPath)
      .screenshots({
        timestamps: ['1'],
        filename: path.basename(tempThumbPath),
        folder: path.dirname(tempThumbPath),
        size: '640x360'
      })
      .on('end', async () => {
        try {
          const thumbBuffer = await fs.promises.readFile(tempThumbPath);
          await fs.promises.unlink(tempVideoPath);
          await fs.promises.unlink(tempThumbPath);
          resolve(thumbBuffer);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

// Add this constant near the top of the file
const COOKING_BADGES = {
  KITCHEN_ROOKIE: 'Kitchen Rookie',
  SOUS_CHEF: 'Sous Chef',
  MASTER_CHEF: 'Master Chef',
  CULINARY_LEGEND: 'Culinary Legend'
};

// Signup Route
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;

    db.query(query, [username, email, hashedPassword], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Username or email already exists' });
            }
            return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({ message: 'User created successfully' });
    });
});

// Login Route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = `SELECT * FROM users WHERE email = ?`;

    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (results.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        // Create token with longer expiration (24 hours)
        const token = jwt.sign(
            { id: user.id, username: user.username }, 
            'SECRET_KEY', 
            { expiresIn: '24h' }
        );
        
        res.status(200).json({ 
            message: 'Login successful', 
            token,
            user: {
                id: user.id,
                username: user.username,
                profile_image: user.profile_image
            }
        });
    });
});

// Profile Route
app.get('/api/profile', verifyToken, async (req, res) => {
  const query = `
    SELECT 
      username, 
      email, 
      bio, 
      profile_image,
      location,
      specialties,
      social_links,
      favorite_cuisines,
      cooking_level,
      created_at as joined_date
    FROM users 
    WHERE id = ?
  `;
  
  db.query(query, [req.userId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = results[0];
    try {
      user.specialties = user.specialties ? JSON.parse(user.specialties) : [];
      user.social_links = user.social_links ? JSON.parse(user.social_links) : {
        instagram: '',
        twitter: '',
        website: ''
      };
      user.favorite_cuisines = user.favorite_cuisines ? JSON.parse(user.favorite_cuisines) : [];
      user.available_badges = Object.values(COOKING_BADGES);
      
      // Ensure profile_image is properly passed
      user.profile_image = user.profile_image || null;
    } catch (e) {
      console.error('Error parsing JSON fields:', e);
    }
    
    res.status(200).json(user);
  });
});

// Add a route to remove profile picture
app.delete('/api/profile/image', verifyToken, async (req, res) => {
  const query = `UPDATE users SET profile_image = NULL WHERE id = ?`;
  
  db.query(query, [req.userId], (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Error removing profile image' });
    }
    res.status(200).json({ message: 'Profile image removed successfully' });
  });
});

// Protected Route (Example)
app.get('/home', verifyToken, (req, res) => {
    res.status(200).json({ message: `Welcome to Foodogram, user ${req.userId}` });
});

// Create Recipe
app.post('/api/recipes', verifyToken, upload.fields([
  { name: 'media', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, ingredients, instructions, mediaType } = req.body;
    let mediaUrl, thumbnailUrl;

    // Upload media to S3
    if (req.files.media) {
      const mediaFile = req.files.media[0];
      const mediaKey = `recipes/${Date.now()}-${mediaFile.originalname.replace(/\s+/g, '-')}`;
      
      await s3.upload({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: mediaKey,
        Body: mediaFile.buffer,
        ContentType: mediaFile.mimetype
      }).promise();

      mediaUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${mediaKey}`;
    }

    // Upload thumbnail if provided
    if (req.files.thumbnail) {
      const thumbnailFile = req.files.thumbnail[0];
      const thumbnailKey = `thumbnails/${Date.now()}-thumbnail.jpg`;
      
      await s3.upload({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: thumbnailKey,
        Body: thumbnailFile.buffer,
        ContentType: 'image/jpeg'
      }).promise();

      thumbnailUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbnailKey}`;
    }

    // Insert into database
    const query = `
      INSERT INTO recipes (
        user_id, name, ingredients, instructions,
        image_url, video_url, thumbnail_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      req.userId,
      name,
      ingredients,
      instructions,
      mediaType === 'image' ? mediaUrl : null,
      mediaType === 'video' ? mediaUrl : null,
      thumbnailUrl
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Error creating recipe' });
      }

      res.status(201).json({
        message: 'Recipe created successfully',
        recipe: {
          id: result.insertId,
          name,
          ingredients,
          instructions,
          image_url: mediaType === 'image' ? mediaUrl : null,
          video_url: mediaType === 'video' ? mediaUrl : null,
          thumbnail_url: thumbnailUrl,
          user_id: req.userId
        }
      });
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ message: 'Error creating recipe' });
  }
});

// Get Recipes with user information
app.get('/api/recipes', verifyToken, (req, res) => {
    const query = `
        SELECT 
            r.*,
            u.username as author,
            u.profile_image as author_image,
            (SELECT COUNT(*) FROM recipe_likes WHERE recipe_id = r.id) as likes,
            (SELECT COUNT(*) FROM recipe_comments WHERE recipe_id = r.id) as comments
        FROM recipes r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching recipes:', err);
            return res.status(500).json({ message: 'Error fetching recipes' });
        }
        res.json(results);
    });
});

// Get user profile
app.get('/api/profile', verifyToken, async (req, res) => {
  const query = `SELECT username, email, bio, profile_image FROM users WHERE id = ?`;
  
  db.query(query, [req.userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    
    res.status(200).json(results[0]);
  });
});

// Update user profile
app.put('/api/profile', verifyToken, upload.single('profile_image'), async (req, res) => {
  try {
    let imageUrl = null;
    const updateFields = [];
    const values = [];

    // Handle profile image upload
    if (req.file) {
      console.log('Processing file upload...');
      const file = req.file;
      
      // Generate a unique filename
      const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
      
      // Configure S3 upload parameters without ACL
      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `profiles/${filename}`,
        Body: file.buffer,
        ContentType: file.mimetype
      };

      try {
        console.log('S3 upload params:', {
          bucket: s3Params.Bucket,
          key: s3Params.Key,
          contentType: s3Params.ContentType
        });

        const s3Upload = await s3.upload(s3Params).promise();
        imageUrl = s3Upload.Location;
        console.log('S3 upload successful:', imageUrl);
      } catch (s3Error) {
        console.error('Detailed S3 error:', {
          code: s3Error.code,
          message: s3Error.message,
          statusCode: s3Error.statusCode,
          requestId: s3Error.requestId
        });
        return res.status(500).json({ 
          message: 'Error uploading to S3',
          error: s3Error.message,
          details: s3Error.code
        });
      }
    }

    // Handle cooking level update
    if (req.body.cooking_level) {
      // Validate cooking level
      const validBadges = Object.values(COOKING_BADGES);
      if (!validBadges.includes(req.body.cooking_level)) {
        return res.status(400).json({ 
          message: 'Invalid cooking level badge',
          validBadges: validBadges 
        });
      }
      updateFields.push('cooking_level = ?');
      values.push(req.body.cooking_level);
    }

    // Handle cooking level removal
    if (req.body.remove_cooking_level === 'true') {
      updateFields.push('cooking_level = NULL');
    }

    // Handle other profile fields
    if (req.body.username) {
      updateFields.push('username = ?');
      values.push(req.body.username);
    }

    if (req.body.bio) {
      updateFields.push('bio = ?');
      values.push(req.body.bio);
    }

    if (imageUrl) {
      updateFields.push('profile_image = ?');
      values.push(imageUrl);
    }

    // Only proceed if there are fields to update
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(req.userId);

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `;

    db.query(query, values, (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Error updating profile' });
      }

      res.status(200).json({ 
        message: 'Profile updated successfully',
        profile_image: imageUrl,
        cooking_level: req.body.cooking_level 
      });
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get user's recipes
app.get('/api/my-recipes', verifyToken, (req, res) => {
  const query = `
    SELECT 
      r.*,
      u.username as author,
      (SELECT COUNT(*) FROM recipe_likes WHERE recipe_id = r.id) as likes,
      (SELECT COUNT(*) FROM recipe_comments WHERE recipe_id = r.id) as comments
    FROM recipes r
    JOIN users u ON r.user_id = u.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `;

  db.query(query, [req.userId], (err, results) => {
    if (err) {
      console.error('Error fetching user recipes:', err);
      return res.status(500).json({ message: 'Error fetching recipes' });
    }
    console.log('User recipes fetched:', results.length);
    res.json(results);
  });
});

// Get user stats
app.get('/api/user-stats', verifyToken, async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM recipes WHERE user_id = ?) as totalRecipes,
        (SELECT SUM(likes) FROM recipes WHERE user_id = ?) as totalLikes,
        (SELECT COUNT(*) FROM followers WHERE followed_id = ?) as followers,
        (SELECT COUNT(*) FROM followers WHERE follower_id = ?) as following
    `;

    db.query(statsQuery, [req.userId, req.userId, req.userId, req.userId], (err, results) => {
      if (err) {
        console.error('Error fetching user stats:', err);
        return res.status(500).json({ message: 'Error fetching user stats' });
      }

      const stats = {
        totalRecipes: results[0].totalRecipes || 0,
        totalLikes: results[0].totalLikes || 0,
        followers: results[0].followers || 0,
        following: results[0].following || 0
      };

      res.json(stats);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete recipe endpoint
app.delete('/api/recipes/:id', verifyToken, async (req, res) => {
  try {
    const query = `
      DELETE FROM recipes 
      WHERE id = ? AND user_id = ?
    `;
    
    db.query(query, [req.params.id, req.userId], (err, result) => {
      if (err) {
        console.error('Error deleting recipe:', err);
        return res.status(500).json({ message: 'Error deleting recipe' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Recipe not found or unauthorized' });
      }
      
      res.json({ message: 'Recipe deleted successfully' });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike recipe
app.post('/api/recipes/:id/like', verifyToken, (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.userId;

    // Check if already liked
    const checkQuery = 'SELECT * FROM recipe_likes WHERE recipe_id = ? AND user_id = ?';
    db.query(checkQuery, [recipeId, userId], (err, results) => {
      if (err) {
        console.error('Error checking like status:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (results.length > 0) {
        // Unlike
        const deleteQuery = 'DELETE FROM recipe_likes WHERE recipe_id = ? AND user_id = ?';
        db.query(deleteQuery, [recipeId, userId], (err) => {
          if (err) {
            console.error('Error unliking recipe:', err);
            return res.status(500).json({ message: 'Server error' });
          }

          // Get updated count
          const countQuery = 'SELECT COUNT(*) as count FROM recipe_likes WHERE recipe_id = ?';
          db.query(countQuery, [recipeId], (err, countResults) => {
            if (err) {
              console.error('Error getting like count:', err);
              return res.status(500).json({ message: 'Server error' });
            }

            const likeCount = countResults[0].count;
            
            // Update recipes table
            const updateQuery = 'UPDATE recipes SET likes = ? WHERE id = ?';
            db.query(updateQuery, [likeCount, recipeId], (err) => {
              if (err) {
                console.error('Error updating recipe likes:', err);
                return res.status(500).json({ message: 'Server error' });
              }

              res.json({ 
                message: 'Recipe unliked',
                liked: false,
                likeCount 
              });
            });
          });
        });
      } else {
        // Like
        const insertQuery = 'INSERT INTO recipe_likes (recipe_id, user_id) VALUES (?, ?)';
        db.query(insertQuery, [recipeId, userId], (err) => {
          if (err) {
            console.error('Error liking recipe:', err);
            return res.status(500).json({ message: 'Server error' });
          }

          // Get updated count
          const countQuery = 'SELECT COUNT(*) as count FROM recipe_likes WHERE recipe_id = ?';
          db.query(countQuery, [recipeId], (err, countResults) => {
            if (err) {
              console.error('Error getting like count:', err);
              return res.status(500).json({ message: 'Server error' });
            }

            const likeCount = countResults[0].count;
            
            // Update recipes table
            const updateQuery = 'UPDATE recipes SET likes = ? WHERE id = ?';
            db.query(updateQuery, [likeCount, recipeId], (err) => {
              if (err) {
                console.error('Error updating recipe likes:', err);
                return res.status(500).json({ message: 'Server error' });
              }

              // Create notification
              const notifQuery = `
                INSERT INTO notifications (to_user_id, from_user_id, recipe_id, type, message)
                SELECT 
                  r.user_id,
                  ?,
                  r.id,
                  'like',
                  CONCAT(?, ' liked your recipe "', r.name, '"')
                FROM recipes r
                WHERE r.id = ? AND r.user_id != ?
              `;
              
              db.query(notifQuery, [userId, req.username, recipeId, userId]);

              res.json({ 
                message: 'Recipe liked',
                liked: true,
                likeCount 
              });
            });
          });
        });
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to recipe
app.post('/api/recipes/:id/comments', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    
    // Get recipe details first
    const [[recipe]] = await promisePool.query(
      'SELECT user_id, name FROM recipes WHERE id = ?',
      [req.params.id]
    );

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Get commenter's username
    const [[user]] = await promisePool.query(
      'SELECT username FROM users WHERE id = ?',
      [req.userId]
    );

    // Insert comment
    const [result] = await promisePool.query(
      `INSERT INTO recipe_comments (recipe_id, user_id, content) 
       VALUES (?, ?, ?)`,
      [req.params.id, req.userId, content]
    );

    // Create notification for recipe owner (if it's not their own recipe)
    if (recipe.user_id !== req.userId) {
      await promisePool.query(
        `INSERT INTO notifications 
         (to_user_id, from_user_id, recipe_id, type, message) 
         VALUES (?, ?, ?, 'comment', ?)`,
        [
          recipe.user_id,
          req.userId,
          req.params.id,
          `${user.username} commented on your recipe "${recipe.name}" 💬`
        ]
      );
    }

    // Get the newly created comment with username
    const [[comment]] = await promisePool.query(
      `SELECT 
        c.*, 
        u.username 
       FROM recipe_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.json({ 
      message: 'Comment added successfully',
      comment
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// Get notifications
app.get('/api/notifications', verifyToken, (req, res) => {
  const query = `
    SELECT 
      n.*,
      u.username as from_username,
      u.profile_image as from_user_image,
      CASE 
        WHEN n.type IN ('like', 'comment') THEN r.name 
        WHEN n.type = 'follow' THEN NULL
      END as recipe_name
    FROM notifications n
    JOIN users u ON n.from_user_id = u.id
    LEFT JOIN recipes r ON n.recipe_id = r.id AND n.type IN ('like', 'comment')
    WHERE n.to_user_id = ?
    ORDER BY n.created_at DESC
  `;

  db.query(query, [req.userId], (err, results) => {
    if (err) {
      console.error('Error fetching notifications:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(results);
  });
});

// Mark notification as read
app.put('/api/notifications/:id/read', verifyToken, (req, res) => {
  const query = `
    UPDATE notifications 
    SET is_read = 1 
    WHERE id = ? AND to_user_id = ?
  `;
  
  db.query(query, [req.params.id, req.userId], (err, result) => {
    if (err) {
      console.error('Error marking notification as read:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json({ message: 'Notification marked as read' });
  });
});

// Mark all notifications as read
app.put('/api/notifications/read-all', verifyToken, (req, res) => {
  const query = `
    UPDATE notifications 
    SET is_read = true 
    WHERE to_user_id = ?
  `;

  db.query(query, [req.userId], (err, result) => {
    if (err) {
      console.error('Error marking all notifications as read:', err);
      return res.status(500).json({ message: 'Error updating notifications' });
    }
    res.json({ message: 'All notifications marked as read' });
  });
});

// Get unread notification count
app.get('/api/notifications/unread-count', verifyToken, (req, res) => {
  const query = `
    SELECT COUNT(*) as count 
    FROM notifications 
    WHERE to_user_id = ? AND is_read = false
  `;

  db.query(query, [req.userId], (err, results) => {
    if (err) {
      console.error('Error getting unread count:', err);
      return res.status(500).json({ message: 'Error fetching notification count' });
    }
    res.json({ count: results[0].count });
  });
});

// Get recipe by share link
app.get('/api/recipes/share/:id', async (req, res) => {
  try {
    const query = `
      SELECT r.*, u.username as author
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `;
    
    db.query(query, [req.params.id], (err, results) => {
      if (err) throw err;
      if (results.length === 0) {
        return res.status(404).json({ message: 'Recipe not found' });
      }
      res.json(results[0]);
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for a recipe
app.get('/api/recipes/:id/comments', verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        c.*,
        u.username
      FROM recipe_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.recipe_id = ?
      ORDER BY c.created_at DESC
    `;
    
    db.query(query, [req.params.id], (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get like status for a recipe
app.get('/api/recipes/:id/like-status', verifyToken, async (req, res) => {
  try {
    const query = 'SELECT * FROM recipe_likes WHERE recipe_id = ? AND user_id = ?';
    db.query(query, [req.params.id, req.userId], (err, results) => {
      if (err) throw err;
      res.json({ liked: results.length > 0 });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save/Unsave recipe
app.post('/api/recipes/:id/save', verifyToken, (req, res) => {
  console.log('Save endpoint hit:', {
    recipeId: req.params.id,
    userId: req.userId
  });
  try {
    const recipeId = req.params.id;
    const userId = req.userId;

    // Check if already saved
    const checkQuery = 'SELECT * FROM saved_recipes WHERE recipe_id = ? AND user_id = ?';
    db.query(checkQuery, [recipeId, userId], (err, results) => {
      if (err) {
        console.error('Error checking save status:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (results.length > 0) {
        // Recipe is already saved, so unsave it
        const deleteQuery = 'DELETE FROM saved_recipes WHERE recipe_id = ? AND user_id = ?';
        db.query(deleteQuery, [recipeId, userId], (err) => {
          if (err) {
            console.error('Error unsaving recipe:', err);
            return res.status(500).json({ message: 'Error unsaving recipe' });
          }
          res.json({ saved: false });
        });
      } else {
        // Recipe is not saved, so save it
        const insertQuery = 'INSERT INTO saved_recipes (recipe_id, user_id) VALUES (?, ?)';
        db.query(insertQuery, [recipeId, userId], (err) => {
          if (err) {
            console.error('Error saving recipe:', err);
            return res.status(500).json({ message: 'Error saving recipe' });
          }
          res.json({ saved: true });
        });
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get save status
app.get('/api/recipes/:id/save-status', verifyToken, (req, res) => {
  const query = 'SELECT * FROM saved_recipes WHERE recipe_id = ? AND user_id = ?';
  db.query(query, [req.params.id, req.userId], (err, results) => {
    if (err) {
      console.error('Error checking save status:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json({ saved: results.length > 0 });
  });
});

// Get saved recipes
app.get('/api/saved-recipes', verifyToken, (req, res) => {
  const query = `
    SELECT r.*, u.username as author 
    FROM recipes r
    JOIN saved_recipes sr ON r.id = sr.recipe_id
    JOIN users u ON r.user_id = u.id
    WHERE sr.user_id = ?
    ORDER BY sr.created_at DESC
  `;
  
  db.query(query, [req.userId], (err, results) => {
    if (err) {
      console.error('Error fetching saved recipes:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(results);
  });
});

// Refresh Token endpoint
app.post('/api/refresh-token', async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Verify the old token, ignoring expiration
        const decoded = jwt.verify(token, 'SECRET_KEY', { ignoreExpiration: true });
        
        // Create a new token
        const newToken = jwt.sign(
            { id: decoded.id, username: decoded.username },
            'SECRET_KEY',
            { expiresIn: '24h' }
        );
        
        res.json({ token: newToken });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Add this to serve static files 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add this endpoint to get available badges
app.get('/api/cooking-badges', verifyToken, (req, res) => {
  res.json(Object.values(COOKING_BADGES));
});

// Get user profile by username (for public viewing)
app.get('/api/users/:username', verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.username,
        u.bio,
        u.profile_image,
        u.location,
        u.specialties,
        u.social_links,
        u.favorite_cuisines,
        u.cooking_level,
        u.created_at as joined_date,
        (SELECT COUNT(*) FROM user_follows WHERE following_id = u.id) as followers_count,
        (SELECT COUNT(*) FROM user_follows WHERE follower_id = u.id) as following_count,
        (SELECT COUNT(*) FROM recipes WHERE user_id = u.id) as recipes_count,
        EXISTS(SELECT 1 FROM user_follows WHERE follower_id = ? AND following_id = u.id) as is_following
      FROM users u
      WHERE u.username = ?
    `;

    db.query(query, [req.userId, req.params.username], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = results[0];
      try {
        user.specialties = user.specialties ? JSON.parse(user.specialties) : [];
        user.social_links = user.social_links ? JSON.parse(user.social_links) : {};
        user.favorite_cuisines = user.favorite_cuisines ? JSON.parse(user.favorite_cuisines) : [];
      } catch (e) {
        console.error('Error parsing JSON fields:', e);
      }

      res.json(user);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow a user
app.post('/api/users/:username/follow', verifyToken, async (req, res) => {
  try {
    // First check if the user exists and get their ID
    const getUserQuery = 'SELECT id FROM users WHERE username = ?';
    const [[targetUser]] = await promisePool.query(getUserQuery, [req.params.username]);
    
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const targetUserId = targetUser.id;
    
    if (targetUserId === req.userId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if already following
    const [[existingFollow]] = await promisePool.query(
      'SELECT 1 FROM user_follows WHERE follower_id = ? AND following_id = ?',
      [req.userId, targetUserId]
    );

    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Get follower's username for notification
    const [[follower]] = await promisePool.query(
      'SELECT username FROM users WHERE id = ?',
      [req.userId]
    );

    // Add follow relationship
    await promisePool.query(
      'INSERT INTO user_follows (follower_id, following_id) VALUES (?, ?)',
      [req.userId, targetUserId]
    );

    // Create notification with emoji
    const notificationMessage = `${follower.username} started following you! 🎉`;
    await promisePool.query(
      `INSERT INTO notifications 
       (to_user_id, from_user_id, type, message, recipe_id) 
       VALUES (?, ?, 'follow', ?, NULL)`,
      [targetUserId, req.userId, notificationMessage]
    );

    // Send success response
    res.json({ 
      message: 'Successfully followed user',
      notification: {
        type: 'follow',
        message: notificationMessage,
        from_username: follower.username
      }
    });

  } catch (error) {
    console.error('Server error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Already following this user' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Unfollow a user
app.delete('/api/users/:username/follow', verifyToken, async (req, res) => {
  try {
    // First check if the user exists
    const [[targetUser]] = await promisePool.query(
      'SELECT id FROM users WHERE username = ?',
      [req.params.username]
    );

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove follow relationship
    const [result] = await promisePool.query(
      'DELETE FROM user_follows WHERE follower_id = ? AND following_id = ?',
      [req.userId, targetUser.id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    res.json({ message: 'Successfully unfollowed user' });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this endpoint to get user's recipes
app.get('/api/recipes/user/:username', verifyToken, (req, res) => {
  const query = `
    SELECT r.*, 
           u.username as author,
           u.profile_image as author_image,
           (SELECT COUNT(*) FROM recipe_likes WHERE recipe_id = r.id) as likes,
           (SELECT COUNT(*) FROM recipe_comments WHERE recipe_id = r.id) as comments
    FROM recipes r
    JOIN users u ON r.user_id = u.id
    WHERE u.username = ?
    ORDER BY r.created_at DESC
  `;

  db.query(query, [req.params.username], (err, results) => {
    if (err) {
      console.error('Error fetching user recipes:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(results);
  });
});

// Update the upload endpoint to handle video thumbnails
app.post('/upload-recipe', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    let imageUrl = null;
    let videoUrl = null;
    let thumbnailUrl = null;

    if (file) {
      const isVideo = file.mimetype.startsWith('video/');
      const fileKey = `${uuidv4()}${path.extname(file.originalname)}`;
      
      // Upload original file
      await s3.upload({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype
      }).promise();

      // Generate and upload thumbnail if it's a video
      if (isVideo) {
        videoUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
        
        const thumbnailBuffer = await generateThumbnail(file.buffer);
        const thumbnailKey = `thumb_${uuidv4()}.jpg`;
        
        await s3.upload({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: thumbnailKey,
          Body: thumbnailBuffer,
          ContentType: 'image/jpeg'
        }).promise();

        thumbnailUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbnailKey}`;
      } else {
        imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
      }
    }

    // Insert recipe into database
    const query = `
      INSERT INTO recipes (user_id, name, ingredients, instructions, image_url, video_url, thumbnail_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      req.userId,
      req.body.name,
      req.body.ingredients,
      req.body.instructions,
      imageUrl,
      videoUrl,
      thumbnailUrl
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Error saving recipe' });
      }
      res.json({ message: 'Recipe uploaded successfully', recipeId: result.insertId });
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading recipe' });
  }
});

// Add this near your other imports
const { Translate } = require('@google-cloud/translate').v2;

// Initialize the translation client with error handling
let translate;
try {
  translate = new Translate({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
  });
} catch (error) {
  console.error('Error initializing Google Translate:', error);
}

// Update the translation endpoint with better error handling
app.post('/api/translate', verifyToken, async (req, res) => {
  try {
    if (!translate) {
      throw new Error('Translation service not initialized');
    }

    const { text, targetLanguage } = req.body;

    if (!Array.isArray(text)) {
      return res.status(400).json({ error: 'Text must be an array' });
    }

    if (!targetLanguage) {
      return res.status(400).json({ error: 'Target language is required' });
    }

    console.log('Translating to:', targetLanguage);
    console.log('Text to translate:', text);

    const translations = await Promise.all(
      text.map(async (item) => {
        if (!item) return '';
        try {
          const [translation] = await translate.translate(item, targetLanguage);
          return translation;
        } catch (error) {
          console.error('Error translating item:', error);
          return item; // Return original text if translation fails
        }
      })
    );

    console.log('Translations:', translations);
    res.json({ translations });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ 
      error: 'Translation failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

const textToSpeech = require('@google-cloud/text-to-speech');

// Initialize Text-to-Speech client
const ttsClient = new textToSpeech.TextToSpeechClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

// Update the text chunking function to be more robust
const splitTextIntoChunks = (text, maxBytes = 4800) => { // Using 4800 to have some buffer
  const chunks = [];
  let currentChunk = '';
  
  // Split by sentences while respecting different sentence endings
  const sentences = text.split(/([.!?।\n])/);
  
  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i];
    const delimiter = sentences[i + 1] || '';
    
    if (!sentence.trim()) continue;
    
    const nextPiece = sentence + delimiter;
    const proposedChunk = currentChunk + nextPiece;
    
    if (Buffer.byteLength(proposedChunk, 'utf8') > maxBytes) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = nextPiece;
      } else {
        // If a single sentence is too long, split by words
        const words = nextPiece.split(' ');
        let wordChunk = '';
        
        for (const word of words) {
          const proposedWordChunk = wordChunk + ' ' + word;
          if (Buffer.byteLength(proposedWordChunk, 'utf8') > maxBytes) {
            if (wordChunk) chunks.push(wordChunk.trim());
            wordChunk = word;
          } else {
            wordChunk = proposedWordChunk;
          }
        }
        if (wordChunk) currentChunk = wordChunk;
      }
    } else {
      currentChunk = proposedChunk;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
};

// Add this voice configuration at the top with other constants
const voiceConfig = {
  'en': { languageCode: 'en-US', name: 'en-US-Standard-C' },
  'hi': { languageCode: 'hi-IN', name: 'hi-IN-Standard-A' },
  'kn': { languageCode: 'kn-IN', name: 'kn-IN-Standard-A' },
  'ta': { languageCode: 'ta-IN', name: 'ta-IN-Standard-A' },
  'te': { languageCode: 'te-IN', name: 'te-IN-Standard-A' }
};

// Update the text-to-speech configuration
app.post('/api/text-to-speech', verifyToken, async (req, res) => {
  try {
    const { text, languageCode } = req.body;

    if (!text || !languageCode) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const voice = voiceConfig[languageCode] || voiceConfig['en'];
    
    // Split text into chunks
    const textChunks = splitTextIntoChunks(text);
    
    // Process each chunk and get audio
    const audioContents = await Promise.all(
      textChunks.map(async (chunk) => {
        const request = {
          input: { text: chunk },
          voice: voice,
          audioConfig: { 
            audioEncoding: 'MP3',
            speakingRate: 1.0,
            pitch: 0,
            sampleRateHertz: 16000
          }
        };

        const [response] = await ttsClient.synthesizeSpeech(request);
        return response.audioContent;
      })
    );

    // Combine all audio chunks
    const combinedAudio = Buffer.concat(audioContents);
    
    res.set('Content-Type', 'audio/mpeg');
    res.send(combinedAudio);

  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ 
      error: 'Text-to-speech failed',
      details: error.message 
    });
  }
});

// Add this near the top of your file
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
