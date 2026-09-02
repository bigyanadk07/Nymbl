# Nymbl

**Nymbl** is an API subscription and gateway platform that allows users
to discover APIs, subscribe to API packages, make payments, receive API
access tokens, and consume protected APIs through a centralized gateway
with authentication, rate limiting, quota enforcement, and usage
tracking.

> **Project Status:** MVP Complete\
> **Version:** 1.0.0 / MVP\
> **Payment Environment:** eSewa Test Environment

------------------------------------------------------------------------

## Table of Contents

-   [Overview](#overview)
-   [MVP Features](#mvp-features)
-   [User Flow](#user-flow)
-   [Test Accounts](#test-accounts)
-   [eSewa Test Payment](#esewa-test-payment)
-   [Local Development](#local-development)
-   [eSewa Callback with ngrok](#esewa-callback-with-ngrok)
-   [API Access](#api-access)
-   [Usage Tracking and Rate
    Limiting](#usage-tracking-and-rate-limiting)
-   [Personal Settings](#personal-settings)
-   [Project Architecture](#project-architecture)
-   [Technology Stack](#technology-stack)
-   [Security Notes](#security-notes)
-   [Known MVP Limitations](#known-mvp-limitations)
-   [Nymbl 2.0 Roadmap](#nymbl-20-roadmap)
-   [Future Direction](#future-direction)

------------------------------------------------------------------------

## Overview

Nymbl is designed as an API marketplace and API gateway platform.

The MVP demonstrates a complete end-to-end flow:

``` text
User
  ↓
Register / Sign In
  ↓
Browse Packages & APIs
  ↓
Subscribe
  ↓
eSewa Test Payment
  ↓
Subscription Activated
  ↓
Generate API Key
  ↓
Call API through Nymbl Gateway
  ↓
Authentication + Token Validation
  ↓
Rate Limiting
  ↓
Quota Enforcement
  ↓
Usage Tracking
  ↓
Usage & Subscription Dashboard
```

The platform currently includes a working API that can be consumed
through the Nymbl backend without requiring a separate server for each
individual API.

------------------------------------------------------------------------

# MVP Features

## Authentication

Users can:

-   Create a Nymbl account.
-   Sign in to an existing account.
-   Provide a phone number with the `+977` country code.

The phone number is currently collected in preparation for the planned
OTP-based authentication system in Nymbl 2.0.

------------------------------------------------------------------------

## Package and API Discovery

After authentication, users can:

-   View available packages.
-   View available APIs.
-   View API information.
-   Subscribe to available packages.

------------------------------------------------------------------------

## Subscription System

Users can subscribe to an available package.

Subscriptions have states such as:

-   Active
-   Pending
-   Expired

Users can view their subscriptions from the **Subscriptions** section.

------------------------------------------------------------------------

## eSewa Payment Integration

Nymbl currently integrates with the **eSewa test environment**.

A user can:

1.  Select a package.
2.  Start the subscription/payment process.
3.  Complete the payment using eSewa's test credentials.
4.  Return to Nymbl.
5.  Have the subscription activated after successful payment
    verification.

> This project currently uses the eSewa test environment and does not
> represent a production payment integration.

------------------------------------------------------------------------

## API Token Generation

Once a subscription is active, the user can access the **API Tokens**
page.

The current MVP supports:

-   One API token per API.
-   Generating an API key for a subscribed API.
-   Using the generated key to authenticate API requests.

Generated keys currently follow the project's `sk_*****` style.

> Multi-token support for individual APIs is planned for Nymbl 2.0.

------------------------------------------------------------------------

## API Gateway

APIs available through Nymbl are protected by the platform's API
gateway.

Requests are checked for:

-   User access.
-   API subscription status.
-   API token validity.
-   Rate limits.
-   Usage/quota limits.

The gateway acts as the controlled entry point through which users
consume the APIs.

------------------------------------------------------------------------

## Real-Time API Availability

The APIs available in Nymbl are integrated into the backend and can
operate as long as the Nymbl backend is running.

A separate server process is not required for each API currently
included in the project.

Conceptually:

``` text
Nymbl Backend
     │
     ├── Authentication
     ├── Subscriptions
     ├── API Gateway
     ├── Rate Limiter
     ├── Usage Tracking
     │
     └── Available APIs
```

------------------------------------------------------------------------

## Rate Limiting

Each API is protected by rate limiting.

This prevents users from making requests beyond the configured request
limits associated with their access.

Rate limiting is enforced through the API gateway before the request
reaches the API functionality.

------------------------------------------------------------------------

## Usage Tracking

Nymbl tracks API usage for subscribed users.

Users can view:

-   Total API calls.
-   API quota.
-   Used calls.
-   Remaining calls.
-   Usage limits.
-   Active usage days.
-   Usage history.
-   Usage information for individual subscribed APIs.

The platform also provides usage tables for APIs associated with the
user's subscriptions.

------------------------------------------------------------------------

## Usage Overview

The **Usage Overview** section allows users to monitor their API
consumption.

Depending on the subscription/API configuration, users can inspect:

``` text
Used
Limit
Remaining
Active Days
Usage History
```

------------------------------------------------------------------------

## Invoice Page

The MVP includes an Invoice page where users can view brief
invoice/payment information related to their subscriptions.

A full invoice generation and downloadable invoice system is planned for
Nymbl 2.0.

------------------------------------------------------------------------

# User Flow

The complete MVP user journey is:

### 1. Visit Nymbl

The application can be accessed through a hosted deployment or run
locally.

If the hosted deployment is being used, test accounts may already be
available for demonstration purposes.

### 2. Sign In or Create an Account

Users can either:

-   Use one of the provided test accounts.
-   Create their own Nymbl account.

A phone number using the `+977` country code is currently required for
future OTP authentication functionality.

### 3. Browse APIs and Packages

After signing in, users can browse the available APIs and subscription
packages.

### 4. Subscribe

Select a package and begin the subscription process.

### 5. Complete eSewa Test Payment

Use the eSewa test credentials listed below.

### 6. Verify Subscription

After successful payment verification, the subscription becomes active.

### 7. Generate API Key

Navigate to:

``` text
API Tokens
```

Generate the API key for the subscribed API.

### 8. Consume the API

Use the generated API key to access the API through the Nymbl gateway.

### 9. Monitor Usage

The user's API requests are tracked and can be viewed through the usage
sections.

### 10. Manage Subscriptions

Users can view active, pending, and expired subscriptions.

### 11. View Invoice

Users can view brief payment/invoice information.

------------------------------------------------------------------------

# Test Accounts

For a hosted demonstration, the following test accounts may be
available.

### Test User 1

``` text
Email: testuser@gmail.com
Password: testuser123
```

### Test User 2

``` text
Email: johndoe@gmail.com
Password: johndoe123
```

### Test User 3

``` text
Email: alexriley@gmail.com
Password: alexriley123
```

> These credentials are intended only for project demonstration/testing.
> Do not reuse these passwords for real accounts or production systems.

If these accounts are not present in a local database, create a new
account through the registration page or seed the application's test
data according to the project's backend setup.

------------------------------------------------------------------------

# eSewa Test Payment

Nymbl uses the eSewa test environment for development and demonstration.

### Test Credentials

``` text
Test Number: 9806800003
Test Password: Nepal@123
Test OTP: 123456
```

These credentials are for the eSewa test environment only.

------------------------------------------------------------------------

# Local Development

## Prerequisites

Make sure the following are installed:

-   Node.js
-   npm
-   MongoDB
-   Git
-   A modern web browser

For local eSewa callback testing, ngrok is also required.

------------------------------------------------------------------------

## Backend Setup

Navigate to the backend/server directory:

``` bash
cd server
```

Install dependencies:

``` bash
npm install
```

Configure the backend environment variables in:

``` text
.env
```

Start the backend using the project's configured npm script.

The backend is expected to run on:

``` text
http://localhost:5000
```

unless a different port has been configured.

------------------------------------------------------------------------

## Frontend Setup

Navigate to the frontend directory:

``` bash
cd client
```

Install dependencies:

``` bash
npm install
```

Start the development server using the project's configured npm script.

The frontend will normally be available through the Vite development URL
shown in the terminal.

------------------------------------------------------------------------

# eSewa Callback with ngrok

When Nymbl is running locally, eSewa needs to be able to reach the
backend callback endpoint.

A normal URL such as:

``` text
http://localhost:5000
```

cannot be reached directly by an external eSewa service.

For local development, use **ngrok**.

## 1. Install ngrok

Install ngrok through its official distribution or Microsoft Store.

## 2. Start the Backend

Make sure the backend is running on port `5000`.

## 3. Expose the Backend

Run:

``` bash
ngrok http 5000
```

ngrok will provide a public forwarding URL similar to:

``` text
https://example.ngrok-free.app
```

Use the URL provided by ngrok in the relevant eSewa success/failure
callback environment configuration.

For example:

``` env
ESEWA_SUCCESS_URL=https://example.ngrok-free.app/...
ESEWA_FAILURE_URL=https://example.ngrok-free.app/...
```

> Use the exact callback paths expected by the current Nymbl backend
> configuration. Do not copy the example domain above.

## 4. Keep ngrok Running

The ngrok process must remain active while testing the payment flow.

The request path becomes:

``` text
Browser
   ↓
Nymbl Frontend
   ↓
Nymbl Backend
   ↓
eSewa Test Environment
   ↓
ngrok Public URL
   ↓
Nymbl Backend Callback
   ↓
Payment Verification
   ↓
Subscription Activation
```

If eSewa cannot reach the callback URL, the payment flow may not
correctly update the subscription status.

------------------------------------------------------------------------

# API Access

After obtaining an active subscription and generating an API key, the
user can call the corresponding API through the Nymbl API gateway.

A conceptual request looks like:

``` http
GET /api/v1/<api-endpoint>
Authorization: Bearer sk_********
```

or according to the authentication format configured by the current API
gateway.

The generated API key should be treated as a secret.

Do not commit generated keys to Git or expose them publicly.

------------------------------------------------------------------------

# Usage Tracking and Rate Limiting

The API gateway performs the main access-control flow.

Conceptually:

``` text
Incoming API Request
        ↓
Authenticate User / API Key
        ↓
Validate API Access
        ↓
Check Subscription
        ↓
Check Rate Limit
        ↓
Check Usage / Quota
        ↓
Execute API
        ↓
Record Usage
        ↓
Return Response
```

This allows Nymbl to control API access while recording how much each
user consumes.

------------------------------------------------------------------------

# Personal Settings

The MVP contains a **Personal Settings** page.

Currently, this page is primarily a UI implementation and does not
provide complete backend account-management functionality.

The planned Nymbl 2.0 implementation will allow users to actually edit
and persist their personal settings.

------------------------------------------------------------------------

# Project Architecture

The project is broadly separated into frontend and backend components.

``` text
Nymbl
│
├── client/
│   └── React + Vite + TypeScript
│       ├── Authentication
│       ├── Packages
│       ├── Subscriptions
│       ├── API Tokens
│       ├── Dashboard
│       ├── Usage
│       ├── Invoice
│       └── Personal Settings
│
└── server/
    ├── Controllers
    ├── Models
    ├── Middleware
    ├── Routes
    ├── Services
    ├── Jobs
    ├── Configuration
    └── API Gateway
```

The backend contains the core business logic for authentication,
subscriptions, payments, API access, rate limiting, and usage tracking.

------------------------------------------------------------------------

# Backend .env Structure (To run it locally)

# Server
PORT=5000

# Database
MONGO_URI=

# Authentication
JWT_SECRET=

# eSewa
ESEWA_BASE_URL=
ESEWA_PRODUCT_CODE=
ESEWA_SECRET_KEY=

# eSewa Callback URLs
ESEWA_SUCCESS_URL=
ESEWA_FAILURE_URL=

------------------------------------------------------------------------

# Technology Stack

## Frontend

-   React
-   TypeScript
-   Vite
-   Tailwind CSS
-   Lucide React

## Backend

-   Node.js
-   Express.js
-   MongoDB
-   Mongoose
-   JWT-based authentication

## Payment

-   eSewa Test Environment

## Development / Testing

-   Postman
-   ngrok

------------------------------------------------------------------------

# Known MVP Limitations

The following are intentionally left for future development:

-   Personal Settings are currently UI-only.
-   The analytics line graph is partially incomplete/broken.
-   Only one API token per API is currently supported.
-   Invoice functionality is currently basic.
-   OTP authentication is not yet implemented.
-   There is no full RBAC/admin system yet.
-   API registration is not yet available through an administrator
    interface.
-   Package/API combination management is limited.
-   Only the currently configured billing plan is available.
-   The project is using eSewa's test environment rather than production
    payment processing.

These limitations do not prevent the core MVP flow from functioning.

------------------------------------------------------------------------

# Nymbl 2.0 Roadmap

The following features are planned for Nymbl 2.0.

## Authentication & User Management

### OTP-Based Authentication

Implement OTP verification for user authentication using the phone
number collected during registration.

------------------------------------------------------------------------

### Editing Personal Settings

Allow users to actually update and persist:

-   Personal information
-   Account information
-   Password
-   Notification preferences
-   Other account settings

------------------------------------------------------------------------

### User Verification Through Admins

Introduce an administrative verification process where administrators
can review and verify users.

------------------------------------------------------------------------

## Administration

### RBAC / Admin Control

Introduce Role-Based Access Control.

Potential roles include:

``` text
User
Admin
```

The system can later be extended to support additional roles such as API
providers.

Admin functionality may eventually include:

-   User management
-   User verification
-   API management
-   Package management
-   Subscription monitoring
-   Payment monitoring
-   Usage monitoring

------------------------------------------------------------------------

### API Registration Through Admin

Allow authorized administrators to register and manage APIs directly
from an administrative dashboard.

Potential API configuration could include:

-   API name
-   Description
-   Endpoint
-   Authentication requirements
-   Rate limits
-   Usage limits
-   Status
-   Package availability

------------------------------------------------------------------------

## API Access

### Multi-Token Based API

Allow users to create multiple API tokens for the same API.

For example:

``` text
Production Key
Development Key
Testing Key
```

Users should eventually be able to:

-   Create tokens
-   Name tokens
-   Revoke tokens
-   Regenerate tokens
-   View token creation information
-   Monitor token usage

------------------------------------------------------------------------

## Analytics

### Full-Fledged Analytics Dashboard

Expand the current usage dashboard into a complete analytics system.

Potential metrics include:

-   Total requests
-   Successful requests
-   Failed requests
-   Error rate
-   Requests over time
-   API usage by day/week/month
-   Most-used APIs
-   Usage by API token
-   Rate-limit events
-   Remaining quota
-   Response-time metrics

------------------------------------------------------------------------

## Billing

### Proper Invoice Generation System

Implement a complete invoice system with:

-   Unique invoice numbers
-   Customer information
-   Package information
-   Payment information
-   Billing period
-   Amount
-   Payment status
-   Issue date
-   Downloadable invoices
-   PDF generation

------------------------------------------------------------------------

### Additional Billing Plans

Expand beyond the current monthly billing model.

Potential options:

``` text
Monthly
Quarterly
Yearly
```

Different plans can provide different limits, APIs, and pricing.

------------------------------------------------------------------------

## Packages

### Actual Package-Based API Combos

Introduce meaningful API bundles.

For example:

``` text
Starter Package
├── API A
├── API B
└── API C

Developer Package
├── API A
├── API B
├── API C
├── API D
└── API E
```

Each package can define:

-   Included APIs
-   Price
-   Billing period
-   Request quota
-   Rate limits
-   Features

------------------------------------------------------------------------

# Potential Future Enhancements

Beyond Nymbl 2.0, the platform could eventually evolve into a larger API
marketplace.

Possible future features include:

-   API provider accounts
-   API provider dashboards
-   Revenue sharing
-   API versioning
-   API health monitoring
-   API documentation portal
-   Interactive API testing / "Try it" functionality
-   Webhooks
-   Custom rate limits
-   Usage-based billing
-   Enterprise plans
-   API SLA monitoring
-   API search and discovery
-   API ratings and reviews
-   API deprecation management

These are not part of the current MVP or Nymbl 2.0 scope and can be
considered longer-term possibilities.

------------------------------------------------------------------------

# Development Philosophy

Nymbl is being developed incrementally:

``` text
Nymbl MVP
   ↓
Validate the complete product flow
   ↓
Production Readiness
   ↓
Nymbl 2.0
   ↓
Administration + Marketplace Features
   ↓
Nymbl 3.0+
   ↓
Provider / Commercial Platform
```

The goal of the MVP is not to implement every possible feature. It is to
demonstrate that the fundamental API subscription and consumption
lifecycle works from beginning to end.

------------------------------------------------------------------------

# Current Status

**Nymbl MVP is complete.**

The current implementation successfully demonstrates:

-   User registration
-   User authentication
-   Package discovery
-   API discovery
-   Subscription creation
-   eSewa test payment
-   Subscription activation
-   API token generation
-   Protected API access
-   API gateway
-   Rate limiting
-   Usage tracking
-   Usage history
-   API-specific usage tables
-   Subscription management
-   Invoice viewing
-   Personal Settings UI

The next major phase is **production hardening, testing, deployment,
documentation, and eventually Nymbl 2.0 development.**

------------------------------------------------------------------------

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
