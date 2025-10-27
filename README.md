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

### Requirements

- Node.js and npm
- WordPress 5.0+
- PHP 7.0+

### Building from Source

```bash
npm install
npm run build
```

### Development Mode

```bash
npm start
```

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
