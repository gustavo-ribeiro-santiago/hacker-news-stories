import axios from 'axios';
import { getAuth } from 'firebase/auth';

// Replace with your Firebase Functions URL after deployment
// const API_BASE_URL =  'https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/api';
const API_BASE_URL =  'https://us-central1-hacker-news-stories-15c1a.cloudfunctions.net/api';

// For local development with emulators
// const API_BASE_URL = 'http://localhost:5001/YOUR_PROJECT_ID/us-central1/api';

// Helper function to get Firebase ID token
const getFirebaseToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  return await user.getIdToken();
};

// Get headers with authorization token
const getAuthHeaders = async () => {
  const token = await getFirebaseToken();
  return {
    Authorization: token,
    'Content-Type': 'application/json',
  };
};

// API functions

// Get saved articles for the current user
export const getSavedArticles = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/get_saved_articles`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting saved articles:', error);
    throw error;
  }
};

// Save an article for the current user
export const addArticle = async (article) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/add_article`,
      {
        article_link: article.url,
        article_name: article.title,
        article_hn_id: article.objectID || article.id,
      },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding article:', error);
    throw error;
  }
};

// Delete a saved article
export const deleteSavedArticle = async (articleHnId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios({
      method: 'delete',
      url: `${API_BASE_URL}/delete_saved_article`,
      headers,
      data: { article_hn_id: articleHnId },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting article:', error);
    throw error;
  }
};

// Generate AI summary of an article
export const summarizeArticle = async (link) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/summarize-link`,
      { link }
    );
    return response.data;
  } catch (error) {
    console.error('Error summarizing article:', error);
    throw error;
  }
};
