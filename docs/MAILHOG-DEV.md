# MailHog Development Setup

This guide explains how to use MailHog for local email testing and development with the Find My Rep plugin.

## What is MailHog?

MailHog is a local email testing tool that captures outgoing emails so you can inspect them without sending real emails. This is perfect for development and testing.

## Installation

### Using Docker (Recommended)

The easiest way to run MailHog is using Docker:

```bash
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

This will:
- Start MailHog in the background
- Expose SMTP server on port 1025
- Expose web UI on port 8025

### Using Homebrew (macOS)

```bash
brew install mailhog
mailhog
```

### Manual Installation

Download from the [MailHog releases page](https://github.com/mailhog/MailHog/releases) and run the binary.

## Configuration

### Option 1: SMTP Transport

To use MailHog with the SMTP transport:

1. **Set Email Transport**: In WordPress admin, go to Settings > Find My Rep and set "Email Transport" to "SMTP (wp_mail)"

2. **Configure WordPress SMTP**: Install and configure an SMTP plugin (like WP Mail SMTP) with these settings:
   - SMTP Host: `localhost` (or `mailhog` if using Docker Compose)
   - SMTP Port: `1025`
   - Encryption: None
   - Authentication: None

3. **Alternative: Configure PHP mail()**: Edit your `php.ini` or use `ini_set()`:
   ```php
   ini_set('SMTP', 'localhost');
   ini_set('smtp_port', '1025');
   ```

### Option 2: Test Transport

The plugin includes a built-in "Test" transport that logs emails to a file:

1. In WordPress admin, go to Settings > Find My Rep
2. Set "Email Transport" to "Test (Log to File)"
3. Emails will be logged to: `wp-content/uploads/find-my-rep-test-mails.log`

### Option 3: Using WP-CLI Filter

For development, you can override the transport using a filter in your `wp-config.php` or a mu-plugin:

```php
add_filter('find_my_rep_email_transport', function($transport) {
    return 'smtp'; // or 'test'
});
```

## Using MailHog

### Accessing the Web UI

Open your browser and navigate to: `http://localhost:8025`

You'll see all captured emails with:
- Sender and recipient information
- Subject lines
- Full email content (text and HTML)
- Headers and raw MIME data

### Viewing Test Logs

If using the "test" transport, view the log file:

```bash
# From your WordPress root
tail -f wp-content/uploads/find-my-rep-test-mails.log
```

Or in WordPress admin, you can use a plugin like "Log Viewer" to inspect the file.

## Docker Compose Example

If you're using Docker Compose for your WordPress development environment, add MailHog:

```yaml
version: '3.8'

services:
  wordpress:
    # ... your WordPress config
    environment:
      - WORDPRESS_CONFIG_EXTRA=define('WP_SMTP_HOST', 'mailhog'); define('WP_SMTP_PORT', 1025);
    depends_on:
      - mailhog

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"
      - "8025:8025"
```

## Testing Email Sending

1. Configure the plugin to use SMTP or test transport
2. Create a test page with the Find My Rep block
3. Enter a postcode, select representatives
4. Fill in your details and click "Send"
5. Check MailHog web UI or the test log file to verify the email was captured

## Benefits of MailHog for Development

- **No Spam**: Never accidentally send test emails to real representatives
- **Instant Inspection**: See emails immediately without checking an inbox
- **Debug Headers**: Inspect all email headers and MIME structure
- **Multiple Messages**: Test bulk sending without flooding a real inbox
- **API Testing**: Use MailHog's API to automate email verification in tests

## Troubleshooting

### Emails Not Appearing

1. **Check MailHog is Running**:
   ```bash
   docker ps | grep mailhog
   ```

2. **Verify Port is Accessible**:
   ```bash
   telnet localhost 1025
   ```

3. **Check WordPress Error Logs**: Look for wp_mail() errors

4. **Enable WP_DEBUG**: Add to `wp-config.php`:
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   ```

### Using with wp-env

If you're using `@wordpress/env` for local development, you can add MailHog to `.wp-env.json`:

```json
{
  "plugins": [ "." ],
  "config": {
    "WP_DEBUG": true
  }
}
```

Then configure SMTP settings manually or via a plugin.

## Production Considerations

**Never use MailHog or test transport in production!**

For production:
1. Use the "Resend API" transport with a valid API key
2. Ensure the transport setting is set to "resend" in the database or admin panel
3. Remove any filter overrides from your code

## Additional Resources

- [MailHog GitHub Repository](https://github.com/mailhog/MailHog)
- [WordPress wp_mail() Documentation](https://developer.wordpress.org/reference/functions/wp_mail/)
- [WP Mail SMTP Plugin](https://wordpress.org/plugins/wp-mail-smtp/)
