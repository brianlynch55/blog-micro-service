import { Blog } from "../entity/Blog";
import { Post } from "../entity/Post";

export interface IBlogRepository {
  createAndSaveBlog(data: Partial<Blog>): Promise<Blog>;
  createAndSavePost(data: Partial<Post>): Promise<Post>;
  findBySlug(slug: string, includePosts?: boolean): Promise<Blog | null>;
}
