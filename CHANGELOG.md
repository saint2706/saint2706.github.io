# Changelog

## [Unreleased] - 2025-11-23

### Changed
- **Updated chatbot AI model from `gemini-pro` to `gemini-2.5-flash`**
  - Improved response speed with the latest flash model
  - Better performance for interactive conversations
  - More cost-effective while maintaining high quality

### Added
- Created `docs/GEMINI_MODELS.md` - Documentation of available Gemini AI models
- Created `scripts/list-models.js` - Script to list available AI models via API
- Updated README.md to mention gemini-2.5-flash in the description

### Technical Details
- Model change location: `src/services/ai.js` line 12
- Previous model: `gemini-pro`
- New model: `gemini-2.5-flash`
- API Key: Provided via `VITE_GEMINI_API_KEY` environment variable

### Benefits
1. **Faster Response Times**: Flash models are optimized for speed
2. **Latest Technology**: gemini-2.5-flash is the newest stable flash model
3. **Better User Experience**: Quicker chatbot responses improve interactivity
4. **Cost Efficiency**: Flash models are more economical than pro models
5. **Maintained Quality**: High-quality responses for portfolio Q&A
