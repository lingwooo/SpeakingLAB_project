# SpeakUp Research

A responsive research website about teenagers’ IELTS Speaking difficulties, learning preferences, confidence, and four speaking practice strategies. It includes an optional speaking prompt and a text chat with an AI practice coach.

## Run the website with AI chat

The chat uses a small Node.js server in server.js. A plain static page opened as a file, or hosted only on GitHub Pages, cannot run the chat endpoint.

1. Install Node.js 22 or later.
2. Create an OpenAI API key and add it as the server environment variable OPENAI_API_KEY in your hosting provider’s secret settings.
3. Start the site with the command node server.js and open http://localhost:3000.

Keep the API key in the server’s secret settings. Never put it in index.html or commit it to the repository. API usage may be billable; check the current model pricing before enabling the chat publicly.

The chat uses GPT-6 Luna through the OpenAI Responses API. It sends recent chat messages to the server, which forwards them to the API with response storage disabled. The site’s Unsplash photographs require an internet connection.

