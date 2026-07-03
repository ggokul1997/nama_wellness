import type { Request, Response, NextFunction } from 'express';
import { categoriesService } from './categories.service.js';
import type { CreateCategoryInput, UpdateCategoryInput } from '@nama/shared';

export const categoriesController = {
  async getAllCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check if user is admin based on auth middleware (req.user)
      const isAdmin = req.user?.activeRole === 'ADMIN';
      const categories = await categoriesService.getAllCategories(isAdmin);
      res.json({ success: true, data: { categories } });
    } catch (error) {
      next(error);
    }
  },

  async getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoriesService.getCategoryById(req.params.id as string);
      res.json({ success: true, data: { category } });
    } catch (error) {
      next(error);
    }
  },

  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as CreateCategoryInput;
      const category = await categoriesService.createCategory(input);
      res.status(201).json({ success: true, data: { category } });
    } catch (error) {
      next(error);
    }
  },

  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as UpdateCategoryInput;
      const category = await categoriesService.updateCategory(req.params.id as string, input);
      res.json({ success: true, data: { category } });
    } catch (error) {
      next(error);
    }
  },

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await categoriesService.deleteCategory(req.params.id as string);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  async getUploadUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mimeType, fileSizeBytes } = req.body;
      if (!mimeType || !fileSizeBytes) {
        res.status(400).json({ success: false, message: 'Missing mimeType or fileSizeBytes' });
        return;
      }
      const result = await categoriesService.getPresignedUploadUrl(mimeType, fileSizeBytes);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};
