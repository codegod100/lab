from mcp.server import Server, stdio, models, NotificationOptions
import mcp.types as types
import os
import aiohttp

# Add this at the top with your other imports
from typing import Optional

BRAVE_API_KEY = os.getenv("BRAVE_API_KEY")
BRAVE_SEARCH_URL = "https://api.search.brave.com/res/v1/web/search"

PROMPTS = {
    "ls": types.Prompt(
        name="ls",
        description="list files in a directory",
        arguments=[
            types.PromptArgument(
                name="directory",
                description="directory to list files",
                required=True,
            )
        ],
    ),
    "brave-search": types.Prompt(
            name="brave-search",
            description="search using Brave Search",
            arguments=[
                types.PromptArgument(
                    name="query",
                    description="search query",
                    required=True,
                )
            ],
        )
}

async def perform_brave_search(query: str) -> Optional[str]:
    """
    Perform a search using the Brave Search API
    """
    if not BRAVE_API_KEY:
        raise ValueError("BRAVE_API_KEY environment variable not set")

    headers = {
        "Accept": "application/json",
        "X-Subscription-Token": BRAVE_API_KEY
    }

    params = {
        "q": query
    }

    async with aiohttp.ClientSession() as session:
        async with session.get(BRAVE_SEARCH_URL, headers=headers, params=params) as response:
            if response.status != 200:
                raise ValueError(f"Brave Search API returned status code {response.status}")

            data = await response.json()

            # Format the results
            results = []
            for web_result in data.get("web", {}).get("results", [])[:5]:  # Get top 5 results
                title = web_result.get("title", "")
                url = web_result.get("url", "")
                description = web_result.get("description", "")
                results.append(f"🔍 {title}\n   {url}\n   {description}\n")

            return "\n".join(results) if results else "No results found."

# Initialize server
app = Server("document-conversion-server")

@app.list_prompts()
async def list_prompts() -> list[types.Prompt]:
    return list(PROMPTS.values())

@app.get_prompt()
async def get_prompt(
    name: str, arguments: dict[str, str] | None = None
) -> types.GetPromptResult:
    if name not in PROMPTS:
        raise ValueError(f"Prompt not found: {name}")

    if name == "ls":
        if arguments is None:
            raise ValueError("Arguments are required")

        try:
            directory = arguments["directory"]
            files = os.listdir(directory)

            return types.GetPromptResult(
                messages=[
                    types.PromptMessage(
                        role="user",
                        content=types.TextContent(
                            type="text",
                            text="\n".join(files),
                        ),
                    )
                ]
            )

        except Exception as e:
            raise ValueError(f"Error processing document: {str(e)}")

    elif name == "brave-search":
        if arguments is None:
            raise ValueError("Arguments are required")

        try:
            query = arguments["query"]
            search_results = await perform_brave_search(query)

            return types.GetPromptResult(
                messages=[
                    types.PromptMessage(
                        role="user",
                        content=types.TextContent(
                            type="text",
                            text=f"Search results for: {query}\n\n{search_results}",
                        ),
                    )
                ]
            )

        except Exception as e:
            raise ValueError(f"Error processing search: {str(e)}")

    raise ValueError("Prompt implementation not found")

async def run():
    async with stdio.stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            models.InitializationOptions(
                server_name="example",
                server_version="0.1.0",
                capabilities=app.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )
