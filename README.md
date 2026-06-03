# jensencall

Static event-study dashboard analyzing how Alphabet Class A shares (`GOOGL`) reacted
after major AI model releases from OpenAI, Google, Anthropic, Meta, Mistral AI, xAI,
and DeepSeek.

Live site: https://jensencall.vercel.app/

Repository: https://github.com/kincheungchi0-create/jensencall

## Data

```bash
npm run generate:ai-reaction
```

This generates:

- `ai_model_google_reaction.csv`
- `ai_model_google_reaction.md`

The event list uses official model-release sources where possible. Price reactions
use Yahoo Finance chart data for `GOOGL` and `QQQ` adjusted closes.

## Local Build

```bash
npm run build
```

The Vercel deployment uses `dist/` as the output directory.
