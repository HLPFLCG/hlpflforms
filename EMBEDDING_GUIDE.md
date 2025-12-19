# HLPFL Forms - Embedding Guide

## Overview
HLPFL Forms provides multiple ways to embed your forms into any website. This guide covers all embedding methods and customization options.

## Method 1: JavaScript Embed (Recommended)

### Basic Usage
Add these two lines to your HTML where you want the form to appear:

```html
<script src="https://hlpflforms.pages.dev/embed.js" data-form-id="YOUR_FORM_ID"></script>
<div id="hlpfl-form-container"></div>
```

### Custom Container
Specify a custom container ID:

```html
<script src="https://hlpflforms.pages.dev/embed.js" 
        data-form-id="YOUR_FORM_ID" 
        data-container="my-custom-container"></script>
<div id="my-custom-container"></div>
```

### Theme Options
Choose between dark and light themes:

```html
<!-- Dark Theme (Default) -->
<script src="https://hlpflforms.pages.dev/embed.js" 
        data-form-id="YOUR_FORM_ID" 
        data-theme="dark"></script>

<!-- Light Theme -->
<script src="https://hlpflforms.pages.dev/embed.js" 
        data-form-id="YOUR_FORM_ID" 
        data-theme="light"></script>
```

## Method 2: iframe Embed

### Basic iframe
```html
<iframe 
    src="https://hlpflforms.pages.dev/form/YOUR_FORM_ID" 
    width="100%" 
    height="600" 
    frameborder="0"
    style="border: none; border-radius: 12px;">
</iframe>
```

### Responsive iframe
```html
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
    <iframe 
        src="https://hlpflforms.pages.dev/form/YOUR_FORM_ID" 
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 12px;">
    </iframe>
</div>
```

## Method 3: Direct HTML Form

### Using Form Action
```html
<form action="https://hlpflforms.pages.dev/api/submit/YOUR_FORM_ID" method="POST">
    <input type="text" name="name" placeholder="Your Name" required>
    <input type="email" name="email" placeholder="Your Email" required>
    <textarea name="message" placeholder="Your Message" required></textarea>
    <button type="submit">Submit</button>
</form>
```

### With AJAX
```html
<form id="myForm">
    <input type="text" name="name" placeholder="Your Name" required>
    <input type="email" name="email" placeholder="Your Email" required>
    <textarea name="message" placeholder="Your Message" required></textarea>
    <button type="submit">Submit</button>
</form>

<script>
document.getElementById('myForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('https://hlpflforms.pages.dev/api/submit/YOUR_FORM_ID', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('Form submitted successfully!');
            e.target.reset();
        } else {
            alert('Submission failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});
</script>
```

## Customization

### CSS Customization
Override default styles by targeting HLPFL classes:

```css
/* Customize form container */
.hlpfl-form {
    max-width: 800px;
    margin: 0 auto;
}

/* Customize submit button */
.hlpfl-form-submit {
    background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
}

/* Customize input fields */
.hlpfl-form-input,
.hlpfl-form-textarea,
.hlpfl-form-select {
    border-radius: 4px;
    font-size: 16px;
}
```

### JavaScript Events
Listen to form events:

```javascript
// Listen for successful submission
window.addEventListener('hlpfl-form-success', (e) => {
    console.log('Form submitted:', e.detail);
    // Your custom logic here
});

// Listen for submission errors
window.addEventListener('hlpfl-form-error', (e) => {
    console.error('Form error:', e.detail);
    // Your custom error handling
});
```

## Integration Examples

### WordPress
Add to your theme's template or use a custom HTML block:

```php
<?php
// In your theme template
?>
<script src="https://hlpflforms.pages.dev/embed.js" data-form-id="YOUR_FORM_ID"></script>
<div id="hlpfl-form-container"></div>
```

### React
```jsx
import { useEffect } from 'react';

function ContactForm() {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://hlpflforms.pages.dev/embed.js';
        script.setAttribute('data-form-id', 'YOUR_FORM_ID');
        document.body.appendChild(script);
        
        return () => {
            document.body.removeChild(script);
        };
    }, []);
    
    return <div id="hlpfl-form-container"></div>;
}
```

### Vue.js
```vue
<template>
    <div id="hlpfl-form-container"></div>
</template>

<script>
export default {
    mounted() {
        const script = document.createElement('script');
        script.src = 'https://hlpflforms.pages.dev/embed.js';
        script.setAttribute('data-form-id', 'YOUR_FORM_ID');
        document.body.appendChild(script);
    }
}
</script>
```

### Next.js
```jsx
import { useEffect } from 'react';
import Script from 'next/script';

export default function ContactPage() {
    return (
        <>
            <Script 
                src="https://hlpflforms.pages.dev/embed.js" 
                data-form-id="YOUR_FORM_ID"
            />
            <div id="hlpfl-form-container"></div>
        </>
    );
}
```

## Testing on hlpfl.info

To test your embedded form on hlpfl.info:

1. Get your form ID from the HLPFL Forms dashboard
2. Add the embed code to your hlpfl.info page
3. Verify the form loads and submits correctly
4. Check that styling matches your site design

Example test page:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Form Test - hlpfl.info</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
    </style>
</head>
<body>
    <h1>Contact Us</h1>
    <p>Fill out the form below to get in touch.</p>
    
    <script src="https://hlpflforms.pages.dev/embed.js" data-form-id="YOUR_FORM_ID"></script>
    <div id="hlpfl-form-container"></div>
</body>
</html>
```

## Security & Privacy

### CORS Configuration
HLPFL Forms automatically handles CORS for form submissions from any domain.

### Data Protection
- All submissions are encrypted in transit (HTTPS)
- No third-party tracking scripts
- GDPR compliant
- Data stored securely in Cloudflare D1

### Spam Protection
- Rate limiting on submissions
- Honeypot fields (optional)
- reCAPTCHA integration (coming soon)

## Troubleshooting

### Form Not Loading
1. Check that the form ID is correct
2. Verify the container element exists
3. Check browser console for errors
4. Ensure JavaScript is enabled

### Styling Issues
1. Check for CSS conflicts with your site
2. Use browser dev tools to inspect elements
3. Override styles with more specific selectors
4. Consider using iframe embed for complete isolation

### Submission Failures
1. Check network tab for API errors
2. Verify form fields match expected format
3. Check for CORS issues (should be automatic)
4. Contact support if issues persist

## API Reference

### Submission Endpoint
```
POST https://hlpflforms.pages.dev/api/submit/{formId}
Content-Type: application/json

{
    "field_id_1": "value1",
    "field_id_2": "value2"
}
```

### Response Format
```json
{
    "success": true,
    "message": "Submission received",
    "submissionId": "sub_123456"
}
```

## Support

For additional help:
- Documentation: https://hlpflforms.pages.dev/docs
- GitHub: https://github.com/HLPFLCG/hlpflforms
- Email: support@hlpfl.org

## License

HLPFL Forms is proprietary software owned by HLPFL.