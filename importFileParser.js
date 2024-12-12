const AWS = require('aws-sdk');
const csv = require('csv-parser');

const s3 = new AWS.S3({ region: 'us-east-2' });
const sqs = new AWS.SQS({ region: 'us-east-2' });

const QUEUE_URL = process.env.SQS_QUEUE_URL; 

module.exports.handler = async (event) => {
  console.log('importFileParser lambda triggered');

  const s3Record = event.Records[0].s3;
  const bucketName = s3Record.bucket.name;
  const objectKey = s3Record.object.key;

  console.log(`Processing file: ${objectKey} from bucket: ${bucketName}`);

  const s3Stream = s3.getObject({
    Bucket: bucketName,
    Key: objectKey
  }).createReadStream();

  return new Promise((resolve, reject) => {
    s3Stream
      .pipe(csv())
      .on('data', async (data) => {
        try {
          await sqs.sendMessage({
            QueueUrl: QUEUE_URL,
            MessageBody: JSON.stringify(data)
          }).promise();
          console.log('Sent message to SQS:', JSON.stringify(data));
        } catch (error) {
          console.error('Error sending message to SQS:', error);
        }
      })
      .on('error', (error) => {
        console.error('Error parsing CSV:', error);
        reject(error);
      })
      .on('end', () => {
        console.log('Finished processing CSV file');
        resolve();
      });
  });
};