import request from "supertest";
import express from "express";
import { DataSource } from "typeorm";
import BlogController from "../controllers/BlogController";
import BlogService from "../services/BlogService";
import { Blog } from "../entity/Blog";
import { mock, instance, when, verify, deepEqual, anything } from "ts-mockito";

describe("BlogController", () => {
  let app: express.Express;
  let dataSourceMock: DataSource;
  let blogServiceMock: BlogService;
  let blogController: BlogController;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    dataSourceMock = mock(DataSource);
    blogServiceMock = mock(BlogService);

    blogController = new BlogController(instance(dataSourceMock));
    blogController.blogService = instance(blogServiceMock);

    app.post("/blogs", blogController.createBlog);
    app.post("/blogs/:slug/posts", blogController.addPost);
    app.get("/blogs", blogController.getBlog);
  });

  test("createBlog - successful creation", async () => {
    const blogData = { name: "New Blog", slug: "new-blog", posts: [] };
    const createdBlogData = { ...blogData, id: 1 };
    when(blogServiceMock.createBlog(deepEqual(blogData))).thenResolve(
      createdBlogData
    );

    const response = await request(app).post("/blogs").send(blogData);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdBlogData);
    verify(blogServiceMock.createBlog(deepEqual(blogData))).once();
  });

  test("createBlog - error handling", async () => {
    when(blogServiceMock.createBlog(anything())).thenReject(
      new Error("Invalid data")
    );

    const response = await request(app)
      .post("/blogs")
      .send({ name: "", slug: "" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Invalid data" });
  });

  test("addPost - successful addition", async () => {
    const postData = { title: "New Post", content: "Content of the new post" };
    const post = {
      id: 1,
      title: postData.title,
      content: postData.content,
      viewCount: 0,
      blog: { id: 1, slug: "test-blog", name: "Test Blog", posts: [] },
    };
    when(blogServiceMock.addPost("test-blog", deepEqual(postData))).thenResolve(
      post
    );

    const response = await request(app)
      .post("/blogs/test-blog/posts")
      .send(postData);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(post);
    verify(blogServiceMock.addPost("test-blog", deepEqual(postData))).once();
  });

  test("getBlog - successful retrieval", async () => {
    const blogData = { id: 1, name: "Test Blog", slug: "test-blog", posts: [] };
    when(blogServiceMock.getBlog("test-blog", false)).thenResolve(blogData);

    const response = await request(app).get(
      "/blogs?slug=test-blog&includePosts=false"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(blogData);
    verify(blogServiceMock.getBlog("test-blog", false)).once();
  });

  test("getBlog - includes posts", async () => {
    const blogData: Blog = {
      id: 1,
      name: "Test Blog",
      slug: "test-blog",
      posts: [
        {
          id: 1,
          title: "Intro",
          content: "Welcome",
          viewCount: 1,
          blog: {
            id: 1,
            name: "Test Blog",
            slug: "test-blog",
            posts: [],
          },
        },
      ],
    };
    when(blogServiceMock.getBlog("test-blog", true)).thenResolve(blogData);

    const response = await request(app).get(
      "/blogs?slug=test-blog&includePosts=true"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(blogData);
    verify(blogServiceMock.getBlog("test-blog", true)).once();
  });
});
