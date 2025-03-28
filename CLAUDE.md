# CLAUDE.md - Household Accountbook App

## Commands
### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Install and build client app

### Frontend (in client directory)
- `npm start` - Start React development server
- `npm run build` - Build production version
- `npm test` - Run all tests
- `npm test -- --testNamePattern="test name"` - Run specific test
- `npm test -- --watch` - Run tests in watch mode

## Code Style Guidelines
- **Formatting**: Follow React.js best practices with JSX
- **Imports**: Group imports by type - React, third-party, local components
- **Naming**: Use PascalCase for components, camelCase for variables/functions
- **Component Structure**: Functional components with hooks, clear prop definitions
- **Error Handling**: Use try/catch in API calls with user-friendly error messages
- **Comments**: Document complex logic, use JSDoc for component props
- **Styling**: Use Tailwind CSS classes with consistent spacing patterns
- **Database**: Use PostgreSQL in production, SQLite for development
- **API Endpoints**: RESTful conventions with clear error responses
- **i18n**: Use Japanese labels in UI, English variable names in code