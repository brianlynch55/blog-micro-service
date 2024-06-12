import { Request, Response } from "express";
import { DataSource } from "typeorm";
import BlogService from "../services/BlogService";

class BlogController {
  blogService: BlogService;

  constructor(dataSource: DataSource) {
    this.blogService = new BlogService(dataSource);
  }

  createBlog = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, slug, posts } = req.body;
      const blog = await this.blogService.createBlog({ name, slug, posts });
      res.status(201).json(blog);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  addPost = async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.params;
      const { title, content } = req.body;
      const post = await this.blogService.addPost(slug, { title, content });
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getBlog = async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.query;
      const includePosts = req.query.includePosts === "true";
      const blog = await this.blogService.getBlog(slug as string, includePosts);
      if (!blog) {
        res.status(404).json({ message: "Blog not found" });
        return;
      }
      res.status(200).json(blog);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}

export default BlogController;
