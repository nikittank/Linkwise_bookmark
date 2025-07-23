require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const jwt = require('jsonwebtoken');
const https = require('https');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('../database');

// Initialize Gemini AI with hardcoded key for testing
// This is a temporary fix - in production, always use environment variables
const apiKey = 'AIzaSyDLAxAGVT9WTCAXo-ntiwo4sshGc4g_3bg'; // Using the key that works with curl
console.log('Using Gemini API Key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'undefined');
const genAI = new GoogleGenerativeAI(apiKey);

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Fetch metadata from URL
const fetchMetadata = async (url) => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title
    let title = $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      'Untitled';

    title = title.trim();

    // Extract favicon
    let favicon = $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      '/favicon.ico';

    // Make favicon absolute URL
    if (favicon && !favicon.startsWith('http')) {
      const urlObj = new URL(url);
      favicon = favicon.startsWith('/') ?
        `${urlObj.protocol}//${urlObj.host}${favicon}` :
        `${urlObj.protocol}//${urlObj.host}/${favicon}`;
    }

    return { title, favicon };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return {
      title: new URL(url).hostname,
      favicon: null
    };
  }
};

// Get summary using Gemini AI directly integrated
const getSummary = async (url) => {
  try {
    // First, get the content from Jina AI reader
    const target = encodeURIComponent(url);
    const jinaOptions = {
      hostname: 'r.jina.ai',
      path: `/${target}`,
      headers: {
        'Accept': 'text/plain',
        'Authorization': 'Bearer jina_fcfec48502aa462ba77136fd0f81d34eu3GQxGSR9EkFjs4p0afhun_56fd4',
        'X-Return-Format': 'text'
      }
    };

    const content = await new Promise((resolve) => {
      https.get(jinaOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve(data));
      }).on('error', () => resolve(''));
    });

    if (!content || content.length < 50) {
      return 'Content could not be extracted for summarization.';
    }

    // Clean the content before sending to Gemini
    const cleanedContent = content
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .substring(0, 8000); // Limit content length for Gemini

    // Use Gemini AI directly for summarization
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Summarize the following content in a concise, clear, and well-structured way. Focus on the main points and key information. Make it readable and informative:\n\n${cleanedContent}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Clean and format the Gemini response
    let summary = response
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/\n{3,}/g, '\n\n') // Limit line breaks
      .trim();

    return summary || 'Summary could not be generated.';

  } catch (error) {
    console.error('Error getting summary:', error);
    
    // More detailed error logging for Gemini API issues
    if (error.name === 'GoogleGenerativeAIFetchError') {
      console.error('Gemini API Error Details:', {
        status: error.status,
        statusText: error.statusText,
        errorDetails: error.errorDetails
      });
    }
    
    return 'Summary temporarily unavailable.';
  }
};

// Create bookmark
router.post('/', authenticateToken, async (req, res) => {
  const { url, tags } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    // Fetch metadata and summary concurrently
    const [metadata, summary] = await Promise.all([
      fetchMetadata(url),
      getSummary(url)
    ]);

    // Save bookmark
    db.run(
      'INSERT INTO bookmarks (user_id, url, title, favicon, summary, tags) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.userId, url, metadata.title, metadata.favicon, summary, tags || ''],
      function (err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to save bookmark' });
        }

        res.status(201).json({
          id: this.lastID,
          url,
          title: metadata.title,
          favicon: metadata.favicon,
          summary,
          tags: tags || '',
          created_at: new Date().toISOString()
        });
      }
    );
  } catch (error) {
    console.error('Error creating bookmark:', error);
    res.status(500).json({ error: 'Failed to create bookmark' });
  }
});

// Get all bookmarks for user
router.get('/', authenticateToken, (req, res) => {
  const { tag } = req.query;

  let query = 'SELECT * FROM bookmarks WHERE user_id = ?';
  let params = [req.user.userId];

  if (tag) {
    query += ' AND tags LIKE ?';
    params.push(`%${tag}%`);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, bookmarks) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }

    res.json(bookmarks);
  });
});

// Update bookmark
router.patch('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, tags } = req.body;

  if (!title && !tags) {
    return res.status(400).json({ error: 'At least one field (title or tags) is required' });
  }

  let query = 'UPDATE bookmarks SET ';
  let params = [];
  let updates = [];

  if (title !== undefined) {
    updates.push('title = ?');
    params.push(title.trim());
  }

  if (tags !== undefined) {
    updates.push('tags = ?');
    params.push(tags.trim());
  }

  query += updates.join(', ') + ' WHERE id = ? AND user_id = ?';
  params.push(id, req.user.userId);

  db.run(query, params, function (err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to update bookmark' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    // Fetch the updated bookmark
    db.get(
      'SELECT * FROM bookmarks WHERE id = ? AND user_id = ?',
      [id, req.user.userId],
      (err, bookmark) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch updated bookmark' });
        }
        res.json(bookmark);
      }
    );
  });
});

// Delete bookmark
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM bookmarks WHERE id = ? AND user_id = ?',
    [id, req.user.userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete bookmark' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Bookmark not found' });
      }

      res.json({ message: 'Bookmark deleted successfully' });
    }
  );
});

module.exports = router;