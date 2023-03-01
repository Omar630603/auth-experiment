const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const packages = require("../package.json");

require("dotenv").config();
mongoose.set("strictQuery", true);

const testUser = {
  email: "testuser@example.com",
  password: "password",
  confirmPassword: "password",
  name: "Test User",
  username: "testUser",
};

let token = null;

beforeAll(async () => {
  await connectDB().then(
    async () => {
      // console.log("Database connected successfully");
    },
    (err) => {
      console.log("There is problem while connecting database " + err);
    }
  );
});

afterAll(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.drop();
  }
  await disconnectDB();
});

async function connectDB() {
  return mongoose.connect(process.env.MONGODB_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

async function disconnectDB() {
  await mongoose.connection.close();
}

const options = {
  showPrefix: false,
  showMatcherMessage: true,
  showStack: false,
};

describe("Testing application configuration", () => {
  it("should have the right name and packages", (done) => {
    expect(packages.name, "name should be auth-experiment", options).toBe(
      "-experiment"
    );
    expect(packages.version).toBe("1.0.0");
    expect(packages.devDependencies).toHaveProperty("cross-env");
    expect(packages.devDependencies).toHaveProperty("jest");
    expect(packages.devDependencies).toHaveProperty("nodemon");
    expect(packages.devDependencies).toHaveProperty("supertest");
    expect(packages.dependencies).toHaveProperty("dotenv");
    expect(packages.dependencies).toHaveProperty("express");
    expect(packages.dependencies).toHaveProperty("mongoose");
    expect(packages.dependencies).toHaveProperty("bcryptjs");
    expect(packages.dependencies).toHaveProperty("express-unless");
    expect(packages.dependencies).toHaveProperty("jsonwebtoken");
    done();
  });

  it("should have the right environment variables", (done) => {
    expect(process.env).toHaveProperty("MONGODB_URI");
    expect(process.env).toHaveProperty("MONGODB_URI_TEST");
    expect(
      process.env.MONGODB_URI !== process.env.MONGODB_URI_TEST
    ).toBeTruthy();
    expect(process.env).toHaveProperty("PORT");
    expect(process.env).toHaveProperty("JWT_SECRET");
    expect(process.env).toHaveProperty("JWT_EXPIRE");
    expect(process.env.NODE_ENV).toBe("test");
    done();
  });

  it("should have the right database connection", (done) => {
    expect(mongoose.connection.name).toBe("auth-experiment-test");
    expect(mongoose.connection.readyState).toBe(1);
    done();
  });

  it("should be using json format and express framework", (done) => {
    let application_stack = [];
    app._router.stack.forEach((element) => {
      application_stack.push(element.name);
    });
    expect(application_stack).toContain("query");
    expect(application_stack).toContain("expressInit");
    expect(application_stack).toContain("jsonParser");
    expect(application_stack).toContain("urlencodedParser");
    expect(application_stack).toContain("corsMiddleware");
    expect(application_stack).toContain("errorHandler");
    expect(application_stack).toContain("router");
    expect(application_stack).toContain("result");
    done();
  });
});

describe("Auth API endpoints", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/v1/register").send(testUser);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", testUser.email);
    expect(res.body.user).toHaveProperty("name", testUser.name);
    expect(res.body).toHaveProperty("message", "Registered User Successfully");
  });

  it("should login user and return access token", async () => {
    const res = await request(app).post("/api/v1/login").send(testUser);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", testUser.email);
    expect(res.body.user).toHaveProperty("name", testUser.name);
    expect(res.body).toHaveProperty("message", "Logged In User Successfully");
    token = res.body.token;
  });

  it("should fetch user profile data", async () => {
    const res = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.user).toHaveProperty("email", testUser.email);
    expect(res.body.user).toHaveProperty("name", testUser.name);
    expect(res.body).toHaveProperty(
      "message",
      "Profile Retrieved Successfully"
    );
  });

  it("should update user profile data", async () => {
    const updatedUser = {
      email: "updateduser@example.com",
      name: "Updated User",
      username: "UpdatedUserName",
    };
    const res = await request(app)
      .patch("/api/v1/profile")
      .send(updatedUser)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.user).toHaveProperty("email", updatedUser.email);
    expect(res.body.user).toHaveProperty("name", updatedUser.name);
    expect(res.body).toHaveProperty("message", "Profile Updated Successfully");
    testUser.email = updatedUser.email;
    testUser.name = updatedUser.name;
    testUser.username = updatedUser.username;
  });

  it("should update user password", async () => {
    const updatedPassword = {
      currentPassword: testUser.password,
      newPassword: "newPassword",
      confirmNewPassword: "newPassword",
    };
    const res = await request(app)
      .patch("/api/v1/profile/password")
      .send(updatedPassword)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Password Updated Successfully");
    testUser.password = updatedPassword.newPassword;
  });

  it("should logout user", async () => {
    const res = await request(app)
      .get("/api/v1/logout")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Logged Out Successfully");
  });

  it("should delete user", async () => {
    const resLogin = await request(app).post("/api/v1/login").send(testUser);
    token = resLogin.body.token;

    const res = await request(app)
      .delete("/api/v1/profile")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "User Deleted Successfully");
  });
});
