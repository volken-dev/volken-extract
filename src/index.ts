import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import express from "express"
import pdf from "pdf-parse/lib/pdf-parse.js"
import TurndownService from "turndown"
import { z } from "zod"

const MAX_OUTPUT = 12000

const turndown = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" })
turndown.remove(["script", "style", "noscript"])

async function fetchBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url, { headers: { "User-Agent": "volken-extract-example/1.0" } })
  if (!response.ok) {
    throw new Error(`Could not fetch ${url} (${response.status}).`)
  }
  return Buffer.from(await response.arrayBuffer())
}

function createServer() {
  const server = new McpServer({ name: "extract", version: "1.0.0" })

  server.registerTool(
    "pdf_to_text",
    {
      description: "Download a PDF and extract its text",
      inputSchema: { url: z.string().url().describe("URL of the PDF") },
    },
    async ({ url }) => {
      const buffer = await fetchBuffer(url)
      const parsed = await pdf(buffer)
      const text = parsed.text.replace(/\n{3,}/g, "\n\n").trim().slice(0, MAX_OUTPUT)
      return { content: [{ type: "text", text: text || "No text found in the PDF." }] }
    },
  )

  server.registerTool(
    "to_markdown",
    {
      description: "Fetch an HTML page and convert it to clean Markdown",
      inputSchema: { url: z.string().url().describe("URL of the page") },
    },
    async ({ url }) => {
      const response = await fetch(url, { headers: { "User-Agent": "volken-extract-example/1.0" } })
      if (!response.ok) {
        throw new Error(`Could not fetch ${url} (${response.status}).`)
      }
      const markdown = turndown.turndown(await response.text()).trim().slice(0, MAX_OUTPUT)
      return { content: [{ type: "text", text: markdown || "Nothing to convert." }] }
    },
  )

  return server
}

const app = express()
app.use(express.json())

app.post("/", async (req, res) => {
  const server = createServer()
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
  res.on("close", () => {
    transport.close()
    server.close()
  })
  await server.connect(transport)
  await transport.handleRequest(req, res, req.body)
})

const port = Number(process.env.PORT ?? 8080)
app.listen(port, () => {
  console.log(`extract MCP server listening on ${port}`)
})
