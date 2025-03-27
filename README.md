ATDApp - Next.js Application
⚠️ IMPORTANT WARNING: Google OAuth authentication only works in local development environment. Vercel deployment currently cannot reach the database tables for user creation. Use local development setup for full functionality.

Project Overview
ATDApp is a Next.js application that provides authentication using both traditional email/password and Google OAuth. It integrates with Supabase for authentication and database storage.

Features
Email/Password authentication
Google OAuth integration
User profile management
Dashboard interface
Responsive design
Tech Stack
Frontend: Next.js 14 with App Router
Authentication: Supabase Auth
Database: PostgreSQL via Supabase
ORM: Prisma
Styling: Tailwind CSS
Local Development Setup
Clone the repository:

Install dependencies:

Set up environment variables: Create a .env file in the root directory with the following variables:

Note: Never commit your actual environment values to version control. Contact the project maintainer for the correct values.

Generate Prisma client:

Run the development server:

Access the application: Open http://localhost:3000 in your browser.

Known Issues
Vercel Deployment: Google authentication works partially on Vercel - users are created in Supabase Auth but not in the database tables. This is due to connection restrictions between Vercel and the database.

Workaround: For testing the complete authentication flow, use the local development setup.

Database Configuration
The application uses Prisma ORM to interact with a PostgreSQL database hosted on Supabase.
Database schema includes tables for users, profiles, and sessions.
Authentication Flow
There are two authentication methods available:

Email/Password Authentication
User enters email and password on the sign-in or sign-up page
Credentials are verified against the database
On successful verification, a JWT session is established
For new users, a record is created in the database
Google OAuth Authentication
User initiates Google authentication by clicking the Google button
Supabase handles the OAuth flow with Google
Upon successful OAuth, the callback route creates/updates user record in database
JWT session is established for authenticated users
Troubleshooting
If you encounter issues with authentication:

Check that all environment variables are correctly set
Ensure Supabase project has the correct redirect URLs configured
Verify Google OAuth credentials are properly set up
Check database connection permissions in Supabase settings
Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

This project was bootstrapped with create-next-app and uses the Next.js App Router.
