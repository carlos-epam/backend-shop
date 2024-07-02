const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require('uuid');

const ddbClient = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const productsTable = "products";
const stockTable = "stock";

module.exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const messageBody = JSON.parse(record.body);
    console.log('Processing message:', messageBody);

    try {
      const { title, description, price } = messageBody;

      if (!title || !description || !price) {
        console.error('Missing required fields');
        continue;
      }

      const newProduct = {
        id: uuidv4(),
        pk: Date.now(),
        title,
        description,
        price: Number(price)
      };

      const productParams = {
        TableName: productsTable,
        Item: newProduct
      };

      await ddbDocClient.send(new PutCommand(productParams));

      const stockParams = {
        TableName: stockTable,
        Item: {
          pk: Date.now(),
          product_id: newProduct.id,
          count: 0
        }
      };

      await ddbDocClient.send(new PutCommand(stockParams));

      console.log('Successfully created product:', newProduct.id);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  return { statusCode: 200, body: 'Processed all messages' };
};