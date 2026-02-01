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

// ==================== ALEXA GPT SKILL ENDPOINTS ====================

// Submit a new question from Alexa skill
app.post('/alexa/ask', async (req, res) => {
  try {
    const { user_id, question } = req.body;
    
    if (!user_id || !question) {
      return res.status(400).json({ error: 'Missing user_id or question' });
    }
    
    // Create new question document with "Still thinking" placeholder
    const docRef = await db.collection('alexa_questions').add({
      user_id,
      question,
      answer: 'Still thinking',
      status: 'processing',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Return immediately to avoid Alexa timeout
    res.status(201).json({ 
      success: true,
      message: 'Question received. Ask for the answer later.',
      question_id: docRef.id
    });
    
    // Process the question asynchronously (after response sent)
    processAlexaQuestion(docRef.id, question).catch(err => {
      console.error('Error processing Alexa question:', err);
    });
    
  } catch (error) {
    console.error('Error submitting Alexa question:', error);
    return res.status(500).json({ error: 'Failed to submit question' });
  }
});

// Background function to process the question with OpenAI
async function processAlexaQuestion(questionId, question) {
  try {
    const openai = getOpenAIClient();
    
    const aiResponse = await openai.responses.create({
      model: "gpt-5-mini",
      input: "Responda em poucas frases para caber na resposta de uma Alexa Skill: " + question,
      tools: [{ type: "web_search" }]
    });
    
    const answer = aiResponse.output_text;
    
    // Update the document with the actual answer
    await db.collection('alexa_questions').doc(questionId).update({
      answer,
      status: 'completed',
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Question ${questionId} processed successfully`);
  } catch (error) {
    console.error(`Error processing question ${questionId}:`, error);
    
    // Update with error message
    await db.collection('alexa_questions').doc(questionId).update({
      answer: 'Desculpe, houve um erro ao processar sua pergunta.',
      status: 'error',
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}

// Get the last answer for a user from Alexa skill
app.post('/alexa/last-answer', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id' });
    }
    
    // Get the most recent question for this user
    const snapshot = await db
      .collection('alexa_questions')
      .where('user_id', '==', user_id)
      .orderBy('created_at', 'desc')
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return res.status(200).json({ 
        found: false,
        message: 'Você ainda não fez nenhuma pergunta.'
      });
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return res.status(200).json({
      found: true,
      question: data.question,
      answer: data.answer,
      status: data.status
    });
    
  } catch (error) {
    console.error('Error fetching last answer:', error);
    return res.status(500).json({ error: 'Failed to fetch last answer' });
  }
});

// Get all questions history for a user (optional - for checking later)
app.post('/alexa/history', async (req, res) => {
  try {
    const { user_id, limit: queryLimit } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id' });
    }
    
    const snapshot = await db
      .collection('alexa_questions')
      .where('user_id', '==', user_id)
      .orderBy('created_at', 'desc')
      .limit(queryLimit || 20)
      .get();
    
    const questions = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      questions.push({
        id: doc.id,
        question: data.question,
        answer: data.answer,
        status: data.status,
        created_at: data.created_at
      });
    });
    
    return res.status(200).json({ questions });
    
  } catch (error) {
    console.error('Error fetching history:', error);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// ==================== END ALEXA GPT SKILL ENDPOINTS ====================

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
