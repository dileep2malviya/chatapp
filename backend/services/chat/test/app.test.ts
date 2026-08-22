import { describe, it, expect } from "@jest/globals";
import request from 'supertest';
import {app} from '../src/app.js';

describe("GET /health", () => {
  it("should return 200 and message", async () => {
    const res = await request(app).get("/health");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      message: "health checked"
    });
  });
});