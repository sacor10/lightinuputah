# Development Guide

## Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Reusable components
│   └── ...            # Feature-specific components
├── hooks/              # Custom React hooks
├── services/           # API and external service integrations
├── utils/              # Utility functions and helpers
├── types/              # TypeScript type definitions
├── constants/          # Application constants
├── config/             # Configuration files
└── ...
```

## Code Organization Principles

### 1. **Component Structure**
- Keep components focused on a single responsibility
- Extract complex logic into custom hooks
- Use TypeScript interfaces for all props
- Implement proper error boundaries

### 2. **State Management**
- Use React hooks for local state
- Extract shared state into custom hooks
- Avoid prop drilling with context when needed
- Keep state as close to where it's used as possible

### 3. **Type Safety**
- Define interfaces for all data structures
- Use strict TypeScript configuration
- Avoid `any` types - use proper typing
- Export types from centralized location

### 4. **Performance**
- Implement lazy loading for heavy components
- Use React.memo for expensive components
- Optimize images with responsive loading
- Monitor bundle size with size-limit

## Development Workflow

### Setup
```bash
npm install
npm run quality:fix  # Fix linting and formatting issues
```

### Development
```bash
npm start           # Start development server
npm run type-check  # TypeScript type checking
```

### Before Committing
```bash
npm run type-check  # Run TypeScript checks
```

### Build and Deploy
```bash
npm run build       # Production build
npm run analyze     # Analyze bundle size
npm run size        # Check size limits
```

## Code Quality Standards

### ESLint Rules
- No unused variables (except those starting with `_`)
- No inferrable types (let TypeScript infer types where possible)
- React hooks rules enforced
- TypeScript strict mode

### Prettier Configuration
- Consistent code formatting
- 2-space indentation
- Single quotes for strings
- Trailing commas in objects and arrays

### TypeScript Configuration
- Strict mode enabled
- No implicit any
- Strict null checks
- No unused locals

## Performance Guidelines

### Bundle Size
- Keep main bundle under 100KB
- Use code splitting for large components
- Lazy load non-critical features
- Monitor with `npm run size`

### Image Optimization
- Use responsive images
- Implement lazy loading
- Optimize with WebP format
- Use appropriate sizes for different devices

### Memory Management
- Clean up event listeners
- Properly dispose of timers
- Avoid memory leaks in useEffect
- Use React.memo judiciously

## Testing Strategy

### Unit Tests
- Test utility functions
- Test custom hooks
- Test component logic
- Mock external dependencies

### Integration Tests
- Test component interactions
- Test API integrations
- Test user workflows
- Test error scenarios

### Performance Tests
- Monitor Core Web Vitals
- Test bundle size limits
- Monitor memory usage
- Test loading performance

## Deployment

### Environment Variables
- `REACT_APP_CONTENTFUL_SPACE_ID`: Contentful space ID
- `REACT_APP_CONTENTFUL_ACCESS_TOKEN`: Contentful access token
- `REACT_APP_NETLIFY_SITE_ID`: Netlify site ID (optional)
- `REACT_APP_NETLIFY_FUNCTIONS_URL`: Netlify functions URL (optional)

### Build Process
1. Run quality checks
2. Type checking
3. Build production bundle
4. Size analysis
5. Deploy to platform

## Maintenance Tasks

### Regular Maintenance
- Update dependencies monthly
- Review and update TypeScript types
- Monitor performance metrics
- Update documentation

### Code Reviews
- Check for type safety
- Verify performance impact
- Ensure proper error handling
- Review accessibility features

### Monitoring
- Monitor Core Web Vitals
- Track error rates
- Monitor API performance
- Check bundle size trends 