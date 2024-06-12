# Blog Microservice README

## Overview

This project is a backend microservice designed to store and retrieve blog entities and their related post entities. The microservice is built using Node.js, TypeScript, Express, TypeORM, and PostgreSQL for the database, with Redis used for caching.

## Technologies Used

- **Node.js**: JavaScript runtime for building scalable server-side applications.
- **TypeScript**: Typed superset of JavaScript.
- **Express**: Fast, unopinionated, minimalist web framework for Node.js.
- **TypeORM**: ORM for TypeScript and JavaScript.
- **PostgreSQL**: Relational database for structured data storage.
- **Redis**: In-memory data structure store, used for caching.
- **Jest**: JavaScript testing framework.
- **ts-mockito**: Mocking library for TypeScript.

## Data Model

### Blog

- **name**: Required string
- **slug**: Required string that is unique across all blogs
- **posts**: A blog may have many posts

### Post

- **title**: Optional string
- **content**: Required string
- **viewCount**: Required integer with a default value of 0
- **blog**: A post is related to exactly one blog

## API Endpoints

### Create Blog

```bash
POST /blogs
Request Body:
{
  "name": "Blog Name",
  "slug": "unique-slug",
  "posts": [
    {
      "title": "Post Title",
      "content": "Post Content"
    }
  ]
}
Response: 201 Created
Response Body:
{
  "id": 1,
  "name": "Blog Name",
  "slug": "unique-slug",
  "posts": [
    {
      "id": 1,
      "title": "Post Title",
      "content": "Post Content",
      "viewCount": 0
    }
  ]
}

Add Post to Blog

POST /blogs/:slug/posts
Request Params:
slug: Unique identifier for the blog
Request Body:
{
  "title": "Post Title",
  "content": "Post Content"
}
Response: 201 Created
Response Body:
{
  "id": 2,
  "title": "Post Title",
  "content": "Post Content",
  "viewCount": 0,
  "blog": {
    "id": 1,
    "name": "Blog Name",
    "slug": "unique-slug"
  }
}

Get Blog
GET /blogs
Request Query Params:
slug: Unique identifier for the blog
includePosts: Boolean to include related posts
Response: 200 OK
Response Body:
{
  "id": 1,
  "name": "Blog Name",
  "slug": "unique-slug",
  "posts": [
    {
      "id": 1,
      "title": "Post Title",
      "content": "Post Content",
      "viewCount": 0
    }
  ]
}


## Testing

### Unit Tests

Implemented unit tests for the `BlogService` class to ensure that core functionalities, such as creating blogs, adding posts, and retrieving blogs, are working as expected.

- **Focus**: Core functionalities of the `BlogService`.
- **Tools**: Jest for running unit tests.
- **Mocking**: Dependencies like TypeORM repositories are mocked to isolate the service logic.

### Mocking Dependencies

To ensure tests focus strictly on application logic without external dependencies influencing the results:

- **Mocked Components**: TypeORM repositories and the Redis client.
- **Purpose**: Allows testing of service and controller logic in isolation, ensuring that tests are not affected by external data changes or persistence layer performance.

This structured approach to testing ensures that each component functions correctly both in isolation and when integrated, thereby reducing bugs and improving code quality.

### End-to-End (E2E) Tests

Conducted End-to-End tests on the `BlogController` to ensure that all API endpoints perform correctly under simulated real-world usage conditions.

- **Focus**: Integration of `BlogController` with `BlogService` and the overall API functionality.
- **Tools**: Supertest to simulate API calls and check responses.
- **Scope**: Tests cover all endpoints described in the API section.

## Request Validation

Implemented using the `Joi` library to ensure data integrity and enforce schema constraints. This setup robustly validates incoming requests, ensuring all data conforms to predefined formats and constraints.

# Design Decisions

## Technology Stack

- **Node.js & TypeScript**: Provides a robust development environment with strong typing and better tooling support.
- **Express**: Lightweight and easy to work with for building RESTful APIs.
- **TypeORM**: Simplifies database interactions with an object-relational mapper.
- **PostgreSQL**: Reliable and powerful relational database.
- **Redis**: Enhances performance by caching frequently accessed data.

## Trade-offs

- **Complexity vs. Flexibility**: Using TypeORM adds some complexity but provides flexibility in database operations and makes it easier to swap databases if needed.
- **Caching**: Adding Redis for caching increases complexity but significantly improves performance by reducing database load.

## Testing and Dependency Injection

- **Jest**: Used for unit testing to ensure the application works as expected.
- **ts-mockito**: Used for mocking dependencies in tests, making it easier to test components in isolation.
- **Dependency Injection**: Injecting the DataSource into the service and controller classes improves testability and allows for easier swapping of implementations.

## Scaling Considerations

To scale this application to handle hundreds of thousands of users:

- **Horizontal Scaling**: Deploy multiple instances of the application behind a load balancer.
- **Database Optimization**: Ensure proper indexing and use read replicas for database scaling. For example, the slug field in the Blog entity is indexed to improve query performance.
- **Caching Strategy**: Use Redis for more aggressive caching strategies.
- **Asynchronous Processing**: Offload heavy processing to background jobs using message queues like RabbitMQ or Kafka.
- **Auto-Scaling**: Implement auto-scaling to automatically adjust the number of running instances based on traffic and load.

## Handling Multiple Databases

To support models stored in different databases (e.g., posts in Cassandra and blogs in PostgreSQL):

- **Abstract Data Access Layer**: Create an abstraction layer to handle data access logic. Each database operation can be implemented in its own repository.
- **Service Layer**: The service layer interacts with the data access layer, abstracting the specifics of each database.

## Questions from the Specification

### What were some of the reasons you chose the technology stack that you did?

The chosen technology stack provides a balance between performance, scalability, and developer productivity. TypeScript ensures type safety and reduces runtime errors. Express is lightweight and easy to work with for building RESTful APIs. TypeORM simplifies database interactions and provides flexibility to switch databases if needed. PostgreSQL is a powerful and reliable relational database, while Redis significantly enhances performance through caching.

### What were some of the trade-offs you made when building this application? Why were these acceptable trade-offs?

One trade-off was the added complexity of using TypeORM and Redis. While these tools add complexity, they provide significant benefits in terms of flexibility and performance, making them acceptable trade-offs for building a scalable and maintainable application.

### Given more time, what improvements or optimizations would you want to add? When would you add them?

- **Logging and Monitoring**: For better observability and debugging.
- **Security**: Implementing authentication and authorization.

### What would you need to do to make this application scale to hundreds of thousands of users?

- **Horizontal Scaling**: Deploy multiple instances behind a load balancer.
- **Database Optimization**: Ensure proper indexing and use read replicas.
- **Caching Strategy**: Use Redis for more aggressive caching.
- **Asynchronous Processing**: Offload heavy processing to background jobs.
- **Auto-Scaling**: Implement auto-scaling to handle variable traffic loads.

### How would you change the architecture to allow for models that are stored in different databases?

Create an abstract data access layer and implement specific repositories for each database. The service layer would interact with this abstraction, ensuring the application logic remains database-agnostic.

### How would you deploy the architecture you designed in a production-ready way?

- **Containerization**: Use Docker to containerize the application.
- **Orchestration**: Use Kubernetes or Cloudforamtion for orchestration and management of containers.
- **CI/CD**: Implement CI/CD pipelines for automated testing and deployment.
- **Environment Configuration**: Use environment variables and secrets management for configuration.

## Conclusion

This project demonstrates a robust and scalable approach to building a microservice for managing blogs and posts. The chosen technology stack provides a good balance between performance, scalability, and developer productivity, making it well-suited for handling future growth and changes in the application requirements.

## Running the app
npm i
docker-compose up --build
```
