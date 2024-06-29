const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-2" });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const MOCK_PRODUCTS = [
  {
    "pk": 1,
    "description": "Short Product Description1",
    "id": "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
    "price": 24,
    "title": "ProductOne",
  },
  {
    "pk": 2,
    "description": "Short Product Description7",
    "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
    "price": 15,
    "title": "ProductTitle",
  },
  {
    "pk": 3,
    "description": "Short Product Description2",
    "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
    "price": 23,
    "title": "Product",
  },
  {
    "pk": 4,
    "description": "Short Product Description4",
    "id": "7567ec4b-b10c-48c5-9345-fc73348a80a1",
    "price": 15,
    "title": "ProductTest",
  },
  {
    "pk": 5,
    "description": "Short Product Descriptio1",
    "id": "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
    "price": 23,
    "title": "Product2",
  },
  {
    "pk": 6,
    "description": "Short Product Description7",
    "id": "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
    "price": 15,
    "title": "ProductName",
  }
];

const generateStockData = (products) => {
  return products.map(product => ({
    "pk": Math.floor(Math.random() * 100) + 1,
    "product_id": product.id,
    "count": Math.floor(Math.random() * 100) + 1
  }));
};

const MOCK_STOCK = generateStockData(MOCK_PRODUCTS);

const productsTableName = "products";
const stockTableName = "stock";

const putItem = async (tableName, item) => {
  const params = {
    TableName: tableName,
    Item: item,
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    console.log(`Item with id ${item.id || item.product_id} inserted successfully into ${tableName}`);
  } catch (err) {
    console.error(`Error inserting item with id ${item.id || item.product_id} into ${tableName}:`, err);
  }
};

const populateProductsTable = async () => {
  for (const item of MOCK_PRODUCTS) {
    await putItem(productsTableName, item);
  }
  console.log("Products table populated successfully");
};

const populateStockTable = async () => {
  for (const item of MOCK_STOCK) {
    await putItem(stockTableName, item);
  }
  console.log("Stock table populated successfully");
};

const populateTables = async () => {
  await populateProductsTable();
  await populateStockTable();
};

populateTables();
