# 🎂 Bolos da Dani — Micro SaaS Bakery

A complete, production-ready bakery e-commerce website built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **PostgreSQL**, and **Prisma ORM**. Ready for deployment on Vercel.

---

## ✨ Features

### Storefront
- 🎨 Beautiful, mobile-first responsive design with custom bakery branding
- 🛍️ Product catalog with categories (Cakes, Savory, Bread, Sweets)
- 🛒 Persistent shopping cart with quantity selectors
- 📦 Real-time cart with item count badge

### Checkout Flow
- 📋 Multi-step checkout (Customer Info → PIX Payment → Confirmation)
- 💸 **PIX payment** with dynamically generated QR Code (EMV spec)
- 📋 PIX Copia e Cola key with one-click copy
- 📤 Receipt upload (drag & drop or click to select)
- ✅ Form validation at every step

### Order Management
- 📱 Automatic WhatsApp message sent to Dani after order
- 🧾 Order confirmation with receipt URL
- 📊 Complete order summary

### Admin Panel (`/admin`)
- 🔐 Secure authentication (NextAuth.js with JWT)
- 📊 Dashboard with sales stats
- 📦 Product CRUD (create, read, update, delete)
- 📋 Order management with status updates
- 💳 PIX key configuration
- 📱 WhatsApp number management

---

## 🛠️ Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | Next.js 14 (App Router)           |
| Language    | TypeScript                        |
| Styling     | Tailwind CSS                      |
| Database    | PostgreSQL                        |
| ORM         | Prisma                            |
| Auth        | NextAuth.js (JWT)                 |
| File Upload | Vercel Blob                       |
| QR Code     | qrcode                            |
| Deployment  | Vercel                            |

---

## 📁 Project Structure

```
bolos-da-dani/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data (products + admin user)
├── src/
│   ├── app/
│   │   ├── page.tsx           # Homepage
│   │   ├── cart/page.tsx      # Shopping cart
│   │   ├── checkout/page.tsx  # Checkout (info + PIX + confirm)
│   │   ├── admin/
│   │   │   ├── login/         # Admin login
│   │   │   ├── dashboard/     # Stats dashboard
│   │   │   ├── orders/        # Order management
│   │   │   ├── products/      # Product CRUD
│   │   │   └── settings/      # PIX + WhatsApp config
│   │   └── api/
│   │       ├── auth/          # NextAuth endpoint
│   │       ├── products/      # Products CRUD API
│   │       ├── orders/        # Orders API
│   │       ├── pix/           # PIX QR Code generation
│   │       ├── upload/        # File upload (Vercel Blob)
│   │       └── admin/settings # Settings API
│   ├── components/
│   │   ├── ui/                # Navbar, Footer
│   │   └── products/          # ProductCard
│   ├── hooks/
│   │   └── useCart.tsx        # Cart context + localStorage
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── auth.ts            # NextAuth config
│   │   └── utils.ts           # Helpers (formatPrice, WhatsApp msg)
│   ├── middleware.ts           # Auth protection for /admin routes
│   └── types/index.ts         # TypeScript types
├── docker-compose.yml
├── Dockerfile
├── vercel.json
└── .env.example
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 20+
- PostgreSQL database (or Docker)

### 1. Clone and Install

```bash
git clone <your-repo>
cd bolos-da-dani
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/bolosdadani"
NEXTAUTH_SECRET="your-super-secret-key"    # generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
BLOB_READ_WRITE_TOKEN=""                    # optional for local dev
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Push schema to database
npm run db:push

# Seed initial data (products + admin user)
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Admin Panel:** [http://localhost:3000/admin](http://localhost:3000/admin)
- Email: `admin@bolosdadani.com`
- Password: `admin123`

---

## 🐳 Docker Setup

```bash
# Start app + PostgreSQL
docker-compose up -d

# Run migrations + seed
docker-compose exec app npx prisma db push
docker-compose exec app npm run db:seed
```

---

## ☁️ Vercel Deployment

### 1. Database

Use any PostgreSQL provider:
- **Vercel Postgres** (recommended — integrates automatically)
- **Neon** (free tier available)
- **Supabase** (free tier available)
- **Railway**

### 2. File Storage

Set up **Vercel Blob** for receipt uploads:
1. In Vercel dashboard → Storage → Create Blob Store
2. Copy the `BLOB_READ_WRITE_TOKEN`

### 3. Deploy

```bash
npm install -g vercel
vercel --prod
```

Set these environment variables in the Vercel dashboard:

| Variable               | Value                        |
|------------------------|------------------------------|
| `DATABASE_URL`         | Your PostgreSQL connection   |
| `NEXTAUTH_SECRET`      | `openssl rand -base64 32`    |
| `NEXTAUTH_URL`         | `https://your-app.vercel.app`|
| `BLOB_READ_WRITE_TOKEN`| From Vercel Blob             |
| `NEXT_PUBLIC_APP_URL`  | `https://your-app.vercel.app`|

### 4. Post-Deploy

```bash
# Run migrations on production DB
vercel env pull .env.production.local
npx prisma db push
npx ts-node prisma/seed.ts
```

---

## 🔑 Admin Setup

After deploying, change your admin credentials:

```bash
# Via Prisma Studio
npm run db:studio
```

Or update in the database directly:
```sql
UPDATE users 
SET password = '$2a$12$...hashed...'  -- use bcrypt hash
WHERE email = 'admin@bolosdadani.com';
```

---

## 💳 PIX Configuration

1. Log in to `/admin`
2. Go to **Configurações**
3. Enter your PIX key (CPF, phone, email, or random key)
4. Enter beneficiary name as registered with your bank
5. Enter your WhatsApp number (format: `5511987654321`)

The QR Code is generated dynamically on every checkout using the **PIX EMV BR Code** specification.

---

## 📱 WhatsApp Integration

When a customer completes checkout, the app:
1. Uploads the payment receipt to Vercel Blob
2. Creates the order in the database
3. Opens WhatsApp Web/App with a pre-filled message containing:
   - Customer name, phone, address
   - Ordered items and quantities
   - Total amount
   - Receipt URL

---

## 🗄️ Database Schema

```
users          — Admin authentication
products       — Product catalog (name, price, image, category)
orders         — Customer orders
order_items    — Line items per order
settings       — App config (PIX key, WhatsApp number)
```

---

## 🔒 Security

- Admin routes protected by NextAuth.js middleware
- Passwords hashed with bcrypt (12 rounds)
- File upload validation (type + size)
- Zod schema validation on all API routes
- Environment variables for all secrets

---

## 📦 Available Scripts

| Script           | Description                    |
|------------------|--------------------------------|
| `npm run dev`    | Start development server       |
| `npm run build`  | Build for production           |
| `npm start`      | Start production server        |
| `npm run db:push`| Push schema to database        |
| `npm run db:migrate` | Run migrations             |
| `npm run db:studio` | Open Prisma Studio          |
| `npm run db:seed`| Seed initial data              |

---

## 🎨 Customization

### Colors (tailwind.config.js)
```js
rose:     '#C9566B'   // Primary accent
cream:    '#FDF6EE'   // Background
espresso: '#2C1810'   // Text
gold:     '#D4A843'   // Highlights
sage:     '#7A9E7E'   // Success states
```

### Adding Products
Use the Admin Panel at `/admin/products` or run `npm run db:seed` after editing `prisma/seed.ts`.

---

## 📄 License

MIT — Built with ❤️ for Bolos da Dani
