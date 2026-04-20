# 🍽️ Restaurant Management API

A full REST API for restaurant operations built with **Express.js** and **PostgreSQL**.

## Tech Stack
- Node.js + Express.js
- PostgreSQL
- JWT Authentication
- bcryptjs

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create PostgreSQL database
```sql
CREATE DATABASE restaurant_db;
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 4. Run the server
```bash
npm start        # production
npm run dev      # development with nodemon
```

Server runs on **http://localhost:5000**

---

## Project Structure
```
restaurant-api/
├── src/
│   ├── config/
│   │   ├── db.js           # PostgreSQL connection
│   │   └── schema.js       # All table definitions
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── menuController.js
│   │   ├── tableController.js
│   │   ├── orderController.js
│   │   ├── reservationController.js
│   │   ├── inventoryController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   └── auth.js         # JWT + role check
│   ├── routes/
│   │   └── index.js        # All routes
│   └── server.js           # Entry point
├── .env.example
└── package.json
```

---

## API Endpoints

### Auth
| Method | Endpoint             | Access | Description     |
|--------|---------------------|--------|-----------------|
| POST   | /api/auth/register  | Public | Register user   |
| POST   | /api/auth/login     | Public | Login + get JWT |

### Menu
| Method | Endpoint                  | Access | Description         |
|--------|--------------------------|--------|---------------------|
| GET    | /api/menu                | Public | Get available items |
| GET    | /api/menu/all            | Admin  | Get all items       |
| POST   | /api/menu                | Admin  | Add menu item       |
| PUT    | /api/menu/:id            | Admin  | Update item         |
| DELETE | /api/menu/:id            | Admin  | Delete item         |
| GET    | /api/menu/categories     | Public | Get categories      |
| POST   | /api/menu/categories     | Admin  | Add category        |

### Tables
| Method | Endpoint                    | Access | Description          |
|--------|-----------------------------|--------|----------------------|
| GET    | /api/tables                 | Staff  | Get all tables       |
| GET    | /api/tables/available       | Staff  | Get available tables |
| POST   | /api/tables                 | Admin  | Add table            |
| PUT    | /api/tables/:id/status      | Staff  | Update table status  |
| DELETE | /api/tables/:id             | Admin  | Delete table         |

### Orders
| Method | Endpoint                    | Access | Description         |
|--------|-----------------------------|--------|---------------------|
| GET    | /api/orders                 | Staff  | Get all orders      |
| GET    | /api/orders/:id             | Staff  | Get order by ID     |
| POST   | /api/orders                 | Staff  | Place new order     |
| PUT    | /api/orders/:id/status      | Staff  | Update order status |

### Reservations
| Method | Endpoint                          | Access | Description             |
|--------|-----------------------------------|--------|-------------------------|
| GET    | /api/reservations                 | Staff  | Get all reservations    |
| POST   | /api/reservations                 | Staff  | Create reservation      |
| PUT    | /api/reservations/:id/status      | Staff  | Update status           |

### Inventory
| Method | Endpoint                        | Access | Description       |
|--------|---------------------------------|--------|-------------------|
| GET    | /api/inventory                  | Staff  | Get all items     |
| GET    | /api/inventory/low-stock        | Staff  | Get low stock     |
| POST   | /api/inventory                  | Admin  | Add item          |
| PUT    | /api/inventory/:id              | Admin  | Update item       |
| PATCH  | /api/inventory/:id/restock      | Admin  | Add stock         |
| DELETE | /api/inventory/:id              | Admin  | Delete item       |

### Reports (Admin Only)
| Method | Endpoint                    | Description             |
|--------|-----------------------------|-------------------------|
| GET    | /api/reports/daily-sales    | Daily revenue + top items |
| GET    | /api/reports/weekly-sales   | Last 7 days revenue     |
| GET    | /api/reports/stock-alerts   | Low/critical stock      |
| GET    | /api/reports/table-usage    | Revenue per table       |

---

## Example Requests (Bruno / Postman)

### Login
```json
POST /api/auth/login
{
  "email": "admin@restaurant.com",
  "password": "password123"
}
```

### Place Order
```json
POST /api/orders
Authorization: Bearer <token>
{
  "table_id": 1,
  "notes": "No onions please",
  "items": [
    { "menu_item_id": 1, "quantity": 2 },
    { "menu_item_id": 3, "quantity": 1 }
  ]
}
```

### Make Reservation
```json
POST /api/reservations
Authorization: Bearer <token>
{
  "table_id": 2,
  "customer_name": "Ahmad",
  "customer_phone": "0501234567",
  "party_size": 4,
  "reserved_at": "2024-12-25T19:00:00",
  "notes": "Birthday dinner"
}
```

### Daily Sales Report
```
GET /api/reports/daily-sales?date=2024-12-25
Authorization: Bearer <token>
```
