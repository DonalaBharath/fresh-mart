# Fresh Mart

Fresh Mart is a full-stack vegetables and fruits ecommerce application built with React, Tailwind CSS, Node.js, Express, and MongoDB.

## Setup Guide

### 1. Backend

1. Open terminal and change directory:
   ```bash
   cd "c:\Users\BHARATH\OneDrive\Desktop\Fresh Vegetables\backend"
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update values:
   ```text
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fresh-mart?retryWrites=true&w=majority
   JWT_SECRET=YourJWTSecret
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```
4. Seed the admin user:
   ```bash
   npm run seed-admin
   ```
5. Start backend:
   ```bash
   npm run dev
   ```

### 2. Frontend

1. Open terminal and change directory:
   ```bash
   cd "c:\Users\BHARATH\OneDrive\Desktop\Fresh Vegetables\frontend"
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update the API URL if needed:
   ```text
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Admin Login Setup

- Email: `admin@freshmart.com`
- Password: `Admin@1234`

## Deployment Notes

- Frontend can be deployed to Vercel or Netlify.
- Backend can be deployed to Render or Railway.
- Use MongoDB Atlas for the database.

## Folder Structure

- `backend/` - Express API, auth, products, orders, user management.
- `frontend/` - Vite React application with Tailwind UI.

## Features Included

- Home page with hero, smooth UI, and responsive layout.
- Customer registration and login pages.
- Admin dashboard layout.
- Product shop page with backend product listing, search, and filters.
- Shopping cart flow with checkout, order summary, and order placement.
- Backend-connected order history and secure auth flows.
- Admin product management and order status update pages.
- Contact page with form layout.
- JWT auth backend and admin seed script.
