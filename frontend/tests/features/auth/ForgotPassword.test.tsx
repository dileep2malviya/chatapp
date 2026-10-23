import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordForm from "../../../src/features/auth/components/ForgotPassword";
import { useForgotPassword } from "../../../src/features/auth/hook/useForgotPassword";
import { expect, test } from "@jest/globals"

jest.mock("../../../src/features/auth/hook/useForgotPassword", () => ({
    useForgotPassword: jest.fn(),
}));

const mockForgotPassword = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();

    (useForgotPassword as jest.Mock).mockReturnValue({
        forgotpassword: mockForgotPassword,
        isLoading: false,
    });
});


    test("should render forgot password form", () => {
        render(<ForgotPasswordForm />);

        expect(screen.getByText("Forgot Password")).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText("Enter Your Email")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: /send reset code/i,
            })
        ).toBeInTheDocument();
    });

    test("should allow user to type email", async () => {
        render(<ForgotPasswordForm />);

        const email = screen.getByPlaceholderText("Enter Your Email");

        await userEvent.type(email, "test@gmail.com");

        expect(email).toHaveValue("test@gmail.com");
    });

    test("should show validation error for empty email", async () => {
        render(<ForgotPasswordForm />);

        await userEvent.click(
            screen.getByRole("button", {
                name: /send reset code/i,
            })
        );

        expect(mockForgotPassword).not.toHaveBeenCalled();

        expect(
            await screen.findByText(/Enter a valid email/i)
        ).toBeInTheDocument();
    });


    test("should submit correct email", async () => {
        render(<ForgotPasswordForm />);

        await userEvent.type(
            screen.getByPlaceholderText("Enter Your Email"),
            "dileep2malviya@gmail.com"
        );

        await userEvent.click(
            screen.getByRole("button", {
                name: /send reset code/i,
            })
        );

        await waitFor(() => {
            expect(mockForgotPassword).toHaveBeenCalledWith({
                email: "dileep2malviya@gmail.com",
            });
        });
    });

    test("should render sign in link", () => {
        render(<ForgotPasswordForm />);

        expect(
            screen.getByRole("link", {
                name: /sign in/i,
            })
        ).toHaveAttribute("href", "/auth/login");
    });

    test("should disable button while loading", () => {
        (useForgotPassword as jest.Mock).mockReturnValue({
            forgotpassword: mockForgotPassword,
            isLoading: true,
        });

        render(<ForgotPasswordForm />);

        expect(
            screen.getByRole("button")
        ).toBeDisabled();
    });
