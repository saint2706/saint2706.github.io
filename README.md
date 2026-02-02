# Rishabh's Portfolio Website

A modern, interactive portfolio website built with React, featuring AI-powered chatbot, blog integration, games, and more.

## 🚀 Features

- **AI-Powered Chatbot**: Interactive assistant powered by Google's Gemini AI to answer questions about experience and skills
- **Blog Integration**: Automatically syncs posts from Dev.to, Medium, and Substack
- **Interactive Games**: Includes Tic Tac Toe with AI and classic Snake game
- **Code Playground**: Live code editor with syntax highlighting
- **Responsive Design**: Fully responsive with Neubrutalism and Glassmorphism design systems
- **Performance Optimized**: Code splitting, lazy loading, and optimized builds

## 🛠️ Tech Stack

- **Frontend**: React 18 with React Router
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite
- **AI Integration**: Google Gemini API
- **Animation**: Framer Motion
- **Code Highlighting**: Prism.js
- **Markdown**: React Markdown

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test:security` - Run security tests
- `node scripts/sync-blogs.js` - Sync blog posts from external platforms

## 🗂️ Project Structure

```
├── src/
│   ├── components/     # React components
│   │   ├── games/      # Game components
│   │   ├── home/       # Home page components
│   │   ├── layout/     # Layout components
│   │   ├── pages/      # Page components
│   │   └── shared/     # Shared/reusable components
│   ├── data/           # Static data and content
│   ├── services/       # API and service integrations
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # App entry point
│   └── index.css       # Global styles
├── scripts/            # Build and utility scripts
├── public/             # Static assets
└── ...config files     # Configuration files
```

## 🎨 Design Systems

### Neubrutalism
Bold, high-contrast design with thick borders and offset shadows for a playful, brutalist aesthetic.

### Glassmorphism
Frosted glass effect with blur and transparency, providing a modern look in dark mode.

## 🔒 Security Features

- XSS prevention with safe JSON stringification
- URL validation to prevent javascript: protocol attacks
- Input validation and sanitization
- Rate limiting on API requests
- Content Security Policy

## 🤝 Contributing

This is a personal portfolio project. Feel free to fork and use as inspiration for your own portfolio!

## 📄 License

© 2024 Rishabh Agrawal. All rights reserved.

## 📧 Contact

- GitHub: [@saint2706](https://github.com/saint2706)
- Portfolio: [saint2706.github.io](https://saint2706.github.io)

---

Built with ❤️ and lots of ☕
