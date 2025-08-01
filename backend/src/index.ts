import express from 'express';
import cors from 'cors';
import { productController } from './controllers/product.controller';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Product routes
app.post('/api/products', productController.create);
app.get('/api/products', productController.getAll);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Docker Study API' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 