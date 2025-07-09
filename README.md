# LightinUpUtah

**Website:** [www.lightinuputah.com](https://www.lightinuputah.com)

Professional LED car lighting installation services website storefront for LightinUpUtah

## Environment Setup

This project uses Contentful CMS for content management. To set up the environment variables:

1. Create a `.env` file in the project root
2. Add the following variables with your actual Contentful credentials:

```env
REACT_APP_CONTENTFUL_SPACE_ID=your_space_id_here
REACT_APP_CONTENTFUL_ACCESS_TOKEN=your_access_token_here
```

3. Restart your development server after creating the `.env` file

**Important Security Notes:**
- Never commit your `.env` file to version control
- The `.env` file is already included in `.gitignore`
- Use different API keys for development and production environments
- Consider using Contentful's preview tokens for development and delivery tokens for production

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see above)

3. Start the development server:
```bash
npm start
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (not recommended)