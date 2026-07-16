
const S3_ENDPOINT = 'https://yyntktqbbyjcrtfaulkw.storage.supabase.co/storage/v1/s3';
const BUCKET_NAME = 'nama-media';
const key = 'categories/icons/test.png';
let fileUrl = S3_ENDPOINT + '/' + BUCKET_NAME + '/' + key;
if (S3_ENDPOINT.includes('.supabase.co') && S3_ENDPOINT.includes('/storage/v1/s3')) {
  const publicEndpoint = S3_ENDPOINT.replace(/\/storage\/v1\/s3\/?$/, '/storage/v1/object/public');
  fileUrl = publicEndpoint + '/' + BUCKET_NAME + '/' + key;
}
console.log(fileUrl);

