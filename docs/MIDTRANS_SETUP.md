# Midtrans Payment Integration - NuViral.cloud

## Overview
Website nuviral.cloud menggunakan Midtrans sebagai payment gateway untuk proses pembayaran subscription.

## Metode Pembayaran yang Didukung
- **Bank Transfer** (BCA, BNI, BRI, Mandiri, Permata)
- **E-Wallet** (GoPay, OVO, Dana, ShopeePay, LinkAja)
- **Kartu Kredit/Debit** (Visa, Mastercard, JCB)
- **Virtual Account**
- **Convenience Store** (Alfamart, Indomaret)
- **QRIS**

## Setup

### 1. Daftar Akun Midtrans
1. Buka https://dashboard.midtrans.com
2. Daftar akun baru atau login
3. Untuk testing, gunakan mode **Sandbox**
4. Untuk production, aktifkan mode **Production**

### 2. Dapatkan API Keys
1. Login ke Midtrans Dashboard
2. Pergi ke **Settings > Access Keys**
3. Catat:
   - **Server Key** (untuk backend)
   - **Client Key** (untuk frontend)
   - **Merchant ID**

### 3. Aktifkan Snap Preferences
1. Di Midtrans Dashboard, pergi ke **Settings > Snap Preferences**
2. Aktifkan metode pembayaran yang diinginkan:
   - Credit Card
   - Bank Transfer (BCA VA, BNI VA, BRI VA, Mandiri Bill, Permata VA)
   - E-Wallet (GoPay, ShopeePay)
   - QRIS
   - Convenience Store (Alfamart, Indomaret)
3. Klik **Save**

### 4. Konfigurasi Environment Variables

#### Backend (.env)
```env
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx    # Sandbox key untuk development
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx    # Sandbox key untuk development
MIDTRANS_IS_PRODUCTION=false               # Set true untuk production
MIDTRANS_MERCHANT_ID=G123456789
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
```

### 5. Setup Webhook (Notification URL)
1. Di Midtrans Dashboard, pergi ke **Settings > Configuration**
2. Set **Payment Notification URL** ke:
   - `https://api.nuviral.cloud/subscription/notification`
   - (TANPA /api/v1 karena endpoint ini di-exclude dari prefix)
3. Set **Recurring Payment Notification URL** ke:
   - `https://api.nuviral.cloud/subscription/notification`
4. Finish/Error/Unfinish redirect sudah dihandle otomatis oleh Snap.js

### 5. Database Migration
```bash
cd prisma
npx prisma migrate dev --name midtrans_integration
```

## Alur Pembayaran

```
1. User klik "Upgrade" di halaman billing
2. Frontend POST /subscription/create-transaction { plan: "PRO" }
3. Backend buat transaksi di Midtrans, return snap token
4. Frontend buka Midtrans Snap popup dengan token
5. User pilih metode pembayaran & bayar
6. Midtrans kirim notification ke /subscription/notification
7. Backend verifikasi signature & aktifkan subscription
8. User redirect ke halaman billing dengan status success
```

## Harga Plan (IDR)

| Plan    | Harga/bulan    |
|---------|----------------|
| Free    | Gratis         |
| Starter | Rp 449.000     |
| Pro     | Rp 1.225.000   |
| Agency  | Rp 3.085.000   |

## API Endpoints

| Method | Endpoint                        | Description                    |
|--------|---------------------------------|--------------------------------|
| GET    | /subscription/current           | Get current subscription       |
| POST   | /subscription/create-transaction| Create payment transaction     |
| POST   | /subscription/notification      | Midtrans webhook notification  |
| GET    | /subscription/status?orderId=x  | Check transaction status       |
| POST   | /subscription/cancel            | Cancel subscription            |
| GET    | /subscription/history           | Get payment history            |

## Testing (Sandbox)

### Kartu Kredit Test
- Number: `4811 1111 1111 1114`
- CVV: `123`
- Exp: Any future date

### Bank Transfer Test
- Gunakan Midtrans Simulator: https://simulator.sandbox.midtrans.com

### GoPay Test
- Scan QR code yang muncul di Midtrans Simulator

## Production Checklist
- [ ] Ganti Server Key & Client Key ke production
- [ ] Set `MIDTRANS_IS_PRODUCTION=true`
- [ ] Set `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=true`
- [ ] Update Notification URL di Midtrans Dashboard
- [ ] Test semua metode pembayaran
- [ ] Setup SSL certificate (wajib untuk production)
- [ ] Verifikasi webhook signature berjalan
