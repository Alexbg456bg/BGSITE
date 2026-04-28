# Supabase admin setup

## 1. Create the storage bucket

In Supabase Storage, create a public bucket named:

```text
destination-images
```

## 2. Create the admin data bucket

Create a private bucket named:

```text
admin-data
```

The API stores destination metadata in:

```text
admin-data/admin-destinations.json
```

## 3. Add Vercel environment variables

In Vercel Project Settings -> Environment Variables, add:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=destination-images
SUPABASE_ADMIN_DATA_BUCKET=admin-data
ADMIN_PASSWORD=choose-a-strong-password
```

Use `ADMIN_PASSWORD` to unlock `/admin` on the live site.

## 4. Deploy

Redeploy the Vercel project after adding the variables.
