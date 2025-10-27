# API Integration Guide

This document describes how to integrate your representatives API with the Find My Rep plugin.

## API Endpoint Configuration

Configure your API endpoint in **WordPress Admin > Settings > Find My Rep**.

## API Request Format

The plugin will make a GET request to your configured API endpoint with the following parameter:

```
GET {your-api-url}?postcode={user-entered-postcode}
```

Example:
```
GET https://api.example.com/representatives?postcode=SW1A1AA
```

## API Response Format

Your API should return a JSON array of representative objects. Each object should include:

- `name` (required): The representative's full name
- `email` (required): The representative's email address
- `title` (optional): The representative's title (e.g., "Member of Parliament")
- `type` (optional): The type of representative (e.g., "MP", "MS", "Councillor", "PCC")

### Example Response

```json
[
  {
    "name": "John Smith",
    "email": "john.smith@parliament.uk",
    "title": "Member of Parliament for Example Constituency",
    "type": "MP"
  },
  {
    "name": "Jane Doe",
    "email": "jane.doe@senedd.wales",
    "title": "Member of the Senedd for Example Region",
    "type": "MS"
  },
  {
    "name": "Robert Johnson",
    "email": "robert.johnson@localcouncil.gov.uk",
    "title": "Councillor for Example Ward",
    "type": "Councillor"
  },
  {
    "name": "Sarah Williams",
    "email": "sarah.williams@police.uk",
    "title": "Police and Crime Commissioner",
    "type": "PCC"
  }
]
```

### Minimal Response

At minimum, your API should return:

```json
[
  {
    "name": "Representative Name",
    "email": "email@example.com"
  }
]
```

## Error Handling

If no representatives are found or an error occurs:

- Return an empty array: `[]`
- Or return an appropriate HTTP error code (404, 500, etc.)

The plugin will display an appropriate error message to the user.

## CORS Configuration

If your API is hosted on a different domain than your WordPress site, ensure that CORS headers are properly configured to allow requests from your WordPress domain.

## Example API Implementations

### PHP Example

```php
<?php
header('Content-Type: application/json');

$postcode = $_GET['postcode'] ?? '';

// Validate postcode
if (empty($postcode)) {
    http_response_code(400);
    echo json_encode(['error' => 'Postcode required']);
    exit;
}

// Fetch representatives (implement your logic here)
$representatives = [
    [
        'name' => 'Example Representative',
        'email' => 'rep@example.com',
        'title' => 'Member of Parliament',
        'type' => 'MP'
    ]
];

echo json_encode($representatives);
```

### Node.js Example

```javascript
const express = require('express');
const app = express();

app.get('/representatives', (req, res) => {
    const postcode = req.query.postcode;
    
    if (!postcode) {
        return res.status(400).json({ error: 'Postcode required' });
    }
    
    // Fetch representatives (implement your logic here)
    const representatives = [
        {
            name: 'Example Representative',
            email: 'rep@example.com',
            title: 'Member of Parliament',
            type: 'MP'
        }
    ];
    
    res.json(representatives);
});

app.listen(3000);
```

## Testing Your Integration

1. Configure your API URL in WordPress admin
2. Add the Find My Rep block to a test page
3. Enter a test postcode
4. Verify that representatives are fetched and displayed correctly
5. Test sending a letter to ensure the Resend integration works

## Resend API Configuration

The plugin uses Resend (https://resend.com) for sending emails. You'll need to:

1. Create a Resend account
2. Generate an API key
3. Configure the API key in WordPress admin under Settings > Find My Rep

### Resend Configuration Requirements

- Verify your sending domain in Resend
- Ensure your API key has permission to send emails
- The "from" email address will be the user's email (must be from a verified domain or use Resend's test email for development)
