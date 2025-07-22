import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient
const prisma = new PrismaClient();

export const productController = {
  // Create a product
  async create(req: Request, res: Response) {
    try {
      const { name, price, stock, remark } = req.body;
      
      // Convert price and stock to appropriate types
      const productData = {
        name,
        price: Number(price),
        stock: Number(stock),
        ...(remark && { remark })
      };

      const product = await prisma.someDatabaseTable.create({
        data: productData
      });
      
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ 
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get all products
  async getAll(req: Request, res: Response) {
    try {
      const products = await prisma.product.findMany();
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ 
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}; 