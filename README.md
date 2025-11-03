# Find My Rep Plugin

A WordPress plugin that creates a Gutenberg block for contacting local representatives via templated letters sent through Resend.

![Plugin Frontend Preview](https://github.com/user-attachments/assets/2de0914e-01de-46a7-bbba-d1cd7b745ae8)

## Features

- **Gutenberg Block**: Easy-to-use block that can be inserted on any page
- **Representative Lookup**: Search for local representatives by postcode via API
- **Multiple Representative Types**: Supports MPs, MSs, local councillors, and PCCs
- **Customizable Letters**: Admin-defined template letters that users can edit
- **Multi-recipient**: Users can select multiple representatives to contact at once
- **Email Integration**: Sends letters via Resend API

## Installation

1. Upload the plugin folder to `/wp-content/plugins/find-my-rep-plugin/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Configure the plugin settings under Settings > Find My Rep

## Configuration

### Admin Settings

Navigate to **Settings > Find My Rep** to configure:

1. **Representatives API URL**: Enter the API endpoint that returns representative data based on postcode
   - The API should accept a `postcode` query parameter
   - Should return JSON with representative details including: `name`, `email`, `title` or `type`

2. **Resend API Key**: Enter your Resend API key for sending emails

3. **Letter Template**: Define the default letter template
   - Use `{{representative_name}}` as a placeholder for the representative's name
   - Use `{{representative_title}}` as a placeholder for the representative's title

### Example Letter Template

```
Dear {{representative_name}},

I am writing to you as your constituent regarding [issue].

[Your message here]

I would appreciate your support on this matter.

Sincerely,
[User's name will be added automatically]
```

## Usage

### Adding the Block

1. Edit any page or post
2. Click the '+' button to add a new block
3. Search for "Find My Rep Contact Form"
4. Insert the block

### User Experience

1. **Enter Postcode**: Users enter their postcode to find representatives
2. **Select Representatives**: Choose which representatives to contact (MP, MS, councillor, PCC)
3. **Edit Letter**: Review and customize the letter template
4. **Send**: Submit to send letters to all selected representatives

## Development

### Technology Stack

- **TypeScript**: Type-safe development with full type definitions
- **React**: Modern component-based UI framework
- **WordPress Blocks API**: Gutenberg block integration
- **@wordpress/scripts**: Build tooling and linting

### Requirements

- Node.js and npm
- WordPress 5.0+
- PHP 7.0+
- Docker (for running wp-env)

### Building from Source

The plugin is written in TypeScript and React. To build:

```bash
npm install
npm run build
```

This compiles TypeScript/React code to JavaScript bundles in the `build/` directory.

### Development Mode

For hot-reloading during development:

```bash
npm start
```

### Code Architecture

The plugin follows a modern React/TypeScript architecture:

**Source Files (`src/`):**
- `index.tsx` - Gutenberg block registration (editor view)
- `frontend.tsx` - Frontend React app initialization
- `types.ts` - TypeScript type definitions
- `components/` - React components for the frontend UI
  - `FindMyRepApp.tsx` - Main app container with state management
  - `PostcodeStep.tsx` - Postcode input step
  - `SelectStep.tsx` - Representative selection step
  - `LetterStep.tsx` - Letter editing and submission step
  - `LoadingSpinner.tsx` - Loading indicator component

**Build Output (`build/`):**
- `index.tsx.js` - Compiled block editor script
- `frontend.tsx.js` - Compiled frontend React app
- `*.asset.php` - WordPress asset files with dependencies
- `style.css` - Plugin styles

### Linting and Formatting

Run linting checks:

```bash
npm run lint:js
```

Auto-fix linting issues:

```bash
npm run lint:js -- --fix
```

### Running E2E Tests

This plugin includes end-to-end tests using wp-env and Playwright.

#### Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

#### Running Tests

1. Start the WordPress environment:
```bash
npm run env:start
```

2. Run the tests:
```bash
npm run test:e2e
```

3. Run tests in headed mode (see browser):
```bash
npm run test:e2e:headed
```

4. Debug tests:
```bash
npm run test:e2e:debug
```

5. Stop the WordPress environment when done:
```bash
npm run env:stop
```

#### Other wp-env Commands

- Clean all data: `npm run env:clean`
- Access WordPress at: `http://localhost:8888`
- Admin credentials: `admin` / `password`

## API Response Format

The Representatives API should return data in the following format:

```json
[
  {
    "name": "Representative Name",
    "email": "rep@example.com",
    "title": "Member of Parliament",
    "type": "MP"
  },
  {
    "name": "Another Rep",
    "email": "rep2@example.com",
    "title": "Local Councillor",
    "type": "Councillor"
  }
]
```

## License

GPL v2 or later
