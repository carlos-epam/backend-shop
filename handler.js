const serverless = require("serverless-http");
const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());


const MOCK_PRODUCTS = [
  {
      "description": "Short Product Description1",
      "id": "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
      "price": 24,
      "title": "ProductOne",
      "count": 1
  },
  {
      "description": "Short Product Description7",
      "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
      "price": 15,
      "title": "ProductTitle",
      "count": 2
  },
  {
      "description": "Short Product Description2",
      "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
      "price": 23,
      "title": "Product",
      "count": 3
  },
  {
      "description": "Short Product Description4",
      "id": "7567ec4b-b10c-48c5-9345-fc73348a80a1",
      "price": 15,
      "title": "ProductTest",
      "count": 4
  },
  {
      "description": "Short Product Descriptio1",
      "id": "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
      "price": 23,
      "title": "Product2",
      "count": 5
  },
  {
      "description": "Short Product Description7",
      "id": "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
      "price": 15,
      "title": "ProductName",
      "count": 6
  }
];

app.use(cors());

app.get("/products", (req,res) => {
  return res.json(MOCK_PRODUCTS);
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