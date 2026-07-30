import { describe, it, expect, afterEach } from "@jest/globals";
import { User } from "../src/models/user.model.js";
import { ApiError } from "../src/utils/errorApi.js";

describe("user model JWT helpers", () => {
    const originalSecret = process.env.ACCESS_TOKEN_SECRET;

    afterEach(() => {
        if (originalSecret === undefined) {
            delete process.env.ACCESS_TOKEN_SECRET;
        } else {
            process.env.ACCESS_TOKEN_SECRET = originalSecret;
        }
    });

    it("throws ApiError when ACCESS_TOKEN_SECRET is missing for access token generation", () => {
        delete process.env.ACCESS_TOKEN_SECRET;

        const user = {
            _id: "test-id",
            email: "test@example.com",
        } as any;

        expect(() => User.schema.methods.generateAccessToken.call(user)).toThrow(ApiError);
    });
});
