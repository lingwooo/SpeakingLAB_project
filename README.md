# SpeakUp Research

**Open the live website:** https://speakup-research-ielts.onrender.com/

The GitHub Pages copy is static and cannot run the AI chat server: https://lingwooo.github.io/SpeakingLAB_project/

A responsive research website about teenagers’ IELTS Speaking difficulties, learning preferences, confidence, and four speaking practice strategies. It includes a speaking prompt and an AI practice coach.

## Publish the website with the AI coach

The full website is deployed as a Render Node.js web service. The AI chat server is running, but it needs an `OPENAI_API_KEY` secret before it can generate replies.

1. Open the `speakup-research-ielts` service in Render and go to **Environment**.
2. Add `OPENAI_API_KEY` as a private environment variable. Keep the key out of the website files, GitHub, and public messages.
3. Save and redeploy, then use the live website link above. GitHub Pages cannot run the chat server.

The OpenAI API may incur usage charges. Set an appropriate usage limit for the API project before sharing the chat publicly.

## Run locally

Install Node.js 22 or later, set `OPENAI_API_KEY` in your local environment, then run:

```sh
node server.js
```

Open `http://localhost:3000`. The server sends recent chat messages to the OpenAI Responses API with response storage disabled. Never put the API key in `index.html` or commit it to the repository. The Unsplash photographs require an internet connection.

