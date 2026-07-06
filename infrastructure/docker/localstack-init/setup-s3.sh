#!/bin/bash
echo "Initializing LocalStack S3..."

# Create bucket if it doesn't exist
awslocal s3api head-bucket --bucket nama-wellness-uploads 2>/dev/null || awslocal s3api create-bucket --bucket nama-wellness-uploads

# Apply CORS policy
cat <<EOF > /tmp/cors.json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
EOF
awslocal s3api put-bucket-cors --bucket nama-wellness-uploads --cors-configuration file:///tmp/cors.json

echo "LocalStack S3 initialization complete."
