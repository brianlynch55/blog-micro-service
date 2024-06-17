import { Blog } from "../entity/Blog";
import { Post } from "../entity/Post";
import BlogService from "./BlogService";
import { IBlogRepository } from "../interfaces/IBlogRepository";

jest.mock("../config/redis");

describe("BlogService Tests", () => {
  let blogRepositoryMock: jest.Mocked<IBlogRepository>;
  let blogService: BlogService;

  beforeEach(() => {
    blogRepositoryMock = {
      createAndSaveBlog: jest.fn(),
      createAndSavePost: jest.fn(),
      findBySlug: jest.fn(),
    };
    blogService = new BlogService(blogRepositoryMock);
  });

  test("createBlog successfully creates a blog", async () => {
    const blogData = { name: "New Blog", slug: "new-blog", posts: [] };
    const blog: Blog = new Blog();
    blog.id = 1;
    blog.name = blogData.name;
    blog.slug = blogData.slug;
    blog.posts = blogData.posts;

    blogRepositoryMock.createAndSaveBlog.mockResolvedValue(blog);

    const result = await blogService.createBlog(blogData);

    expect(blogRepositoryMock.createAndSaveBlog).toHaveBeenCalledWith(blogData);
    expect(result).toEqual(blog);
  });

  test("addPost throws error if blog not found", async () => {
    blogRepositoryMock.findBySlug.mockResolvedValue(null);
    await expect(
      blogService.addPost("nonexistent-slug", {
        title: "Test Post",
        content: "Test Content",
      })
    ).rejects.toThrow("Blog not found");
  });

  test("addPost successfully adds a post to a blog", async () => {
    const blog: Blog = new Blog();
    blog.id = 1;
    blog.name = "Test Blog";
    blog.slug = "test-blog";
    blog.posts = [];

    const postData = { title: "Test Post", content: "Test Content" };
    const post: Post = new Post();
    post.id = 1;
    post.title = postData.title;
    post.content = postData.content;
    post.blog = blog;
    post.viewCount = 0;

    blogRepositoryMock.findBySlug.mockResolvedValue(blog);
    blogRepositoryMock.createAndSavePost.mockResolvedValue(post);

    const result = await blogService.addPost(blog.slug, postData);

    expect(blogRepositoryMock.findBySlug).toHaveBeenCalledWith(blog.slug);
    expect(blogRepositoryMock.createAndSavePost).toHaveBeenCalledWith({
      ...postData,
      blog,
    });
    expect(result).toEqual(post);
  });

  test("getBlog returns blog without posts", async () => {
    const blog: Blog = new Blog();
    blog.id = 1;
    blog.name = "Test Blog";
    blog.slug = "test-blog";
    blog.posts = [];

    blogRepositoryMock.findBySlug.mockResolvedValue(blog);

    const result = await blogService.getBlog(blog.slug, false);

    expect(blogRepositoryMock.findBySlug).toHaveBeenCalledWith(blog.slug, false);
    expect(result).toEqual(blog);
  });

  test("getBlog returns blog with posts", async () => {
    const blog: Blog = new Blog();
    blog.id = 1;
    blog.name = "Integration Test Blog";
    blog.slug = "int-test-blog";
    blog.posts = [];

    blogRepositoryMock.findBySlug.mockResolvedValue(blog);

    const result = await blogService.getBlog(blog.slug, true);

    expect(blogRepositoryMock.findBySlug).toHaveBeenCalledWith(blog.slug, true);
    expect(result).toEqual(blog);
  });
});
