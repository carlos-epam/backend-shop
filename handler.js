const serverless = require("serverless-http");
const express = require("express");
const app = express();
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand, GetCommand, PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-2" });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const AWS = require("aws-sdk");

const s3 = new AWS.S3(({ region: "us-east-2" }));


const productsTable = "products";
const stockTable = "stock";

app.use(express.json());
app.use(cors());

const fetchProducts = async () => {

  try {
    const data = await ddbDocClient.send(new ScanCommand({ TableName: productsTable }));
    return data.Items;
  } catch (err) {
    console.error("Error fetching products:", err);
    throw err;
  }
}


const fetchStock = async () => {

  try {
    const data = await ddbDocClient.send(new ScanCommand({ TableName: stockTable }));
    return data.Items;
  } catch (err) {
    console.error("Error fetching stock:", err);
    throw err;
  }
}

const combineData = (products, stock) => {
  const stockDict = {};
  for (const item of stock) {
    stockDict[item.product_id.S] = parseInt(item.count.N, 10);
  }

  return products.map(product => ({
    id: product.id,
    count: stockDict[product.id] || 0,
    price: product.price,
    title: product.title,
    description: product.description
  }));
}
app.get("/products", async (req, res) => {

  try {
    const products = await fetchProducts();
    const stock = await fetchStock();
    const combinedData = combineData(products, stock);
    res.json(combinedData);
  } catch (err) {
    res.status(500).send("Something went wrong fetching data" + err.message);
  }
});

app.post("/products", async (req, res) => {
  const { title, description, price } = req.body;

  if (!title || !description || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newProduct = {
    id: uuidv4(),
    pk: Date.now(),
    title,
    description,
    price: Number(price)
  };

  const params = {
    TableName: productsTable,
    Item: newProduct
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    const stockParams = {
      TableName: stockTable,
      Item: {
        pk: Date.now(),
        product_id: newProduct.id,
        count: 0
      }
    };

    await ddbDocClient.send(new PutCommand(stockParams));

    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Error creating new product:", err);
    res.status(500).json({ error: "Failed to create product", message: err.message });
  }
})

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

app.get("/imports/:fileName", async (req, res) => {

  try{

  
  const { fileName } = req;
  const filePath = `uploaded/${fileName}`;

  const params = {
    Bucket: "some-b-2345",
    Key: filePath,
    Expires: 60,
    ContentType: 'text/csv'
  };

  const url = await s3.getSignedUrlPromise('putObject', params);

  res.status(200).json({url});
  }catch(err){
    res.status(500).json({message: "Something went wrong generating the signed url: " + JSON.stringify(err) })
  }

})

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

exports.handler = serverless(app);