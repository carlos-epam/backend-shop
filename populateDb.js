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
      "count": 1
    },
    {
      "pk": 6,
      "description": "Short Product Description7",
      "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
      "price": 15,
      "title": "ProductTitle",
      "count": 2
    },
    {
      "pk": 2,
      "description": "Short Product Description2",
      "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
      "price": 23,
      "title": "Product",
      "count": 3
    },
    {
      "pk": 3,
      "description": "Short Product Description4",
      "id": "7567ec4b-b10c-48c5-9345-fc73348a80a1",
      "price": 15,
      "title": "ProductTest",
      "count": 4
    },
    {
      "pk": 4,
      "description": "Short Product Descriptio1",
      "id": "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
      "price": 23,
      "title": "Product2",
      "count": 5
    },
    {
      "pk": 5,
      "description": "Short Product Description7",
      "id": "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
      "price": 15,
      "title": "ProductName",
      "count": 6
    }
  ];
  
  

const tableName = "products"; 

const putItem = async (item) => {
  const params = {
    TableName: tableName,
    Item: item,
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    console.log(`Item with id ${item.id} inserted successfully`);
  } catch (err) {
    console.error(`Error inserting item with id ${item.id}:`, err);
  }
};

const populateTable = async () => {
  for (const item of MOCK_PRODUCTS) {
    await putItem(item);
  }
  console.log("Table populated successfully");
};

populateTable();
