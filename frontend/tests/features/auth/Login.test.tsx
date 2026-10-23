import { render, screen } from "@testing-library/react";
import LoginForm from "../../../src/features/auth/components/LoginForm";
import userEvent from "@testing-library/user-event";
import { useLogin } from "../../../src/features/auth/hook/useLogin"
import { expect, test } from "@jest/globals"

jest.mock("../../../src/features/auth/hook/useLogin", () => ({
  useLogin: jest.fn(),
}));

const mockLogin = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  (useLogin as jest.Mock).mockReturnValue({
    login: mockLogin,
    isLoading: false,
  })
});

  test("should render login form", () => {
    render(<LoginForm />);

    expect(screen.getByText("Welcome to ChatApp")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /login/i })
    ).toBeInTheDocument();
  });

  test("should render register link", () => {
    render(<LoginForm />);

    expect(screen.getByRole("link", { name: /register/i }))
      .toHaveAttribute("href", "/auth/register");
  });

  test("should render forgot password link", () => {
    render(<LoginForm />);

    expect(screen.getByRole("link", { name: /forgot password/i }))
      .toHaveAttribute("href", "/auth/forgot-password");
  });

  test("should allow user to type email", async () => {
    render(<LoginForm />);

    const email = screen.getByPlaceholderText("Enter Your Email");

    await userEvent.type(email, "test@gmail.com");

    expect(email).toHaveValue("test@gmail.com");
  });

  test("should allow user to type password", async () => {
    render(<LoginForm />);

    const password = screen.getByPlaceholderText("Enter Your Password");

    await userEvent.type(password, "123456");

    expect(password).toHaveValue("123456");
  });

  test("should show validation errors for empty form", async () => {
    render(<LoginForm />);

    await userEvent.click(
      screen.getByRole("button", { name: /login/i })
    );

    expect(await screen.findByText("Enter a valid email")).toBeInTheDocument();
    expect(await screen.findByText("Password must be at least 8 characters")).toBeInTheDocument();

    expect(mockLogin).not.toHaveBeenCalled();
  });

  test("should show invalid email validation", async () => {
    render(<LoginForm />);

    await userEvent.type(
      screen.getByPlaceholderText("Enter Your Email"),
      "abc"
    );

    await userEvent.type(
      screen.getByPlaceholderText("Enter Your Password"),
      "123456"
    );

    await userEvent.click(
      screen.getByRole("button", { name: /login/i })
    );

    expect(await screen.findByText("Enter a valid email"))
      .toBeInTheDocument();

    expect(mockLogin).not.toHaveBeenCalled()
  })

  test("should call login on valid submit", async () => {
    render(<LoginForm />)

    await userEvent.type(
      screen.getByPlaceholderText("Enter Your Email"),
      "test@gmail.com"
    )

    await userEvent.type(
      screen.getByPlaceholderText("Enter Your Password"),
      "Dileep@123"
    )

    await userEvent.click(
      screen.getByRole("button", { name: /login/i })
    )

    expect(mockLogin).toHaveBeenCalledTimes(1);
  })

  test("should submit correct form values", async () => {
    render(<LoginForm />);

    await userEvent.type(
      screen.getByPlaceholderText("Enter Your Email"),
      "dileep2malviya@gmail.com"
    )

    await userEvent.type(
      screen.getByPlaceholderText("Enter Your Password"),
      "Dileep@123"
    );

    await userEvent.click(
      screen.getByRole("button", { name: /login/i })
    )

    expect(mockLogin).toHaveBeenCalledWith({
      email: "dileep2malviya@gmail.com",
      password: "Dileep@123",
    });
  });

  test("should show loading state", () => {

    (useLogin as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: true,
    });

    render(<LoginForm />);

    expect(
      screen.getByRole("button")
    ).toBeDisabled();
  });