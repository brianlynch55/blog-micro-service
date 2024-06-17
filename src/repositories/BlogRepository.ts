import { DataSource } from "typeorm";
import { Blog } from "../entity/Blog";
import { Post } from "../entity/Post";
import { IBlogRepository } from "../interfaces/IBlogRepository";

export class BlogRepository implements IBlogRepository {
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  async createAndSaveBlog(data: Partial<Blog>): Promise<Blog> {
    const blog = this.dataSource.getRepository(Blog).create(data);
    return await this.dataSource.getRepository(Blog).save(blog);
  }

  async createAndSavePost(data: Partial<Post>): Promise<Post> {
    const post = this.dataSource.getRepository(Post).create(data);
    return await this.dataSource.getRepository(Post).save(post);
  }

  async findBySlug(slug: string, includePosts?: boolean): Promise<Blog | null> {
    const options = {
      where: { slug },
      relations: includePosts ? ["posts"] : [],
    };
    return await this.dataSource.getRepository(Blog).findOne(options);
  }
}
