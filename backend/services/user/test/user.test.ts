import mongoose from "mongoose";
import request from "supertest";
import connectDB from "../src/db/index.js";
import { app } from "../src/app.js";
import { beforeAll, afterAll, describe, it, expect } from "@jest/globals";
import { connectRedis, redisClient } from "../src/config/redisConnection.js";
import { de } from "zod/v4/locales";

beforeAll(async () => {
    await connectDB();
    await connectRedis()
}, 20000);

afterAll(async () => {
    await mongoose.connection.close();
});

describe("POST /api/v1/user/create", () => {
    it("should register a new user", async () => {
        const res = await request(app)
            .post("/api/v1/user/create")
            .send({
                firstName: "gotu",
                lastName: "lohar",
                username: "gotu2lohar",
                email: "dileep22malviya@gmail.com",
                password: "Dileep@1223",
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
                email: "dileep22malviya@gmail.com",
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
                email: "dileep22malviya@gmail.com"
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
                email: "dileep22malviya@gmail.com",
                password: 'Dileep@1223'
            })
        console.log("res :: ", res)

        expect(res.body.message).toBe("User Logged In Successfully");
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
    },
        20000
    )
})

describe("POST /api/v1/user/forgot-password", () => {
    it("should send a password reset otp for the user", async () => {
        const email = "dileep22malviya@gmail.com";
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
        const email = "dileep22malviya@gmail.com";
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
        const email = "dileep22malviya@gmail.com";

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
                newPassword: "Dileep@4456",
                confirmPassword: "Dileep@4456"
            });


        expect(res.body.message).toBe("Password has been reset successfully. Please log in again.");
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
    }, 20000);
});

describe("POST /api/v1/user/change-password", () => {
    it("should allow user to change password", async () => {
        const loginRes = await request(app)
            .post("/api/v1/user/login")
            .send({
                email: "dileep22malviya@gmail.com",
                password: "Dileep@4456"
            })

        const token = loginRes.body.data?.accessToken;

        const res = await request(app)
            .post("/api/v1/user/change-password")
            .set("Authorization", `Bearer ${token}`)
            .send({
                currentPassword: "Dileep@4456",
                newPassword: "Dileep@7789",
                confirmPassword: "Dileep@7789"
            });

            expect(res.body.message).toBe("Password changed successfully. Please log in again.")
            expect(res.body.success).toBe(true);
            expect(res.body.statusCode).toBe(200);
        

    })
})

describe("POST /api/v1/user/logout", () => {
    it("Should logout user", async () => {
        const loginRes = await request(app)
            .post("/api/v1/user/login")
            .send({
                email: "dileep22malviya@gmail.com",
                password: "Dileep@7789"
            })

        const token = loginRes.body.data?.accessToken;

        const res = await request(app)
            .post("/api/v1/user/logout-user")
            .set("Authorization", `Bearer ${token}`)

        expect(res.body.message).toBe("Logged out successfully.")
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
    })
})

describe("GET /api/v1/user/get-user-profile", () => {
    it("Should get user profile", async () => {
        const loginRes = await request(app)
            .post("/api/v1/user/login")
            .send({
                email: "dileep22malviya@gmail.com",
                password: "Dileep@7789"
            })

        const token = loginRes.body.data?.accessToken;

        const res = await request(app)
            .get("/api/v1/user/get-user-profile")
            .set("Authorization", `Bearer ${token}`)

        expect(res.body.message).toBe("User profile retrieved successfully.")
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
    })
})

describe("POST /api/v1/user/update-user-profile", () => {
    it("Should update user profile", async () => {
        const loginRes = await request(app)
            .post("/api/v1/user/login")
            .send({
                email: "dileep22malviya@gmail.com",
                password: "Dileep@7789"
            })

        const token = loginRes.body.data?.accessToken;

        const res = await request(app)
            .post("/api/v1/user/update-user-profile")
            .set("Authorization", `Bearer ${token}`)
            .send({
                firstName: "gotu u",
                lastName: "lohar",
            })

        expect(res.body.message).toBe("User profile updated successfully.")
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
    })
})

describe("GET /api/v1/user/get-all-users", () => {
    it("Should get all users", async () => {
        const loginRes = await request(app)
            .post("/api/v1/user/login")
            .send({
                email: "dileep22malviya@gmail.com",
                password: "Dileep@7789"
            })

        const token = loginRes.body.data?.accessToken;

        const res = await request(app)
            .get("/api/v1/user/get-all-users?search=dileep9malviya")
            .set("Authorization", `Bearer ${token}`)

        expect(res.body.message).toBe("Users retrieved successfully.")
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
    })
})

describe("GET /api/v1/user/get-userById/:id", () => {
    it("Should get user by id", async () => {
        const loginRes = await request(app)
            .post("/api/v1/user/login")
            .send({
                email: "dileep22malviya@gmail.com",
                password: "Dileep@7789"
            })

        const token = loginRes.body.data?.accessToken;

        const {_id}  = loginRes.body.data?.user;

        const res = await request(app)
            .get(`/api/v1/user/get-userById/${_id}`)
            .set("Authorization", `Bearer ${token}`)

        expect(res.body.message).toBe("User retrieved successfully.")
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
    })
})

describe("POST /api/v1/user/bulk",() => {
    it("get user in bulk", async () => {
        const res = await request(app)
            .post(`/api/v1/user/bulk`)
            .send({
                userIds : [
                    "6a84a52eebe36d7b680b1455",
                    "6a732a0e270b36447dea40b1"
                ]
            })

         expect(res.body.message).toBe("Users retrieved successfully.")
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
    })
})
