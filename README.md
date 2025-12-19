# HLPFL Forms

A powerful, Google Forms-like form builder with comprehensive analytics, built with HLPFL branding and deployed on Cloudflare Pages.

![HLPFL Forms](https://hlpfl.org/logo.svg)

## 🎨 Features

### Form Builder
- **Drag-and-Drop Interface**: Intuitive form creation with visual builder
- **11+ Field Types**: Text, email, phone, URL, number, date, textarea, select, radio, checkbox, file upload
- **Real-Time Preview**: See your form as you build it
- **Field Customization**: Labels, placeholders, validation rules, required/optional
- **Option Management**: Easy management of dropdown, radio, and checkbox options
- **Field Duplication**: Quickly duplicate fields to save time
- **Form Templates**: Start from pre-built templates (coming soon)

### Analytics Dashboard
- **Comprehensive Metrics**: Track views, submissions, conversion rates, and completion times
- **Visual Charts**: Line graphs, bar charts, pie charts, and heat maps
- **Funnel Analysis**: Understand where users drop off
- **Form Comparison**: Compare performance across multiple forms
- **Export Functionality**: Download reports in CSV, JSON, or PDF
- **Date Range Filters**: Analyze data for specific time periods
- **Real-Time Updates**: See submissions as they happen

### Profile Management
- **User Profiles**: Manage personal information and preferences
- **Avatar Upload**: Customize your profile picture
- **Password Management**: Secure password change system
- **API Key Generation**: Generate keys for API access
- **Email Preferences**: Control notification settings
- **Session Management**: View and manage active sessions
- **Activity Logs**: Track your account activity
- **Two-Factor Authentication**: Enhanced security (coming soon)

### Form Embedding
- **JavaScript Embed**: Simple script tag integration
- **iframe Embed**: Isolated form embedding
- **Direct HTML**: Use form action for simple integrations
- **Theme Support**: Dark and light themes
- **Responsive Design**: Works on all devices
- **Style Isolation**: No CSS conflicts with your site
- **CORS Handling**: Automatic cross-origin support

## 🚀 Quick Start

### 1. Create an Account
Visit [https://hlpflforms.pages.dev](https://hlpflforms.pages.dev) and register for a free account.

### 2. Build Your Form
1. Click "Create New Form" from the dashboard
2. Drag and drop fields from the palette
3. Customize field properties in the right panel
4. Preview your form
5. Save and publish

### 3. Embed Your Form
Choose your preferred embedding method:

**JavaScript (Recommended)**
```html
<script src="https://hlpflforms.pages.dev/embed.js" data-form-id="YOUR_FORM_ID"></script>
<div id="hlpfl-form-container"></div>
```

**iframe**
```html
<iframe src="https://hlpflforms.pages.dev/form/YOUR_FORM_ID" width="100%" height="600"></iframe>
```

**Direct HTML**
```html
<form action="https://hlpflforms.pages.dev/api/submit/YOUR_FORM_ID" method="POST">
    <!-- Your form fields -->
</form>
```

## 🎨 HLPFL Branding

HLPFL Forms uses the official HLPFL.org color scheme:

- **Primary Colors**: Copper/Orange gradients (#c87941, #d4945c)
- **Accent Colors**: Red (#FF6B6B), Cyan (#4ECDC4)
- **Dark Theme**: Deep blacks and grays (#0a0a0a, #1a1a1a, #1A1A2E, #16213E)
- **Typography**: System fonts for optimal performance

## 📊 Analytics Features

### Dashboard Overview
- Total forms created
- Total submissions received
- Today's submissions
- Average response rate

### Detailed Analytics
- Submissions over time (line chart)
- Conversion funnel visualization
- Field performance metrics
- Response rate heatmap
- Device and browser breakdown
- Geographic distribution
- Form comparison table

### Export Options
- CSV export for spreadsheet analysis
- JSON export for programmatic access
- PDF reports for presentations

## 🔐 Security & Privacy

- **HTTPS Encryption**: All data transmitted securely
- **GDPR Compliant**: Privacy-first approach
- **No Third-Party Tracking**: Your data stays with you
- **Secure Storage**: Data stored in Cloudflare D1
- **Rate Limiting**: Protection against abuse
- **Session Management**: Secure authentication

## 🛠️ Technical Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Cloudflare Workers (Edge Functions)
- **Database**: Cloudflare D1 (SQLite)
- **Hosting**: Cloudflare Pages
- **Authentication**: JWT tokens
- **Storage**: In-memory (temporary), D1-ready

## 📖 Documentation

- [Embedding Guide](./EMBEDDING_GUIDE.md) - Complete guide to embedding forms
- [API Reference](./API_REFERENCE.md) - API documentation (coming soon)
- [User Guide](./USER_GUIDE.md) - Detailed user documentation (coming soon)

## 🌐 Integration Examples

### WordPress
```php
<?php
// Add to your theme template
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

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- [x] HLPFL branding and color scheme
- [x] User authentication system
- [x] Basic form builder
- [x] Form submission handling

### Phase 2: Enhanced Builder ✅
- [x] Drag-and-drop interface
- [x] 11+ field types
- [x] Field property editor
- [x] Real-time preview
- [x] Field duplication

### Phase 3: Analytics ✅
- [x] Dashboard with key metrics
- [x] Submission tracking
- [x] Visual charts and graphs
- [x] Export functionality
- [x] Form comparison

### Phase 4: Profile & Settings ✅
- [x] User profile management
- [x] Avatar upload
- [x] Password change
- [x] API key generation
- [x] Email preferences
- [x] Session management

### Phase 5: Embedding ✅
- [x] JavaScript embed script
- [x] iframe embedding
- [x] Direct HTML forms
- [x] Theme support
- [x] Style isolation

### Phase 6: Advanced Features (Coming Soon)
- [ ] Form templates library
- [ ] Conditional logic builder
- [ ] Form versioning
- [ ] Webhook integrations
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Team collaboration
- [ ] Custom domains
- [ ] White-label options

## 🤝 Contributing

HLPFL Forms is proprietary software. For feature requests or bug reports, please contact support@hlpfl.org.

## 📄 License

Copyright © 2025 HLPFL. All rights reserved.

## 🆘 Support

- **Documentation**: [https://hlpflforms.pages.dev/docs](https://hlpflforms.pages.dev/docs)
- **GitHub**: [https://github.com/HLPFLCG/hlpflforms](https://github.com/HLPFLCG/hlpflforms)
- **Email**: support@hlpfl.org
- **Website**: [https://hlpfl.org](https://hlpfl.org)

## 🎯 Use Cases

- **Contact Forms**: Simple contact forms for websites
- **Lead Generation**: Capture leads with custom forms
- **Event Registration**: Collect event RSVPs
- **Surveys**: Gather feedback and opinions
- **Applications**: Job applications, membership forms
- **Bookings**: Appointment and reservation forms
- **Feedback**: Customer feedback and reviews
- **Newsletters**: Email list signup forms

## 🌟 Why HLPFL Forms?

1. **Artist-First Philosophy**: Built by HLPFL, for creators
2. **No Hidden Fees**: Transparent pricing, no surprises
3. **Own Your Data**: Complete control over your submissions
4. **Beautiful Design**: HLPFL-branded, professional appearance
5. **Easy Integration**: Works with any website or platform
6. **Powerful Analytics**: Understand your audience
7. **Fast & Reliable**: Built on Cloudflare's global network
8. **Privacy-Focused**: GDPR compliant, no tracking

---

Built with ❤️ by [HLPFL](https://hlpfl.org) - Elevating artists to global recognition