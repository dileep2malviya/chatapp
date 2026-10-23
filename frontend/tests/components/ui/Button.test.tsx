import { render, screen } from "@testing-library/react";
import { expect, test } from "@jest/globals";
import CustomButton from "../../../src/components/ui/button/Button";

test("renders button content", () => {
	render(<CustomButton>Continue</CustomButton>);

	expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
});
