import Joi from "joi";

export const createBlogSchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().required(),
  posts: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().optional(),
        content: Joi.string().required(),
      })
    )
    .optional(),
});

export const createPostSchema = Joi.object({
  title: Joi.string().optional(),
  content: Joi.string().required(),
});

export const getBlogSchema = Joi.object({
  slug: Joi.string().required(),
  includePosts: Joi.boolean().optional(),
});