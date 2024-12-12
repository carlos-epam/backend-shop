const AWS = require('aws-sdk');
const csv = require('csv-parser');

const s3 = new AWS.S3({ region: 'us-east-2'});

module.exports.handler = async (event) => {
  console.log('importFileParser logger  ');

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
      .on('data', (data) => {
        console.log('Parsed row:', JSON.stringify(data));
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