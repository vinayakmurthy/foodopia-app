require('dotenv').config();
console.log('Testing environment variables:', {
    AWS_REGION: process.env.AWS_REGION,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'Present' : 'Missing',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'Present' : 'Missing'
});
//testing env