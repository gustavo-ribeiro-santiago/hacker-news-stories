const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const OpenAI = require('openai');
const { onRequest } = require('firebase-functions/v2/https');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Function to get OpenAI client
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY || functions.config()?.openai?.api_key;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
  }
  
  return new OpenAI({
    apiKey: apiKey,
  });
};

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Middleware to verify Firebase token
async function verifyFirebaseToken(req, res, next) {
  const idToken = req.headers.authorization;
  
  if (!idToken) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
}

// Get saved articles for a user
app.post('/get_saved_articles', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const articlesSnapshot = await db
      .collection('saved_articles')
      .where('user_id', '==', userId)
      .get();
    
    const articles = [];
    articlesSnapshot.forEach(doc => {
      articles.push({
        id: doc.id,
        article_hn_id: doc.data().article_hn_id,
        article_link: doc.data().article_link,
        article_name: doc.data().article_name
      });
    });
    
    return res.status(200).json(articles);
  } catch (error) {
    console.error('Error fetching saved articles:', error);
    return res.status(500).json({ error: 'Failed to fetch saved articles' });
  }
});

// Add article to user's saved list
app.post('/add_article', verifyFirebaseToken, async (req, res) => {
  try {
    const { article_link, article_name, article_hn_id } = req.body;
    const userId = req.user.uid;
    
    if (!article_link || !article_name || !article_hn_id) {
      return res.status(400).json({ error: 'Missing required article information' });
    }
    
    await db.collection('saved_articles').add({
      article_link,
      article_name,
      article_hn_id,
      user_id: userId,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return res.status(201).json({ success: 'Article added successfully' });
  } catch (error) {
    console.error('Error adding article:', error);
    return res.status(500).json({ error: 'Failed to add article' });
  }
});

// Delete article from user's saved list
app.delete('/delete_saved_article', verifyFirebaseToken, async (req, res) => {
  try {
    const { article_hn_id } = req.body;
    const userId = req.user.uid;
    
    if (!article_hn_id) {
      return res.status(400).json({ error: 'Missing article_hn_id' });
    }
    
    const articlesSnapshot = await db
      .collection('saved_articles')
      .where('article_hn_id', '==', article_hn_id)
      .where('user_id', '==', userId)
      .get();
    
    if (articlesSnapshot.empty) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    const batch = db.batch();
    articlesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    return res.status(200).json({ success: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    return res.status(500).json({ error: 'Failed to delete article' });
  }
});

// Summarize article using OpenAI
app.post('/summarize-link', async (req, res) => {
  try {
    const { link } = req.body;
    
    if (!link) {
      return res.status(400).json({ error: 'Link not provided' });
    }
    
    // Get OpenAI client (this will throw an error if API key is not configured)
    const openai = getOpenAIClient();
    
    // Fetch content from the link
    const response = await axios.get(link);
    const content = response.data;
    
    // Simplified token counting approach
    // Just ensure we don't exceed model limits
    const maxContentLength = 60000;
    let processedContent = content;
    
    if (content.length > maxContentLength) {
      processedContent = content.substring(0, maxContentLength);
    }
    
    // Use OpenAI to summarize the content
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",  // Or another appropriate model
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: `Summarize the following content: ${processedContent}` }
      ],
      temperature: 0.5
    });
    
    const summary = aiResponse.choices[0].message.content;
    
    return res.status(200).json({ summary });
  } catch (error) {
    console.error('Error summarizing link:', error);
    return res.status(500).json({ error: String(error) });
  }
});

// Export the API as Firebase Functions
exports.api = onRequest({
  cors: true,
  maxInstances: 10,
}, app);
