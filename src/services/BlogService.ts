import { Post } from "../entity/Post";
import redisClient from "../config/redis";
import { IBlogRepository } from "../interfaces/IBlogRepository";

class BlogService {
  private blogRepository: IBlogRepository;

  constructor(blogRepository: IBlogRepository) {
    this.blogRepository = blogRepository;
  }

  async createBlog({
    name,
    slug,
    posts,
  }: {
    name: string;
    slug: string;
    posts?: Post[];
  }) {
    const blog = await this.blogRepository.createAndSaveBlog({
      name,
      slug,
      posts: posts ? posts : [],
    });

    await Promise.all([
      redisClient.del(`blog:${slug}:includePosts:true`),
      redisClient.del(`blog:${slug}:includePosts:false`),
    ]);

    return blog;
  }

  async addPost(
    slug: string,
    { title, content }: { title?: string; content: string }
  ) {
    const blog = await this.blogRepository.findBySlug(slug);
    if (!blog) throw new Error("Blog not found");

    const post = await this.blogRepository.createAndSavePost({
      title,
      content,
      blog,
    });

    // Invalidate cache for both cases of includePosts
    await Promise.all([
      redisClient.del(`blog:${slug}:includePosts:true`),
      redisClient.del(`blog:${slug}:includePosts:false`),
    ]);

    return post;
  }

  async getBlog(slug: string, includePosts: boolean) {
    const cacheKey = `blog:${slug}:includePosts:${includePosts}`;
    const cachedBlog = await redisClient.get(cacheKey);

    if (cachedBlog) {
      console.log("Returning cached result");
      return JSON.parse(cachedBlog);
    }

    const blog = await this.blogRepository.findBySlug(slug, includePosts);

    if (blog) {
      await redisClient.set(cacheKey, JSON.stringify(blog), {
        EX: 3600,
      });
    }

    return blog;
  }
}

export default BlogService;
