import { DataSource } from "typeorm";
import { Blog } from "../entity/Blog";
import { Post } from "../entity/Post";
import redisClient from "../config/redis";

class BlogService {
  private blogRepository;
  private postRepository;

  constructor(dataSource: DataSource) {
    this.blogRepository = dataSource.getRepository(Blog);
    this.postRepository = dataSource.getRepository(Post);
  }

  async createBlog({
    name,
    slug,
    posts,
  }: {
    name: string;
    slug: string;
    posts?: Partial<Post>[];
  }) {
    const blog = this.blogRepository.create({ name, slug, posts });
    await redisClient.del(`blog:${slug}`);
    return await this.blogRepository.save(blog);
  }

  async addPost(
    slug: string,
    { title, content }: { title?: string; content: string }
  ) {
    const blog = await this.blogRepository.findOne({ where: { slug } });
    if (!blog) throw new Error("Blog not found");

    const post = this.postRepository.create({ title, content, blog });
    await redisClient.del(`blog:${slug}`);
    return await this.postRepository.save(post);
  }

  async getBlog(slug: string, includePosts: boolean) {
    const cacheKey = `blog:${slug}:includePosts:${includePosts}`;
    if (redisClient) {
      const cachedBlog = await redisClient.get(cacheKey);

      if (cachedBlog) {
        console.log("returning cached result");
        return JSON.parse(cachedBlog);
      }
    }

    const blog = await this.blogRepository.findOne({
      where: { slug },
      relations: includePosts ? ["posts"] : [],
    });

    if (blog) {
      await redisClient.set(cacheKey, JSON.stringify(blog), {
        EX: 3600,
      });
    }

    return blog;
  }
}

export default BlogService;
