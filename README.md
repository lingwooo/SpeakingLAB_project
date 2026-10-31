# SpeakUp Research

A responsive research website about teenagers’ IELTS Speaking difficulties, learning preferences, confidence, and four speaking practice strategies. It includes a speaking prompt and an AI practice coach.

## Publish the website with the AI coach

GitHub Pages can display the website, but it cannot run the Node.js server required by the chat. This repository includes `render.yaml` so the full site and chat server can be deployed together as a Render web service.

1. In Render, create a new **Blueprint** and connect the public repository `lingwooo/SpeakingLAB_project`.
2. During setup, provide `OPENAI_API_KEY` in Render’s private environment-variable prompt. Keep this key out of the website files, GitHub, and public messages.
3. Deploy the service and open the website URL Render gives you. The AI chat works on that Node-hosted URL, not on the GitHub Pages URL.

The OpenAI API may incur usage charges. Set an appropriate usage limit for the API project before sharing the chat publicly.

## Run locally

Install Node.js 22 or later, set `OPENAI_API_KEY` in your local environment, then run:

```sh
node server.js
```

Open `http://localhost:3000`. The server sends recent chat messages to the OpenAI Responses API with response storage disabled. Never put the API key in `index.html` or commit it to the repository. The Unsplash photographs require an internet connection.

