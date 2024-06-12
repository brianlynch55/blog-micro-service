import { Router } from "express";
import BlogController from "../controllers/BlogController";
import { DataSource } from "typeorm";
import { validateRequest } from "../middleware/validation";
import {
  createBlogSchema,
  createPostSchema,
  getBlogSchema,
} from "../validation/blogValidation";

export default (dataSource: DataSource) => {
  const router = Router();
  const blogController = new BlogController(dataSource);

  router.post("/blogs", validateRequest(createBlogSchema), (req, res) =>
    blogController.createBlog(req, res)
  );
  router.post(
    "/blogs/:slug/posts",
    validateRequest(createPostSchema),
    (req, res) => blogController.addPost(req, res)
  );
  router.get(
    "/blogs",
    validateRequest(getBlogSchema, "query"),
    (req, res) => blogController.getBlog(req, res)
  );
  return router;
};
