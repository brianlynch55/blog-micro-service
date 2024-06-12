import { DataSource } from "typeorm";
import { mock, instance, when } from "ts-mockito";
import BlogService from "./BlogService";
import { Blog } from "../entity/Blog";
import { Post } from "../entity/Post";

jest.mock("../config/redis");

describe("BlogService Tests", () => {
  let dataSourceMock: DataSource;
  let blogService: BlogService;
  let blogRepositoryMock: any;
  let postRepositoryMock: any;

  beforeEach(() => {
    dataSourceMock = mock(DataSource);
    blogRepositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    postRepositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
    };

    when(dataSourceMock.getRepository(Blog)).thenReturn(blogRepositoryMock);
    when(dataSourceMock.getRepository(Post)).thenReturn(postRepositoryMock);

    blogService = new BlogService(instance(dataSourceMock));
  });

  test("createBlog successfully creates a blog", async () => {
    const blogData = { name: "New Blog", slug: "new-blog", posts: [] };
    const blog: Blog = new Blog();
    blog.id = 1;
    blog.name = blogData.name;
    blog.slug = blogData.slug;
    blog.posts = blogData.posts;

    blogRepositoryMock.create.mockReturnValue(blog);
    blogRepositoryMock.save.mockResolvedValue(blog);

    const result = await blogService.createBlog(blogData);

    expect(blogRepositoryMock.create).toHaveBeenCalledWith(blogData);
    expect(blogRepositoryMock.save).toHaveBeenCalledWith(blog);
    expect(result).toEqual(blog);
  });

  test("addPost throws error if blog not found", async () => {
    blogRepositoryMock.findOne.mockResolvedValue(undefined);
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

    blogRepositoryMock.findOne.mockResolvedValue(blog);
    postRepositoryMock.create.mockReturnValue(post);
    postRepositoryMock.save.mockResolvedValue(post);

    const result = await blogService.addPost(blog.slug, postData);

    expect(postRepositoryMock.create).toHaveBeenCalledWith({
      ...postData,
      blog,
    });
    expect(postRepositoryMock.save).toHaveBeenCalledWith(post);
    expect(result).toEqual(post);
  });

  test("getBlog returns blog without posts", async () => {
    const blog: Blog = new Blog();
    blog.id = 1;
    blog.name = "Test Blog";
    blog.slug = "test-blog";
    blog.posts = [];

    blogRepositoryMock.findOne.mockResolvedValue(blog);

    const result = await blogService.getBlog(blog.slug, false);

    expect(blogRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { slug: blog.slug },
      relations: [],
    });
    expect(result).toEqual(blog);
  });

  test("getBlog returns blog with posts", async () => {
    const blog: Blog = new Blog();
    blog.id = 1;
    blog.name = "Integration Test Blog";
    blog.slug = "int-test-blog";
    blog.posts = [];

    blogRepositoryMock.findOne.mockResolvedValue(blog);

    const result = await blogService.getBlog(blog.slug, true);

    expect(blogRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { slug: blog.slug },
      relations: ["posts"],
    });
    expect(result).toEqual(blog);
  });
});
