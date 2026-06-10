# Aurem Frontend

## Overview

Aurem is a role-based web platform built using React, TypeScript, AWS, and PostgreSQL.

This repository contains the frontend application responsible for:

* User authentication
* Role-based navigation
* Application workflows
* User experience and interface rendering
* Communication with backend APIs

The frontend consumes services exposed through Amazon API Gateway and AWS Lambda.

---

## Technology Stack

### Frontend

* React
* TypeScript
* Vite

### Backend

* AWS Lambda
* Amazon API Gateway
* Amazon Cognito
* Amazon RDS PostgreSQL

### Shared Components

The Aurem platform maintains a separate Common Repository which serves as the source of truth for shared assets across applications.

Planned shared assets include:

* Shared TypeScript types
* API contracts
* Common constants
* Validation utilities
* Backend helper libraries
* AWS Lambda Layer packages

---

## Repository Structure

```text
src/
├── api/
├── assets/
├── components/
├── hooks/
├── layouts/
├── pages/
├── services/
├── types/
├── utils/
└── App.tsx
```

### Folder Responsibilities

| Folder     | Purpose                              |
| ---------- | ------------------------------------ |
| api        | API request definitions and clients  |
| assets     | Images, icons, and static assets     |
| components | Reusable UI components               |
| hooks      | Custom React hooks                   |
| layouts    | Shared page layouts                  |
| pages      | Route-level pages                    |
| services   | Authentication and business services |
| types      | Frontend-specific types              |
| utils      | Utility and helper functions         |

---

## Local Development

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## Branch Strategy

### Main

Production-ready code.

### Dev

Integration branch for completed features.

### Feature Branches

All development work is performed in feature branches and merged into Dev through Pull Requests.

Examples:

```text
feature/authentication
feature/dashboard
feature-user-management
```

---

## Current Milestone

### Week 3 - Authentication Foundation

Objectives:

* Frontend application scaffold
* Cognito authentication integration
* Login page
* Welcome page
* Backend API integration
* Shared type contract establishment with Common Repository

---

## Future Roadmap

* Role-based authorization
* Dashboard framework
* User management
* Workflow engine
* Notifications
* Reporting
* Administrative tooling

---

## Architecture

```text
React Frontend
        │
        ▼
Amazon Cognito
        │
        ▼
Amazon API Gateway
        │
        ▼
AWS Lambda
        │
        ▼
Amazon RDS PostgreSQL
```

Authentication is handled through Amazon Cognito. Application data is retrieved through authenticated API Gateway endpoints backed by AWS Lambda functions.
