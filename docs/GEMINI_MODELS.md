# Available Gemini AI Models

This document lists the available Google Gemini models that can be used with the provided API key.

## Model Categories

### Flash Models (Recommended for Chatbot)
Flash models are optimized for speed and efficiency while maintaining high quality outputs. They are ideal for interactive applications like chatbots.

- **gemini-2.5-flash** ⭐
  - Latest flash model (December 2024)
  - Optimized for fast responses
  - Best balance of speed and quality
  - Supports text and image inputs
  - Supports multi-turn conversations
  - **Current choice for the chatbot**

- **gemini-2.0-flash-exp** (Experimental)
  - Experimental flash model
  - May have cutting-edge features
  - Less stable than stable releases

- **gemini-1.5-flash**
  - Previous stable flash model
  - Still highly reliable
  - Good fallback option

- **gemini-1.5-flash-8b**
  - Smaller, faster variant
  - Lower cost per token
  - Good for simple queries

### Pro Models
Pro models offer higher quality outputs but are slower and more expensive than flash models.

- **gemini-pro**
  - Original Gemini model
  - Good quality but slower than flash models
  - **Previously used by the chatbot**

- **gemini-1.5-pro**
  - Stable pro model
  - Highest quality outputs
  - Better reasoning capabilities
  - Slower response times

### Other Models
- **gemini-1.0-pro-vision**: For image understanding
- **text-embedding-004**: For generating text embeddings
- Various experimental and specialized models

## Model Selection for Chatbot

The chatbot has been updated to use **gemini-2.5-flash** because:

1. **Latest Technology**: gemini-2.5-flash is the newest flash model available
2. **Speed**: Flash models provide faster responses, improving user experience
3. **Quality**: Maintains high-quality outputs suitable for portfolio Q&A
4. **Efficiency**: Lower latency means better interactive conversations
5. **Cost**: More cost-effective than pro models for this use case

## How to Test Available Models

Due to network restrictions in the build environment, you can test available models locally:

```bash
# Run the list-models script with your API key
GEMINI_API_KEY=your_api_key node scripts/list-models.js
```

Or use curl directly:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY"
```

## Migration Notes

**Previous model:** gemini-pro  
**New model:** gemini-2.5-flash

The update improves response times significantly while maintaining or improving response quality.

## References

- [Google AI Gemini API Documentation](https://ai.google.dev/docs)
- [Model comparison](https://ai.google.dev/gemini-api/docs/models/gemini)
