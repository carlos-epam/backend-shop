const serverless = require("serverless-http");
const express = require("express");
const app = express();
const cors = require("cors");
const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-2" });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const productsT = "products";
const stockT = "stock";

app.use(express.json());
app.use(cors());

const fetchProducts = async () => {
  
  try{
    const data = await ddbDocClient.send(new ScanCommand({TableName: productsT}));
    return data.Items;
  }catch(err){
    console.error("Error fetching products:", err);
    throw err;
  }
}


const fetchStock = async () => {
  
  try{
    const data = await ddbDocClient.send(new ScanCommand({TableName: stockT}));
    return data.Items;
  }catch(err){
    console.error("Error fetching stock:", err);
    throw err;
  }
}


const combineData = (products, stock) => {
  const stockDict = {};
  for(const item of stock){
    stockDict[item.product_id.S] = parseInt(item.count.N, 10);
  }

  return products.map(product => ({
  id: product.id,
    count: stockDict[product.id]|| 0,
    price: product.price,
    title: product.title,
    description: product.description
  }));
}

app.get("/products", async (req,res) => {

  try{
    const products = await fetchProducts();
    const stock = await fetchStock();
    const combinedData = combineData(products, stock);
    res.json(combinedData);
  }catch(err){
    res.status(500).send("Something went wrong fetching data" + err.message);
  }
});

app.get("/products/:productId", (req,res) => {
  const {productId} = req.params;

  const singleProduct = MOCK_PRODUCTS.filter(p => p.id === productId)[0];

  return res.json(singleProduct);
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

exports.handler = serverless(app);