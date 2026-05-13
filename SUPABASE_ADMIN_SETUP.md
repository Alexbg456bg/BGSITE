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

Destination ratings are stored in:

```text

admin-data/destination-ratings.json
```

Visitor analytics are stored in:

```text
admin-data/site-analytics.json
```

## 3. Add Vercel environment variables

In Vercel Project Settings -> Environment Variables, add:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=destination-images
SUPABASE_ADMIN_DATA_BUCKET=admin-data
SUPABASE_RATINGS_DATA_PATH=destination-ratings.json
SUPABASE_ANALYTICS_DATA_PATH=site-analytics.json
ADMIN_PASSWORD=choose-a-strong-password
GITHUB_SYNC_TOKEN=your-github-token
GITHUB_REPO_OWNER=Alexbg456bg
GITHUB_REPO_NAME=BGSITE
GITHUB_SYNC_BRANCH=main
GITHUB_SYNC_PATH=src/data/adminDestinations.json
```

Use `ADMIN_PASSWORD` to unlock `/admin` on the live site.
If the GitHub variables are set, every admin save/delete also syncs
`src/data/adminDestinations.json` in the repository.

## 4. Deploy

Redeploy the Vercel project after adding the variables.
