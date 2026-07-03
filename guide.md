# Testing Nama Wellness Locally in VS Code

This guide will walk you through spinning up the entire stack (Database, Redis, AWS LocalStack, API, and Web App) right from VS Code, and how to verify the new Sprint B Phase 1 features.

## 1. Start Infrastructure (Docker)
Ensure Docker Desktop is running on your machine.
In a new VS Code terminal (`Ctrl + ~`), run:
```bash
docker-compose up -d
```
This starts:
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **LocalStack (S3)**: `localhost:4566`

## 2. Environment Variables
Make sure your `.env` files are correctly set up. You can use the `.env.example` at the root as a reference. The key variables for this phase are:
- `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nama_dev?schema=public"`
- `REDIS_URL="redis://localhost:6379"`
- `AWS_ENDPOINT_URL="http://localhost:4566"`
- `AWS_S3_BUCKET_NAME="nama-wellness-uploads"`

## 3. Database Setup
Since we added new tables (Categories, TeacherApplications, etc.), make sure the database is up to date:
```bash
pnpm --filter @nama/prisma run prisma db push
```

*(Optional)* If you need an admin user, register a new account on the frontend and then manually promote them in the database using Prisma Studio:
```bash
pnpm --filter @nama/prisma run prisma studio
```
In Prisma Studio (http://localhost:5555), find your user and change their active role to `ADMIN`, and ensure `ADMIN` is in their `roles` array.

## 4. LocalStack S3 Bucket Creation
LocalStack doesn't create buckets automatically on startup unless configured. You need to create the `nama-wellness-uploads` bucket before uploading files.
Since you don't have AWS CLI installed, you can use Docker exec to run it inside the LocalStack container:
```bash
# S3 Configuration
docker exec nama-localstack awslocal s3 mb s3://nama-wellness-uploads

# Important: Setup CORS to allow browser uploads from localhost:3000
echo '{"CORSRules":[{"AllowedHeaders":["*"],"AllowedMethods":["GET","PUT","POST","DELETE","HEAD"],"AllowedOrigins":["*"],"ExposeHeaders":["ETag"]}]}' > cors.json
docker cp cors.json nama-localstack:/tmp/cors.json
docker exec nama-localstack awslocal s3api put-bucket-cors --bucket nama-wellness-uploads --cors-configuration file:///tmp/cors.json
```

## 5. Start the Development Servers
In your VS Code terminal, start the monorepo dev servers:
```bash
pnpm dev
```
This will start both:
- **API Server**: http://localhost:4000
- **Web App**: http://localhost:3000

## 6. How to Test the Flows

### A. Category Management (Admin Flow)
1. Go to http://localhost:3000 and log in with an **Admin** account.
2. Navigate to **Admin Dashboard > Categories** (`/admin/categories`).
3. Click **Add Category**, fill in details like "Yoga" and save.
4. Verify the category appears in the list and shows up dynamically on the public landing page (`/`).

### B. Teacher Application & S3 Upload (Teacher Flow)
1. Log out, and register a new account choosing the **Teacher** role.
2. Navigate to `/teacher/apply`.
3. You will see your application is in `DRAFT` status.
4. Upload a dummy image or PDF for your **Government ID**. The UI will generate a presigned URL from the API and upload it directly to LocalStack S3.
5. Once uploaded, the **Submit Application** button will enable. Click it to submit. Your status will change to `PENDING`.

### C. Teacher Application Review (Admin Flow)
1. Log back in with your **Admin** account.
2. Navigate to **Admin Dashboard > Teacher Apps** (`/admin/teacher-applications`).
3. You should see the pending application from the teacher.
4. Click **Approve** or **Reject**. If you reject, a prompt will ask for a reason.
5. The status will update in the database!

## Troubleshooting
- If you see `Connection Refused` on file uploads, ensure LocalStack is running and you have created the bucket (Step 4).
- If the frontend fails to fetch data, check the terminal running `pnpm dev` for API error logs.
