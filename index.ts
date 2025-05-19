import "expo-router/entry";
import {
  belongsTo,
  createServer,
  Factory,
  hasMany,
  Model,
  Response,
  RestSerializer,
  Server,
} from "miragejs";
import { User } from "./app/_layout";
import { faker } from "@faker-js/faker";

declare global {
  interface Window {
    server: Server;
  }
}

let zerocho: User;

if (__DEV__) {
  if (window.server) {
    window.server.shutdown();
  }

  window.server = createServer({
    models: {
      user: Model.extend({
        posts: hasMany("post"),
        activities: hasMany("activity"),
      }),
      post: Model.extend({
        user: belongsTo("user"),
      }),
    },
    serializers: {
      post: RestSerializer.extend({
        include: ["user"],
        embed: true,
      }),
      activity: RestSerializer.extend({
        include: ["user"],
        embed: true,
      }),
    },
    factories: {
      user: Factory.extend({
        id: () => faker.person.firstName(),
        name: () => faker.person.fullName(),
        description: () => faker.lorem.sentence(),
        profileImageUrl: () =>
          `https://avatars.githubusercontent.com/u/${Math.floor(
            Math.random() * 100_000
          )}?v=4`,
        isVerified: () => Math.random() > 0.5,
      }),
      post: Factory.extend({
        id: () => faker.string.numeric(6),
        content: () => faker.lorem.paragraph(),
        imageUrls: () =>
          Array.from(
            {
              length: Math.floor(Math.random() * 3),
            },
            () => faker.image.urlLoremFlickr()
          ),
        like: () => Math.floor(Math.random() * 100),
        comments: () => Math.floor(Math.random() * 100),
        reposts: () => Math.floor(Math.random() * 100),
      }),
    },
    seeds(server) {
      zerocho = server.create("user", {
        id: "whljm1003",
        name: "jungmin",
        description: "programmer",
        profileImageUrl: "https://avatars.githubusercontent.com/u/885857?v=4",
      });
      const users = server.createList("user", 10);
      users.forEach((user) => {
        server.createList("post", 5, {
          user,
        });
      });
    },
    routes() {
      this.post("/post", (schema, request) => {
        const { posts } = JSON.parse(request.requestBody);
        posts.forEach((post: any) => {
          schema.create("post", {
            content: post.content,
            imageUrls: post.imageUrls,
            location: post.location,
            user: schema.find("user", "whljm1003"),
          });
        });
        return new Response(200, {}, { posts });
      });

      this.get("/posts", (schema, request) => {
        console.log("user.all", schema.all("user").models);
        const cursor = parseInt((request.queryParams.cursor as string) || "0");
        const posts = schema.all("post").models.slice(cursor, cursor + 10);
        return new Response(200, {}, { posts });
      });

      this.get("/posts/:id", (schema, request) => {
        const post = schema.find("post", request.params.id);
        const comments = schema.all("post").models.slice(0, 10);
        return new Response(200, {}, { post, comments });
      });

      this.post("/login", (schema, request) => {
        const { username, password } = JSON.parse(request.requestBody);

        if (username === "zerocho" && password === "1234") {
          return {
            accessToken: "access-token",
            refreshToken: "refresh-token",
            user: {
              id: "whljm1003",
              name: "jungmin",
              description: "programmer",
              profileImageUrl:
                "https://avatars.githubusercontent.com/u/885857?v=4",
            },
          };
        } else {
          return new Response(401, {}, { message: "Invalid credentials" });
        }
      });
    },
  });
}
