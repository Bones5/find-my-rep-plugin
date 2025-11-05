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

Your API should return data in the following format:

```json
{
  "postcode": "SW1A 1AA",
  "councillors": [
    {
      "id": 1,
      "name": "John Smith",
      "party": "Conservative",
      "ward": "St James's",
      "council": "Westminster City Council",
      "email": "john.smith@westminster.gov.uk",
      "phone": "020 7641 6000"
    },
    {
      "id": 2,
      "name": "Jane Doe",
      "party": "Labour",
      "ward": "St James's",
      "council": "Westminster City Council",
      "email": "jane.doe@westminster.gov.uk",
      "phone": "020 7641 6000"
    }
  ],
  "pcc": {
    "id": 1,
    "name": "Sir Mark Rowley",
    "force": "Metropolitan Police",
    "area": "Greater London",
    "email": "mopac@london.gov.uk",
    "website": "https://www.london.gov.uk/mopac"
  },
  "mp": {
    "id": 1,
    "name": "Nickie Aiken",
    "party": "Conservative",
    "constituency": "Cities of London and Westminster",
    "email": "nickie.aiken.mp@parliament.uk",
    "phone": "020 7219 3000",
    "website": "https://www.nickieaiken.org.uk"
  },
  "ms": {
    "id": 1,
    "name": "Joel James",
    "party": "Conservative",
    "constituency": "Cardiff Central",
    "email": "joel.james@senedd.wales",
    "phone": "0300 200 5555",
    "website": "https://www.senedd.wales"
  },
  "areaInfo": {
    "constituency": {
      "id": 65659,
      "name": "Cities of London and Westminster",
      "code": "E14000639"
    },
    "localAuthority": {
      "id": 2247,
      "name": "Westminster",
      "type": "London borough",
      "code": "E09000033"
    },
    "ward": {
      "id": 144393,
      "name": "St James's",
      "type": "London borough ward",
      "code": "E05000644"
    },
    "region": {
      "id": 2247,
      "name": "London",
      "type": "Government Office Region",
      "code": "E12000007"
    }
  }
}
```

**Top-Level Fields:**
- `postcode` (required): The postcode that was queried
- `councillors` (optional): Array of local councillors
- `pcc` (optional): Police and Crime Commissioner (single object)
- `mp` (optional): Member of Parliament (single object)
- `ms` (optional): Member of the Senedd for Wales (single object)
- `areaInfo` (optional): Geographic information about the area

**Councillor Fields:**
- `id` (required): Unique identifier for the councillor
- `name` (required): The councillor's full name
- `party` (required): Political party
- `ward` (required): Electoral ward
- `council` (required): Council name
- `email` (required): Email address
- `phone` (required): Phone number

**PCC Fields:**
- `id` (required): Unique identifier
- `name` (required): Full name
- `force` (required): Police force name
- `area` (required): Area covered
- `email` (required): Email address
- `website` (required): Website URL

**MP Fields:**
- `id` (required): Unique identifier
- `name` (required): Full name
- `party` (required): Political party
- `constituency` (required): Parliamentary constituency
- `email` (required): Email address
- `phone` (required): Phone number
- `website` (required): Website URL

**MS Fields (for Wales):**
- `id` (required): Unique identifier
- `name` (required): Full name
- `party` (required): Political party
- `constituency` (required): Senedd constituency
- `email` (required): Email address
- `phone` (required): Phone number
- `website` (required): Website URL

**AreaInfo Fields:**
- `constituency` (optional): Westminster constituency information
  - `id`: Unique identifier
  - `name`: Constituency name
  - `code`: Official constituency code
- `localAuthority` (optional): Local authority information
  - `id`: Unique identifier
  - `name`: Authority name
  - `type`: Type of authority (e.g., "London borough")
  - `code`: Official authority code
- `ward` (optional): Electoral ward information
  - `id`: Unique identifier
  - `name`: Ward name
  - `type`: Type of ward
  - `code`: Official ward code
- `region` (optional): Regional information
  - `id`: Unique identifier
  - `name`: Region name
  - `type`: Type of region
  - `code`: Official region code

### Minimal Response

At minimum, your API should return the postcode and at least one representative:

```json
{
  "postcode": "SW1A 1AA",
  "mp": {
    "id": 1,
    "name": "Representative Name",
    "party": "Party Name",
    "constituency": "Constituency Name",
    "email": "email@example.com",
    "phone": "020 1234 5678",
    "website": "https://example.com"
  }
}
```

### Backwards Compatibility

The plugin also supports the legacy response format for backwards compatibility:

```json
{
  "geographic_info": {
    "area": "Example Area",
    "ward": "Example Ward",
    "westminster_constituency": "Example Westminster Constituency"
  },
  "representatives": [
    {
      "name": "Representative Name",
      "email": "email@example.com",
      "title": "Representative Title",
      "type": "MP"
    }
  ]
}
```

## Error Handling

If no representatives are found or an error occurs:

- Return an empty representatives array: `{"representatives": []}`
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
