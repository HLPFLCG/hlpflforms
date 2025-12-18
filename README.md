# HLPFL Forms - Professional Form Builder

A complete form builder application with user authentication, custom form creation, data collection, and analytics.

## Features

✅ **User Authentication**
- Secure login and registration
- JWT-based authentication
- Password hashing

✅ **Form Builder**
- Multiple field types (text, email, phone, textarea, select, checkbox, radio, file upload)
- Custom field labels and placeholders
- Field validation rules
- Form styling customization

✅ **Data Management**
- Store all form submissions
- User-specific databases per form
- Admin access to all data
- Export functionality (CSV, JSON)

✅ **Analytics Dashboard**
- Track form views
- Track submissions
- Conversion rates
- Date range filtering

✅ **HLPFL Branding**
- Matches hlpfl.org design
- Professional black/white theme
- Mobile responsive
- Custom styling options

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/HLPFLCG/hlpflforms.git
cd hlpflforms
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Database
```bash
# Create D1 database
wrangler d1 create hlpflforms

# Update wrangler.toml with your database_id

# Initialize database schema
npm run db:init
```

### 4. Deploy to Cloudflare Pages
```bash
npm run deploy
```

## Project Structure

```
hlpflforms/
├── public/              # Static assets
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files
│   ├── index.html      # Landing page
│   ├── login.html      # Login page
│   ├── register.html   # Registration page
│   └── dashboard.html  # User dashboard
├── functions/          # Cloudflare Pages Functions
│   └── _middleware.js  # API routes and authentication
├── schema.sql          # Database schema
├── wrangler.toml       # Cloudflare configuration
└── package.json        # Dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login to account

### Forms (Protected)
- `GET /api/forms` - Get user's forms
- `POST /api/forms` - Create new form
- `GET /api/forms/:id` - Get form details
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form

### Submissions (Public)
- `POST /api/submit/:formId` - Submit form data

### Dashboard (Protected)
- `GET /api/dashboard/stats` - Get user statistics

## Integration Example

```html
<form action="https://hlpflforms.pages.dev/api/submit/YOUR_FORM_ID" method="POST">
    <input type="text" name="name" placeholder="Name" required>
    <input type="email" name="email" placeholder="Email" required>
    <textarea name="message" placeholder="Message" required></textarea>
    <button type="submit">Submit</button>
</form>
```

## Development

```bash
# Start local development server
npm run dev

# Deploy to production
npm run deploy
```

## License

MIT License - HLPFL Records

## Support

For support, email support@hlpfl.org