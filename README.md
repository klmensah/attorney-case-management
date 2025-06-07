# Attorney Case Management System

A comprehensive web application for managing legal cases and tasks assigned to attorneys, built with Next.js and designed for deployment on Render's free tier with PlanetScale database.

## Features

- **Case Management**: Create, track, and manage legal cases with detailed information
- **Movement Logging**: Track case movements and actions with detailed logs
- **Email Reminders**: Automatic email alerts for due reminders
- **User Authentication**: Secure login with email-based access requests
- **Comments System**: Add remarks and comments to cases
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PlanetScale (MySQL)
- **Authentication**: JWT with HTTP-only cookies
- **Email**: Nodemailer with SMTP
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PlanetScale account and database
- SMTP email service (Gmail, SendGrid, etc.)

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Copy the environment file:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

4. Configure your environment variables in `.env.local`

5. Run the database scripts to create tables and seed data:
   - Execute the SQL scripts in the `scripts` folder in your PlanetScale database

6. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Deployment on Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set the build command: `npm run build`
4. Set the start command: `npm start`
5. Add all environment variables from your `.env.local`
6. Deploy the application

### Email Reminders

The system includes automatic email reminders. To enable this feature:

1. Set up a cron job or scheduled task to call `/api/cron/send-reminders`
2. Configure your SMTP settings in the environment variables
3. The system will automatically send emails for due reminders

## Usage

### Admin Setup

1. Use the seeded admin account to log in (check the seed data script)
2. Approve user access requests from the admin panel
3. Create and assign cases to attorneys

### User Workflow

1. Request access through the login page
2. Wait for admin approval
3. Log in and start managing cases
4. Create cases, add movements, comments, and set reminders
5. Receive email notifications for due reminders

## Database Schema

The application uses the following main tables:

- `users`: User accounts and authentication
- `cases`: Legal cases and assignments
- `movement_logs`: Case movement tracking
- `case_comments`: Case comments and remarks
- `reminders`: Email reminders and alerts
- `access_requests`: User access requests

## Security Features

- JWT-based authentication with HTTP-only cookies
- Password hashing with bcrypt
- SQL injection protection with parameterized queries
- CSRF protection through SameSite cookies
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
