# Suggested Commands for RCRD Development

## Development Commands
```bash
# Start development server (localhost:3000)
npm start

# Run tests in watch mode (interactive)
npm test

# Run tests once with coverage report
npm test -- --coverage --watchAll=false

# Run a specific test file
npm test -- RiskInputForm.test.jsx

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Documentation Commands
```bash
# Generate JSDoc documentation
npm run docs

# Generate component documentation only
npm run docs:components

# Generate utils documentation only
npm run docs:utils

# Clean documentation directory
npm run clean-docs
```

## Testing Guidelines
- Always run tests before committing: `npm test`
- Check test coverage: `npm test -- --coverage --watchAll=false`
- Tests are located alongside components in `__tests__` directories
- Test files follow naming pattern: `ComponentName.test.jsx` or `ComponentName.[type].test.jsx`

## Git Commands (macOS/Darwin)
```bash
# Check status
git status

# Stage changes
git add .

# Commit with message
git commit -m "message"

# Push to remote
git push origin branch-name

# Create new branch
git checkout -b feature-branch
```

## System Utilities (macOS)
```bash
# List files
ls -la

# Find files
find . -name "*.test.jsx"

# Search in files (ripgrep recommended)
rg "pattern" --type js

# Navigate directories
cd path/to/directory

# View file contents
cat filename

# Check current directory
pwd
```