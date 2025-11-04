# TypeScript and React Migration

This document describes the refactoring from vanilla JavaScript to React with TypeScript for the Find My Rep plugin frontend.

## Overview

The frontend has been completely refactored from vanilla JavaScript DOM manipulation to a React-based architecture using TypeScript for type safety.

## Changes Made

### New Files

1. **`tsconfig.json`** - TypeScript configuration
2. **`src/types.ts`** - TypeScript type definitions for data structures
3. **`src/frontend.tsx`** - Main entry point (React)
4. **`src/components/FindMyRepApp.tsx`** - Main application component
5. **`src/components/SelectStep.tsx`** - Representative selection step component
6. **`src/components/CouncillorItem.tsx`** - Councillor display component
7. **`src/components/PCCItem.tsx`** - PCC display component

### Modified Files

1. **`package.json`** - Updated build scripts to handle TypeScript
2. **`package-lock.json`** - Added TypeScript and type definition dependencies
3. **`find-my-rep-plugin.php`** - Simplified PHP render function (React handles the UI)
4. **`build/frontend.js`** - Compiled React/TypeScript bundle
5. **`build/frontend.asset.php`** - Updated dependencies

### Deleted Files

1. **`src/frontend.js`** - Replaced by TypeScript React components

## Architecture

### Component Hierarchy

```
FindMyRepApp (Main orchestrator)
├── PostcodeStep (inline)
├── SelectStep
│   ├── CouncillorItem (for each councillor)
│   └── PCCItem (if PCC exists)
└── LetterStep (inline)
```

### Type Safety

All data structures are now typed:
- `Councillor` interface
- `PCC` interface
- `RepresentativesData` interface
- `GenericRepresentative` interface
- `FindMyRepData` global type

### Data Structure Support

The refactored code maintains support for both:
1. **New nested structure**: `{ postcode, councillors[], pcc }`
2. **Legacy flat array**: `[{ name, email, title, type }]`

## Benefits

1. **Type Safety**: TypeScript catches errors at compile time
2. **Better Code Organization**: Component-based architecture
3. **Easier Maintenance**: React's declarative approach
4. **Improved Developer Experience**: IntelliSense and auto-completion
5. **Modern Stack**: Uses current best practices

## Build Process

The build process now:
1. Compiles TypeScript to JavaScript
2. Bundles React components with webpack
3. Renames output files to maintain compatibility
4. Copies styles to build directory

## Backward Compatibility

- PHP template simplified to render empty container
- React hydrates the container on page load
- All existing functionality preserved
- CSS classes unchanged
- AJAX endpoints unchanged

## Dependencies

New TypeScript-related dependencies:
- `typescript`
- `@types/wordpress__element`
- `@types/wordpress__components`
- `@types/wordpress__i18n`
- `@types/react`
- `@types/react-dom`

## Testing

The refactored code:
- Passes all linting checks
- Builds successfully with webpack
- Maintains all original functionality
- Works with WordPress environment (requires wp-env for full testing)
