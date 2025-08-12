# Setup Supabase untuk Project Absensi Siswa

## 1. Setup Project Supabase

1. **Buat project baru di [supabase.com](https://supabase.com)**
2. **Pilih region yang terdekat** (misalnya Asia Southeast - Singapore)
3. **Catat Project URL dan anon key**

## 2. Konfigurasi Environment Variables

Update file `.env.local` dengan credentials Supabase Anda:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Setup Database Schema

1. **Buka SQL Editor di Supabase Dashboard**
2. **Copy dan paste isi file `supabase-schema.sql`**
3. **Jalankan query untuk membuat tabel dan policies**

## 4. Setup Authentication

1. **Buka Authentication > Settings di Supabase Dashboard**
2. **Enable Email confirmations** (opsional untuk development)
3. **Set Site URL** ke `http://localhost:3000` (untuk development)
4. **Tambahkan redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`

## 5. Setup Row Level Security (RLS)

RLS sudah dikonfigurasi di schema SQL dengan policies berikut:

### Users Table
- Users hanya bisa lihat dan update profile mereka sendiri
- Admins bisa lihat, update, insert, dan delete semua users

### Attendance Table
- Students hanya bisa lihat dan insert attendance mereka sendiri
- Admins bisa manage semua attendance records

### School Locations Table
- Semua users bisa lihat school locations
- Hanya admins yang bisa manage school locations

## 6. Testing Setup

1. **Jalankan project**: `npm run dev`
2. **Buka browser** ke `http://localhost:3000`
3. **Test signup/signin** dengan email dan password
4. **Check database** di Supabase Dashboard untuk memastikan data tersimpan

## 7. Troubleshooting

### Error: "Invalid JWT"
- Pastikan environment variables sudah benar
- Restart development server setelah update `.env.local`

### Error: "RLS policy violation"
- Pastikan user sudah login
- Check role user (admin/student)
- Verify RLS policies sudah ter-apply

### Error: "Table doesn't exist"
- Jalankan schema SQL di Supabase
- Refresh database view di dashboard

## 8. Production Deployment

1. **Update environment variables** dengan production Supabase project
2. **Update Site URL** di Authentication settings
3. **Update redirect URLs** dengan domain production
4. **Test semua fitur** sebelum deploy

## 9. Security Best Practices

- **Jangan expose service_role key** di frontend
- **Gunakan RLS policies** untuk data access control
- **Validate input** di frontend dan backend
- **Monitor logs** di Supabase Dashboard

## 10. Backup dan Recovery

- **Export schema** secara berkala
- **Backup data** menggunakan Supabase CLI
- **Test restore process** di environment development

## Struktur Database

### Users Table
```sql
- id (UUID, Primary Key)
- email (TEXT, Unique)
- name (TEXT)
- role (admin/student)
- student_id (TEXT, Optional)
- face_descriptor (NUMERIC[])
- enrolled_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Attendance Table
```sql
- id (UUID, Primary Key)
- student_id (UUID, Foreign Key)
- student_name (TEXT)
- timestamp (TIMESTAMP)
- latitude (NUMERIC)
- longitude (NUMERIC)
- status (present/late/absent)
- method (face/manual)
- distance (NUMERIC, Optional)
- notes (TEXT, Optional)
- created_at (TIMESTAMP)
```

### School Locations Table
```sql
- id (UUID, Primary Key)
- name (TEXT)
- latitude (NUMERIC)
- longitude (NUMERIC)
- radius (NUMERIC)
- created_at (TIMESTAMP)
```

## API Endpoints

Semua operasi database dilakukan melalui Supabase client:

```typescript
import { supabase } from '@/lib/supabase'

// Contoh queries
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('role', 'student')
```

## Support

Jika ada masalah dengan setup, cek:
1. **Supabase Documentation**: https://supabase.com/docs
2. **Supabase Community**: https://github.com/supabase/supabase/discussions
3. **Project Issues**: Buat issue di repository ini 