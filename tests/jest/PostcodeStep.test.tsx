import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PostcodeStep } from '../../src/components/PostcodeStep';

describe('PostcodeStep Component', () => {
	const mockOnFindReps = jest.fn();

	beforeEach(() => {
		mockOnFindReps.mockClear();
	});

	test('renders the postcode step with input and button', () => {
		render(
			<PostcodeStep
				onFindReps={mockOnFindReps}
				loading={false}
			/>
		);

		expect(screen.getByText('Find Your Representatives')).toBeInTheDocument();
		expect(screen.getByLabelText(/Enter your postcode/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Find Representatives/i })).toBeInTheDocument();
	});

	test('shows placeholder text in input', () => {
		render(
			<PostcodeStep
				onFindReps={mockOnFindReps}
				loading={false}
			/>
		);

		const input = screen.getByPlaceholderText('e.g. SW1A 1AA');
		expect(input).toBeInTheDocument();
	});

	test('does not call onFindReps when postcode is empty', () => {
		render(
			<PostcodeStep
				onFindReps={mockOnFindReps}
				loading={false}
			/>
		);

		const button = screen.getByRole('button', { name: /Find Representatives/i });
		fireEvent.click(button);

		expect(mockOnFindReps).not.toHaveBeenCalled();
	});

	test('does not call onFindReps when postcode is only whitespace', () => {
		render(
			<PostcodeStep
				onFindReps={mockOnFindReps}
				loading={false}
			/>
		);

		const input = screen.getByLabelText(/Enter your postcode/i);
		fireEvent.change(input, { target: { value: '   ' } });

		const button = screen.getByRole('button', { name: /Find Representatives/i });
		fireEvent.click(button);

		expect(mockOnFindReps).not.toHaveBeenCalled();
	});

	test('calls onFindReps with trimmed postcode on button click', () => {
		render(
			<PostcodeStep
				onFindReps={mockOnFindReps}
				loading={false}
			/>
		);

		const input = screen.getByLabelText(/Enter your postcode/i);
		fireEvent.change(input, { target: { value: '  SW1A 1AA  ' } });

		const button = screen.getByRole('button', { name: /Find Representatives/i });
		fireEvent.click(button);

		expect(mockOnFindReps).toHaveBeenCalledWith('SW1A 1AA');
	});

	test('calls onFindReps on Enter key press', () => {
		render(
			<PostcodeStep
				onFindReps={mockOnFindReps}
				loading={false}
			/>
		);

		const input = screen.getByLabelText(/Enter your postcode/i);
		fireEvent.change(input, { target: { value: 'M1 1AA' } });
		fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

		expect(mockOnFindReps).toHaveBeenCalledWith('M1 1AA');
	});

	test('does not call onFindReps on other key press', () => {
		render(
			<PostcodeStep
				onFindReps={mockOnFindReps}
				loading={false}
			/>
		);

		const input = screen.getByLabelText(/Enter your postcode/i);
		fireEvent.change(input, { target: { value: 'M1 1AA' } });
		fireEvent.keyPress(input, { key: 'Tab', code: 'Tab' });

		expect(mockOnFindReps).not.toHaveBeenCalled();
	});

	test('disables input when loading', () => {
		render(
			<PostcodeStep
				onFindReps={mockOnFindReps}
				loading={true}
			/>
		);

		const input = screen.getByLabelText(/Enter your postcode/i);
		expect(input).toBeDisabled();
	});

	test('disables button when loading', () => {
		render(
			<PostcodeStep
				onFindReps={mockOnFindReps}
				loading={true}
			/>
		);

		const button = screen.getByRole('button', { name: /Find Representatives/i });
		expect(button).toBeDisabled();
	});

	test('displays error message when provided', () => {
		render(
			<PostcodeStep
				onFindReps={mockOnFindReps}
				loading={false}
				error="No representatives found for this postcode."
			/>
		);

		expect(screen.getByText('No representatives found for this postcode.')).toBeInTheDocument();
	});

	test('does not display error message when not provided', () => {
		render(
			<PostcodeStep
				onFindReps={mockOnFindReps}
				loading={false}
			/>
		);

		expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
	});

	test('error message has correct class for styling', () => {
		render(
			<PostcodeStep
				onFindReps={mockOnFindReps}
				loading={false}
				error="Test error message"
			/>
		);

		const errorMessage = screen.getByText('Test error message');
		expect(errorMessage).toHaveClass('error-message');
	});

	test('input updates value when user types', () => {
		render(
			<PostcodeStep
				onFindReps={mockOnFindReps}
				loading={false}
			/>
		);

		const input = screen.getByLabelText(/Enter your postcode/i) as HTMLInputElement;
		fireEvent.change(input, { target: { value: 'CF10 1AA' } });

		expect(input.value).toBe('CF10 1AA');
	});

	test('button has correct CSS class for styling', () => {
		render(
			<PostcodeStep
				onFindReps={mockOnFindReps}
				loading={false}
			/>
		);

		const button = screen.getByRole('button', { name: /Find Representatives/i });
		expect(button).toHaveClass('find-reps-btn');
		expect(button).toHaveClass('button-primary');
	});

	test('input has correct CSS class for styling', () => {
		render(
			<PostcodeStep
				onFindReps={mockOnFindReps}
				loading={false}
			/>
		);

		const input = screen.getByLabelText(/Enter your postcode/i);
		expect(input).toHaveClass('postcode-input');
	});
});
