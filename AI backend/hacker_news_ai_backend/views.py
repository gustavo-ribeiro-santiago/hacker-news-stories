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

load_dotenv()

# Initialize the LLM using LangChain's OpenAI wrapper 
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5)

class SummarizeLinkView(View):
    @csrf_exempt
    def post(self, request):
        try:

            data = json.loads(request.body)
            link = data.get('link')

            if not link:
                return JsonResponse({'error': 'Link not provided'}, status=400)

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

            response = llm.invoke([
                SystemMessage(content="You are a helpful assistant."),
                HumanMessage(content=f"Summarize the following content: {content}")
            ])

            summary = response.content
            
            print(response)
            print("usage_metadata: ", response.usage_metadata)

            # Calculate the number of tokens on the prompt
            prompt_text = f"You are a helpful assistant. Summarize the following content: {content}"
            prompt_tokens = tokenizer.encode(prompt_text)
            prompt_token_count = len(prompt_tokens)
            print("prompt_token_count: ", prompt_token_count)

            # Tokenize the completion (summary) to get the token count
            completion_tokens = tokenizer.encode(summary)
            completion_token_count = len(completion_tokens)
            print("completion_token_count: ", completion_token_count)

            print("GPT's response: ", summary)

            return JsonResponse({'summary': summary}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
