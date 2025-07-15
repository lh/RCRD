# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RCRD (Retinal Calculator for Retinal Detachment) is a React-based medical calculator that helps surgeons calculate risk factors for retinal detachment procedures. The application features an interactive clock face UI for selecting affected retinal areas and uses evidence-based logistic regression models.

## Development Commands

```bash
# Start development server
npm start

# Run tests in watch mode
npm test

# Run tests once with coverage
npm test -- --coverage --watchAll=false

# Run a specific test file
npm test -- Calculator.test.js

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy

# Generate JSDoc documentation
npm run docs

# Analyze bundle size
npm run analyze
```

## Architecture Overview

### Component Structure
- **Calculator Views**: Separate mobile (`MobileCalculator.js`) and desktop (`DesktopCalculator.js`) layouts that share core calculation logic
- **Clock Face UI**: Interactive SVG visualization in `/src/components/clock/` for selecting retinal detachment areas
- **Form Fields**: Reusable form components that integrate with the calculator's state management

### Key Utilities
- `calculateRisk.js`: Core risk calculation logic implementing the logistic regression model
- `clockFaceUtils.js`: Geometry calculations for clock face interactions
- `formatters.js`: Output formatting for risk percentages and clinical data

### State Management
- Local component state using React hooks
- Shared state passed via props between calculator views and form components
- No external state management library needed

## Testing Approach

The project follows Test-Driven Development (TDD):
1. Tests are written alongside or before implementation
2. Each component has corresponding test files
3. Test utilities in `/src/test-utils/` provide common setup
4. Focus on user interactions and clinical accuracy

## Clinical Models

The calculator implements multiple logistic regression models:
- Model C: Lens Status, Macula, PVR Grade C, Extent
- Model CD: Includes additional PVR Grade D factor
- Model D: Lens Status, PVR Grade C and D, Extent

Risk calculations use coefficients from peer-reviewed research stored in `/src/constants/`.

## Development Workflow

1. Branch from `develop` for new features
2. Write tests first when adding new functionality
3. Ensure all tests pass before committing
4. Update relevant documentation in `/meta/` for significant changes
5. Deploy through `main` branch to GitHub Pages

## Important Notes

- Clock face uses degrees (0-360) for calculations, with 12 o'clock = 90°, 3 o'clock = 0°
- All risk calculations should match the original research papers exactly
- Mobile and desktop views must maintain feature parity
- Preserve existing test coverage when making changes