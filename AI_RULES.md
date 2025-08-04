# AI Rules for Discord Bot

## Architecture Overview
- Plain JavaScript bot using discord.js v14
- Modular layout: commands/ and events/ for extensibility
- No UI, pure bot functionality

## Style & Behavior
- Commands should be short and to the point
- Use async/await for I/O and API calls
- Error handling: catch and send ephemeral reply on failure

## Security & Environment
- Sensitive values (e.g. DISCORD_TOKEN) managed via `.env`
- Validate inputs (e.g. user-provided IDs or text)

## Extensions & AI Guidance
- If AI is integrated (e.g. GPT), describe prompts structure here
- Provide tone preferences (e.g. Gen Z slang, casual, humorous)
