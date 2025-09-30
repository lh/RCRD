# RCRD Project Overview

## Project Purpose
RCRD (Retinal Calculator for Retinal Detachment) is a React-based medical calculator designed to help surgeons calculate risk factors for retinal detachment procedures. It features an interactive clock face UI for selecting affected retinal areas and uses evidence-based logistic regression models.

## Tech Stack
- **Framework**: React 18.3.1 with Create React App
- **Testing**: Jest + React Testing Library
- **UI Components**: Custom components with @shadcn/ui
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **Build Tool**: React Scripts 5.0.1
- **Documentation**: JSDoc

## Project Structure
```
RCRD/
├── src/
│   ├── components/          # React components
│   │   ├── __tests__/      # Component test files
│   │   ├── clock/          # Clock face UI components
│   │   └── test-helpers/   # Test utilities
│   ├── constants/          # Constants and configurations
│   ├── utils/             # Utility functions
│   ├── test-utils/        # Testing utilities
│   └── assets/            # Static assets
├── public/                # Public static files
├── docs/                  # Generated documentation
├── meta/                  # Project metadata
└── presentation/          # Presentation materials
```

## Key Features
- Mobile and Desktop responsive layouts
- Interactive clock face for retinal area selection
- Multiple risk calculation models (Model C, CD, D)
- Test-driven development approach
- Comprehensive test coverage