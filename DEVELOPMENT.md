# Biolio - Development Guide

## Overview

Biolio is a modern portfolio and bio application built following best practices with a feature-based modular architecture.

## Key Architecture Decisions

### Feature-Based Structure
- Each feature (like contact) has its own dedicated folder
- Features contain their own hooks, services, and components
- Promotes code organization and reusability

### State Management with Zustand
- Lightweight alternative to Redux
- Simple and intuitive API
- Located in `/src/store/`
- Stores:
  - `profileStore.ts` - User profile information
  - `projectsStore.ts` - Project data and management
  - `uiStore.ts` - UI state (mobile menu, theme, etc.)

### Component Structure
- **Pages**: Route-level components in `/src/pages/`
- **UI Components**: Reusable components in `/src/components/ui/`
- **Feature Components**: Feature-specific components within feature folders

### Styling Approach
- TailwindCSS for all styling
- No CSS modules or styled-components
- Utility-first approach
- Custom color palette defined in `tailwind.config.js`

### Type Safety
- Strict TypeScript configuration
- All types defined in `/src/types/`
- Proper prop typing for all components

## Adding New Features

### 1. Create Feature Folder

```
src/features/your-feature/
├── components/       # Feature-specific components
├── hooks/           # Feature-specific hooks
├── services/        # Feature-specific services
└── types/           # Feature-specific types (optional)
```

### 2. Create Hooks

Example hook structure:

```typescript
// src/features/your-feature/hooks/useYourFeature.ts
import { useState } from 'react'

export function useYourFeature() {
  const [data, setData] = useState(null)
  
  // Your logic here
  
  return {
    data,
    // other exports
  }
}
```

### 3. Create Services

Example service:

```typescript
// src/features/your-feature/services/yourService.ts
export async function fetchData() {
  // API calls or business logic
  return data
}
```

### 4. Add to Router

Update `src/AppRouter.tsx`:

```typescript
import YourFeaturePage from './pages/YourFeaturePage'

// Add to routes
<Route path="your-feature" element={<YourFeaturePage />} />
```

## Best Practices

### 1. Separation of Concerns
- Keep business logic in services
- Keep state logic in hooks
- Keep components focused on presentation

### 2. Avoid Inline Logic in JSX
❌ Bad:
```tsx
<button onClick={() => {
  // lots of logic here
}}>
```

✅ Good:
```tsx
const handleClick = () => {
  // logic here
}

<button onClick={handleClick}>
```

### 3. Component Props
- Always type your props
- Use interfaces for complex props
- Provide default values when appropriate

### 4. Hooks
- Keep hooks focused and single-purpose
- Return clear and descriptive values
- Handle loading and error states

### 5. Services
- One responsibility per service function
- Proper error handling
- TypeScript return types

## Customization

### Changing Colors
Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your color palette
      },
    },
  },
}
```

### Adding New Stores
Create a new store in `/src/store/`:

```typescript
import { create } from 'zustand'

interface YourState {
  // state shape
}

export const useYourStore = create<YourState>((set) => ({
  // initial state and actions
}))
```

## Common Patterns

### Form Handling
See `/src/features/contact/hooks/useContactForm.ts` for reference

### API Calls
Use the centralized API service in `/src/services/api.ts`

### Routing
- Use `<Link>` from react-router-dom for navigation
- Use `useNavigate()` for programmatic navigation

## Troubleshooting

### Types Not Found
- Ensure dependencies are installed: `npm install`
- Restart TypeScript server in VS Code

### Styles Not Working
- Check Tailwind is properly configured
- Ensure index.css is imported in main.tsx
- Check PostCSS configuration

### State Not Updating
- Ensure you're using Zustand setters correctly
- Check for shallow equality issues with objects

## Performance Tips

1. **Code Splitting**: React Router automatically splits routes
2. **Lazy Loading**: Use React.lazy() for large components
3. **Memoization**: Use useMemo() and useCallback() sparingly
4. **Zustand**: Already optimized for selective subscriptions

## Deployment

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

The build output will be in `/dist/` directory.

### Environment Variables
- Create `.env` file (see `.env.example`)
- Prefix all variables with `VITE_`
- Access via `import.meta.env.VITE_YOUR_VAR`

## Contributing

When adding features:
1. Follow the existing folder structure
2. Add proper TypeScript types
3. Keep components small and focused
4. Write declarative, readable code
5. Use TailwindCSS for styling

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Router Documentation](https://reactrouter.com)
