# AI Content Engine - Quick Start

Get AI-powered SEO content in 3 minutes.

## Step 1: Get OpenAI API Key (2 minutes)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Click "API Keys" in sidebar
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

## Step 2: Add to Environment (30 seconds)

**Local (.env.local)**:
```env
OPENAI_API_KEY="sk-your_actual_key_here"
```

**Production (Vercel)**:
1. Vercel Dashboard → Settings → Environment Variables
2. Add `OPENAI_API_KEY`
3. Redeploy

## Step 3: Test It (30 seconds)

```bash
npm run dev
```

Visit any comparison page:
```
http://localhost:3000/compare/amex-cobalt-vs-td-aeroplan
```

You should see:
- ✨ "AI-Powered Expert Analysis" section
- 300-word formatted verdict
- Professional styling with dark theme

## That's It! 🎉

### What Happens Now

1. **First Visit**: AI generates unique content (~2-3 seconds)
2. **Saved to Database**: Cached for future visits
3. **Subsequent Visits**: Instant load from cache
4. **SEO Boost**: Unique content on every comparison page

### Cost

- **Per verdict**: ~$0.002-0.003
- **1,000 pages**: ~$3
- **Cached forever**: Free after first generation

### Features

✅ Unique content for every comparison
✅ SEO-optimized with keywords
✅ Professional formatting
✅ Dark theme styling
✅ Automatic caching
✅ Graceful fallback if API fails

## Troubleshooting

### No AI Section Appearing

1. Check `OPENAI_API_KEY` is set
2. Restart dev server
3. Check browser console for errors
4. Verify API key is valid

### Generation Fails

1. Check OpenAI account has credits
2. Verify API key permissions
3. Check rate limits (60/min)
4. Review error logs

## Next Steps

1. **Add credits to OpenAI account**
2. **Pre-generate popular comparisons**
3. **Monitor SEO improvements**
4. **Track costs in OpenAI dashboard**

## Quick Reference

```env
# Environment Variable
OPENAI_API_KEY="sk-..."

# Model Used
gpt-4o-mini (cost-effective, high-quality)

# Cost per Verdict
~$0.002-0.003

# Generation Time
2-3 seconds (first time)
Instant (cached)
```

---

**Your AI Content Engine is ready to boost SEO rankings!** 🚀📈
