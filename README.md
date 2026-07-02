# volken-extract

An MCP server that turns documents into clean, structured text an AI client can
actually use, ready to deploy on [Volken](https://volken.dev). No API keys, no
accounts. Two tools:

- `pdf_to_text(url)` downloads a PDF and extracts its text.
- `to_markdown(url)` fetches an HTML page and returns clean Markdown.

Models are unreliable at reading PDFs and messy HTML. This server does it
deterministically, so the model gets structured content instead of guessing.

For the full walkthrough see
[the Examples page](https://docs.volken.dev/docs/examples#extract).

## Deploy it

1. Click **Use this template** (or clone this repo) to make your own copy, then
   clone it locally.
2. Deploy:

   ```bash
   npm install -g volken
   volken login
   volken init
   volken deploy
   ```

3. Connect a client with the gateway token from the deploy:

   ```bash
   volken connect --install --token <your gateway token>
   ```

4. Ask your AI client to "pull the text out of this PDF" with a link, then watch
   the call land:

   ```bash
   volken calls --tail
   ```

## Local development

```bash
npm install
volken dev
```

`volken dev` opens the server in the MCP Inspector.
