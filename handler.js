const serverless = require("serverless-http");
const express = require("express");
const app = express();
const cors = require("cors");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-2" });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const productsTable = "products";
const stockTable = "stock";

app.use(express.json());
app.use(cors());

const fetchProductById = async (productId) => {
  const params = {
    TableName: productsTable,
    IndexName: "id-index", 
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": productId
    }
  };

  try {
    const { Items } = await ddbDocClient.send(new QueryCommand(params));
    return Items[0];
  } catch (err) {
    console.error(`Error fetching product with id ${productId}:`, err);
    throw err;
  }
};

const fetchStockByProductId = async (productId) => {
  const params = {
    TableName: stockTable,
    IndexName: "product_id-index",
    KeyConditionExpression: "product_id = :pid",
    ExpressionAttributeValues: {
      ":pid": productId
    }
  };

  try {
    const command = new QueryCommand(params);
    const { Items } = await ddbDocClient.send(command);
    if (Items && Items.length > 0) {
      return Items[0].count;
    }
    return 0;
  } catch (err) {
    console.error(`Error fetching stock for product id ${productId}:`, err);
    throw err;
  }
};

app.get("/products/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await fetchProductById(productId);
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const stockCount = await fetchStockByProductId(productId);

    const combinedProduct = {
      id: product.id,
      pk: product.pk,
      title: product.title,
      description: product.description,
      price: product.price,
      stockCount: stockCount
    };

    res.json(combinedProduct);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong fetching data", message: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

exports.handler = serverless(app);