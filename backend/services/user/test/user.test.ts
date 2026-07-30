import mongoose from "mongoose";
import request from "supertest";
import connectDB from "../src/db/index.js";
import { app } from "../src/app.js";
import { beforeAll, afterAll, describe, it, expect } from "@jest/globals";
import { connectRedis, redisClient } from "../src/config/redisConnection.js";

beforeAll(async () => {
    await connectDB();
    await connectRedis()
},20000);

afterAll(async () => {
    await mongoose.connection.close();
});

describe("POST /api/v1/user/create", () => {
    it("should register a new user", async () => {
        const res = await request(app)
            .post("/api/v1/user/create")
            .send({
                firstName: "dileep",
                lastName: "lohar",
                username: "dileep2maviya",
                email: "dileep2malviya@gmail.com",
                password: "Dileep@123",
            });

        expect(res.body.message).toBe("User registered successfully");
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(201);
    },
        20000
    );
});

describe("POST /api/v1/user/verify", () => {
    it("should verify a new user", async () => {
        const otp = await redisClient?.get(`opt:dileep2malviya@gmail.com`);
        const res = await request(app)
            .post("/api/v1/user/verify")
            .send({
                email: "dileep2malviya@gmail.com",
                otp: otp,
            });

        expect([
            "Verified Successfully.",
            "User already Verified."
        ]).toContain(res.body.message);
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
    },
        20000
    );
});

describe("POST /api/v1/user/send-otp-again", () => {
    it("sent otp again for new user", async () => {
        const res = await request(app)
        .post("/api/v1/user/send-otp-again")
        .send({
                email: "dileep2malviya@gmail.com"
            })
        expect([
            "User is already verified.",
            "OTP sent your mail."
        ]).toContain(res.body.message);
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
    },
        20000
    );
}) 

describe("POST /api/user/v1/login", () => {
    it("Should login user", async () => {
         const res = await request(app)
            .post("/api/v1/user/login")
            .send({
                email: "dileep2malviya@gmail.com",
                password: 'Dileep@123'
            })

        expect(res.body.message).toBe("User Logged In Successfully");
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
    },
        20000
    ) 
})

describe("POST /api/v1/user/forgot-password", () => {
    it("should send a password reset otp for the user", async () => {
        const email = "dileep2malviya@gmail.com";
        const res = await request(app)
            .post("/api/v1/user/forgot-password")
            .send({ email });

        expect(res.body.message).toBe("If an account exists for this email, a password reset OTP has been sent.");
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);

        const otp = await redisClient?.get(`forgotPassword:${email}`);
        expect(otp).toBeTruthy();
    }, 20000);
});

describe("POST /api/v1/user/verify-forgot-password-email", () => {
    it("should verify the password reset otp and return a reset token", async () => {
        const email = "dileep2malviya@gmail.com";
        const otp = await redisClient?.get(`forgotPassword:${email}`);

        const res = await request(app)
            .post("/api/v1/user/verify-forgot-password-email")
            .send({ email, otp });

        expect(res.body.message).toBe("OTP verified successfully. You can now reset your password.");
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.data?.resetToken).toBeTruthy();
    }, 20000);
});

describe("POST /api/v1/user/reset-password", () => {
    it("should reset the user's password with a valid reset token", async () => {
        const email = "dileep2malviya@gmail.com";
        
        await request(app)
            .post("/api/v1/user/forgot-password")
            .send({ email });

        const otp = await redisClient?.get(`forgotPassword:${email}`);

        const verifyRes = await request(app)
            .post("/api/v1/user/verify-forgot-password-email")
            .send({ email, otp });

        const resetToken = verifyRes.body.data?.resetToken;

        const res = await request(app)
            .post("/api/v1/user/reset-password")
            .send({
                resetToken,
                newPassword: "Dileep@456",
                confirmPassword: "Dileep@456"
            });
            

        expect(res.body.message).toBe("Password has been reset successfully. Please log in again.");
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
    }, 20000);
});