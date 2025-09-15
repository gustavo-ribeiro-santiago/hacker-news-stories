# Hacker News AI Backend Firebase Functions

This directory contains the Firebase Functions implementation for the Hacker News Stories application backend.

## Setup

1. Install Firebase CLI globally:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Install dependencies:
   ```
   cd functions
   npm install
   ```

4. Create `.env` file from template:
   ```
   cp env.example .env
   ```

5. Add your OpenAI API key to `.env`

## Local Development

Run Firebase emulators:
```
npm run serve
```

This will start local emulators for Functions and Firestore.

## Deployment

Deploy to Firebase:
```
npm run deploy
```

## API Endpoints

The backend provides the following endpoints:

- `POST /api/get_saved_articles`: Get all saved articles for a user
- `POST /api/add_article`: Save an article for a user
- `DELETE /api/delete_saved_article`: Delete a saved article
- `POST /api/summarize-link`: Generate AI summary of an article

## Authentication

All endpoints except for summarization require Firebase authentication. The client must pass the Firebase ID token in the `Authorization` header.

## Firestore Schema

### Collection: saved_articles

Document fields:
- `article_link`: String - URL of the article
- `article_name`: String - Title of the article
- `article_hn_id`: String - Hacker News ID of the article
- `user_id`: String - Firebase user ID
- `created_at`: Timestamp - When the article was saved
