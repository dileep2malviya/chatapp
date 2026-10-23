import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "../../../src/features/auth/components/RegisterForm";
import { useRegister } from "../../../src/features/auth/hook/useRegsiter"
import { expect, test } from "@jest/globals";

jest.mock("../../../src/features/auth/hook/useRegsiter", () => ({
  useRegister: jest.fn(),
}));

const mockRegister = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  (useRegister as jest.Mock).mockReturnValue({
    userRegister: mockRegister,
    isLoading: false,
  });
});

test("should render register form", () => {
  render(<RegisterForm />);

  expect(screen.getByText("Welcome to ChatApp")).toBeInTheDocument();

  expect(screen.getByPlaceholderText("Enter Your First Name")).toBeInTheDocument();

  expect(screen.getByPlaceholderText("Enter Your Last Name")).toBeInTheDocument();

  expect(screen.getByPlaceholderText("Enter Your Username")).toBeInTheDocument();

  expect(screen.getByPlaceholderText("Enter Your Email")).toBeInTheDocument();

  expect(screen.getByPlaceholderText("Enter Your Password")).toBeInTheDocument();

  expect(screen.getByPlaceholderText("Enter Your Confirm Password")).toBeInTheDocument();

  expect(screen.getByRole("button", { name: /Register/i })).toBeInTheDocument();
});

test("should show validation errors", async () => {

  render(<RegisterForm />);

  await userEvent.click(
    screen.getByRole("button", { name: /register/i })
  );

  expect(mockRegister).not.toHaveBeenCalled();
});

test("should show invalid email", async () => {

  render(<RegisterForm />);

  await userEvent.type(
    screen.getByPlaceholderText("Enter Your Email"),
    "abc"
  );

  await userEvent.click(
    screen.getByRole("button", { name: /register/i })
  );

  expect(
    await screen.findByText(/Enter a valid email/i)
  ).toBeInTheDocument();
});

test("should show password mismatch error", async () => {

  render(<RegisterForm />);

  await userEvent.type(
    screen.getByPlaceholderText("Enter Your Password"),
    "Password@123"
  );

  await userEvent.type(
    screen.getByPlaceholderText("Enter Your Confirm Password"),
    "Password@12"
  );

  await userEvent.click(
    screen.getByRole("button", { name: /register/i })
  );

  expect(
    await screen.findByText("Passwords do not match.")
  ).toBeInTheDocument();

  expect(mockRegister).not.toHaveBeenCalled();
});

test("should submit register form", async () => {

  render(<RegisterForm />);

  await userEvent.type(
    screen.getByPlaceholderText("Enter Your First Name"),
    "Dileep"
  );

  await userEvent.type(
    screen.getByPlaceholderText("Enter Your Last Name"),
    "Lohar"
  );

  await userEvent.type(
    screen.getByPlaceholderText("Enter Your Username"),
    "dileep123"
  );

  await userEvent.type(
    screen.getByPlaceholderText("Enter Your Email"),
    "test@gmail.com"
  );

  await userEvent.type(
    screen.getByPlaceholderText("Enter Your Password"),
    "Password@123"
  );

  await userEvent.type(
    screen.getByPlaceholderText("Enter Your Confirm Password"),
    "Password@123"
  );

  await userEvent.click(
    screen.getByRole("button", { name: /register/i })
  );

  await waitFor(() => {
    expect(mockRegister).toHaveBeenCalledTimes(1);
  });
});

test("should show default placeholder when no image is selected", () => {
  render(<RegisterForm />);

  expect(
    screen.getByText("No photo selected")
  ).toBeInTheDocument();
});

test("should upload profile image", async () => {
  render(<RegisterForm />);

  const file = new File(
    ["avatar"],
    "avatar.png",
    { type: "image/png" }
  );

  const input = document.getElementById("avatar") as HTMLInputElement;

  await userEvent.upload(input, file);

  expect(input.files).toHaveLength(1);
  expect(input.files?.[0]).toBe(file);
});

test("should show loading state", () => {
(useRegister as jest.Mock).mockReturnValue({
    userRegister: mockRegister,
    isLoading: true
});

render(<RegisterForm />);

expect(
    screen.getByRole("button")
).toBeDisabled();
});

test("should render sign in link", () => {

    render(<RegisterForm />);

    expect(
        screen.getByRole("link", {
            name:/sign in/i
        })
    ).toHaveAttribute(
        "href",
        "/auth/login"
    );
});
