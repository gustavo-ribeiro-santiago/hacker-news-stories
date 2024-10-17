from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views import View
import json
import requests
import tiktoken
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage
import mysql.connector
from firebase_admin import auth
import os

load_dotenv()


# Function to verify Firebase token
def verify_firebase_token(id_token):
    try:
        decoded_token = auth.verify_id_token(id_token)
        user_id = decoded_token["uid"]  # User ID from Firebase
        return user_id
    except Exception as e:
        print(f"Error verifying token: {e}")
        return None


# View to fetch saved articles for a user
@csrf_exempt
def get_saved_articles(request):
    if request.method == "POST":
        # Get the Firebase ID token from the request headers
        id_token = request.headers.get("Authorization")

        # Verify the Firebase token
        user_id = verify_firebase_token(id_token)
        if not user_id:
            return JsonResponse({"error": "Unauthorized"}, status=401)

        # Connect to MySQL database
        connection = mysql.connector.connect(
            host="localhost",
            user=os.getenv("MYSQL_USER"),
            password=os.getenv("MYSQL_PASSWORD"),
            database=os.getenv("MYSQL_DATABASE"),
        )
        cursor = connection.cursor()

        # Query to fetch user-specific articles
        cursor.execute(
            "SELECT id, article_hn_id, article_link, article_name FROM saved_articles WHERE user_id = %s",
            (user_id,),
        )
        articles = cursor.fetchall()

        # Close the connection
        connection.close()

        # Format the articles as JSON response
        articles_list = [
            {
                "id": a[0],
                "article_hn_id": a[1],
                "article_link": a[2],
                "article_name": a[3],
            }
            for a in articles
        ]
        return JsonResponse(articles_list, safe=False)


def add_article(request):
    if request.method == "POST":
        # Get the Firebase ID token from the request headers
        id_token = request.headers.get("Authorization")

        # Verify the Firebase token
        user_id = verify_firebase_token(id_token)
        if not user_id:
            return JsonResponse({"error": "Unauthorized"}, status=401)

        # Get article details from the request body
        data = json.loads(request.body)
        article_link = data.get("article_link")
        article_name = data.get("article_name")
        article_hn_id = data.get("article_hn_id")

        # Connect to MySQL database
        connection = mysql.connector.connect(
            host="localhost",
            user=os.getenv("MYSQL_USER"),
            password=os.getenv("MYSQL_PASSWORD"),
            database=os.getenv("MYSQL_DATABASE"),
        )
        cursor = connection.cursor()
        print(article_link, article_name, article_hn_id, user_id)

        # Query to insert the new article
        cursor.execute(
            "INSERT INTO saved_articles (article_link, article_name, article_hn_id, user_id) VALUES (%s, %s, %s, %s)",
            (article_link, article_name, article_hn_id, user_id),
        )

        connection.commit()

        # Close the connection
        connection.close()

        return JsonResponse({"success": "Article added successfully"}, status=201)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


def delete_saved_article(request):
    if request.method == "DELETE":
        # Get the Firebase ID token from the request headers
        id_token = request.headers.get("Authorization")

        # Verify the Firebase token
        user_id = verify_firebase_token(id_token)
        if not user_id:
            return JsonResponse({"error": "Unauthorized"}, status=401)

        # Get the article ID from the request body
        data = json.loads(request.body)
        article_hn_id = data.get("article_hn_id")

        # Connect to MySQL database
        connection = mysql.connector.connect(
            host="localhost",
            user=os.getenv("MYSQL_USER"),
            password=os.getenv("MYSQL_PASSWORD"),
            database=os.getenv("MYSQL_DATABASE"),
        )
        cursor = connection.cursor()

        # Query to delete the saved article
        cursor.execute(
            "DELETE FROM saved_articles WHERE article_hn_id = %s AND user_id = %s",
            (article_hn_id, user_id),
        )
        connection.commit()

        # Close the connection
        connection.close()

        return JsonResponse({"success": "Article deleted successfully"}, status=200)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


# Initialize the LLM using LangChain's OpenAI wrapper
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5)


class SummarizeLinkView(View):
    @csrf_exempt
    def post(self, request):
        try:

            data = json.loads(request.body)
            link = data.get("link")

            if not link:
                return JsonResponse({"error": "Link not provided"}, status=400)

            # Fetch the content from the link
            response = requests.get(link)
            content = response.text
            print("content length: ", len(content))

            # Initialize the tokenizer for the appropriate model
            tokenizer = tiktoken.encoding_for_model("gpt-4o-mini")

            # Tokenize the content
            tokens = tokenizer.encode(content)
            token_count = len(tokens)

            # Cap the token count at 60,000
            if token_count > 59900:
                # Trim the tokens to 60,000
                tokens = tokens[:59900]
                # Decode the tokens back to text
                content = tokenizer.decode(tokens)

            response = llm.invoke(
                [
                    SystemMessage(content="You are a helpful assistant."),
                    HumanMessage(content=f"Summarize the following content: {content}"),
                ]
            )

            summary = response.content

            print(response)
            print("usage_metadata: ", response.usage_metadata)

            # Calculate the number of tokens on the prompt
            prompt_text = f"You are a helpful assistant. Summarize the following content: {content}"
            prompt_tokens = tokenizer.encode(prompt_text)
            prompt_token_count = len(prompt_tokens)
            print("prompt_token_count: ", prompt_token_count)

            # Tokenize the completion (summary) to get the token count0,
            completion_tokens = tokenizer.encode(summary)
            completion_token_count = len(completion_tokens)
            print("completion_token_count: ", completion_token_count)

            print("GPT's response: ", summary)

            return JsonResponse({"summary": summary}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
