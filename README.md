# Banking System API

A Node.js-based banking system API that handles multiple banks, users, wallets, and transactions.

## Features

- Multi-bank support with admin accounts
- User account management
- Wallet system with money transfer capabilities
- Transaction history and analytics
- JWT-based authentication
- Role-based access control

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Input validation
- Role-based access control
- Transaction amount limits

## Tech Stack

- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- Express Validator for input validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

```bash
git clone [repository-url]

npm install

cp .env.example .env

```

## Scripts

- `npm run dev` - Start development server


## API Testing Guide

### Base URL: `http://localhost:3000/api`

### Scenario 1: Bank Registration and Login

1. **Register Bank**
```json
POST /banks/register
{
    "name": "Global Bank",
    "bankCode": "GLB001",
    "address": "123 Financial Street, New York, NY 10004",
    "adminEmail": "admin@globalbank.com",
    "adminPassword": "Admin@123"
}
```

2. **Bank Login**
```json
POST /banks/login
{
    "adminEmail": "admin@globalbank.com",
    "adminPassword": "Admin@123"
}
```

### Scenario 2: User Registration and Login

1. **Register User** (Requires Bank Admin Token)
```json
POST /users/register
Headers: {
    "Authorization": "Bearer <bank_token>"
}
Body: {
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "password": "User@123",
    "initialDeposit": 1000
}
```

2. **User Login**
```json
POST /users/login
{
    "email": "john@example.com",
    "password": "User@123"
}
```

### Scenario 3: Wallet Operations

1. **Check Wallet Balance**
```json
GET /wallets/balance
Headers: {
    "Authorization": "Bearer <user_token>"
}
```

2. **Send Money**
```json
POST /wallets/transfer
Headers: {
    "Authorization": "Bearer <user_token>"
}
Body: {
    "beneficiaryPhone": "+1234567891",
    "amount": 500,
    "description": "Lunch payment"
}
```

3. **Get Transaction History**
```json
GET /wallets/transactions?page=1&limit=10
Headers: {
    "Authorization": "Bearer <user_token>"
}
```

### Scenario 4: Bank Admin Operations

1. **Get Bank Analytics**
```json
GET /banks/analytics
Headers: {
    "Authorization": "Bearer <bank_token>"
}
```

2. **Get Bank Users**
```json
GET /admin/users?page=1&limit=10
Headers: {
    "Authorization": "Bearer <bank_token>"
}
```

### Scenario 5: Transaction Filters

```json
GET /wallets/transactions?startDate=2024-11-01&endDate=2024-11-23&type=TRANSFER&minAmount=100&maxAmount=1000
Headers: {
    "Authorization": "Bearer <user_token>"
}
```