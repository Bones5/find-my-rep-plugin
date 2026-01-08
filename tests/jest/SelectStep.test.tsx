import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SelectStep } from '../../src/components/SelectStep';
import type { SelectableRepresentative, AreaInfo } from '../../src/types';

describe('SelectStep Component', () => {
	const mockOnContinue = jest.fn();

	const mockRepresentatives: SelectableRepresentative[] = [
		{
			type: 'MP',
			id: 1,
			name: 'John Smith MP',
			email: 'john@parliament.uk',
			party: 'Labour',
			constituency: 'Test Constituency',
			phone: '020 1234 5678',
			website: 'https://johnsmith.mp',
		},
		{
			type: 'Councillor',
			id: 2,
			name: 'Jane Doe',
			email: 'jane@council.gov.uk',
			party: 'Conservative',
			ward: 'North Ward',
			council: 'Test City Council',
		},
		{
			type: 'PCC',
			id: 3,
			name: 'Police Commissioner',
			email: 'pcc@police.uk',
			force: 'Metropolitan Police',
			area: 'Greater London',
		},
	];

	const mockAreaInfo: AreaInfo = {
		constituency: {
			id: 1,
			name: 'Test Constituency',
			code: 'E14000001',
		},
		localAuthority: {
			id: 2,
			name: 'Test City Council',
			code: 'E09000001',
			type: 'London borough',
		},
		ward: {
			id: 3,
			name: 'North Ward',
			code: 'E05000001',
			type: 'London borough ward',
		},
	};

	beforeEach(() => {
		mockOnContinue.mockClear();
	});

	test('renders all representatives', () => {
		render(
			<SelectStep
				representatives={mockRepresentatives}
				areaInfo={mockAreaInfo}
				onContinue={mockOnContinue}
			/>
		);

		expect(screen.getByText('John Smith MP')).toBeInTheDocument();
		expect(screen.getByText('Jane Doe')).toBeInTheDocument();
		expect(screen.getByText('Police Commissioner')).toBeInTheDocument();
	});

	test('renders representative type labels correctly', () => {
		render(
			<SelectStep
				representatives={mockRepresentatives}
				areaInfo={mockAreaInfo}
				onContinue={mockOnContinue}
			/>
		);

		expect(screen.getByText('Member of Parliament')).toBeInTheDocument();
		expect(screen.getByText('Local Councillor')).toBeInTheDocument();
		expect(screen.getByText('Police and Crime Commissioner')).toBeInTheDocument();
	});

	test('renders area info badges when provided', () => {
		render(
			<SelectStep
				representatives={mockRepresentatives}
				areaInfo={mockAreaInfo}
				onContinue={mockOnContinue}
			/>
		);

		expect(screen.getByText('Test City Council')).toBeInTheDocument();
		// Test Constituency appears in both the area badge and MP context
		expect(screen.getAllByText('Test Constituency')).toHaveLength(2);
	});

	test('does not render area info when null', () => {
		render(
			<SelectStep
				representatives={mockRepresentatives}
				areaInfo={null}
				onContinue={mockOnContinue}
			/>
		);

		// Area badges should not be present
		expect(screen.queryByText('Test City Council')).not.toBeInTheDocument();
	});

	test('renders party badges for representatives', () => {
		render(
			<SelectStep
				representatives={mockRepresentatives}
				areaInfo={null}
				onContinue={mockOnContinue}
			/>
		);

		expect(screen.getByText('Labour')).toBeInTheDocument();
		expect(screen.getByText('Conservative')).toBeInTheDocument();
	});

	test('renders context information (constituency, ward, force)', () => {
		render(
			<SelectStep
				representatives={mockRepresentatives}
				areaInfo={null}
				onContinue={mockOnContinue}
			/>
		);

		// MP context - constituency
		expect(screen.getByText('Test Constituency')).toBeInTheDocument();
		// Councillor context - ward, council
		expect(screen.getByText('North Ward, Test City Council')).toBeInTheDocument();
		// PCC context - force
		expect(screen.getByText('Metropolitan Police')).toBeInTheDocument();
	});

	test('allows selecting representatives with checkboxes', () => {
		render(
			<SelectStep
				representatives={mockRepresentatives}
				areaInfo={null}
				onContinue={mockOnContinue}
			/>
		);

		const checkboxes = screen.getAllByRole('checkbox');
		expect(checkboxes).toHaveLength(3);

		// Click first checkbox
		fireEvent.click(checkboxes[0]);
		expect(checkboxes[0]).toBeChecked();

		// Click to uncheck
		fireEvent.click(checkboxes[0]);
		expect(checkboxes[0]).not.toBeChecked();
	});

	test('shows alert when continuing without selection', () => {
		const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

		render(
			<SelectStep
				representatives={mockRepresentatives}
				areaInfo={null}
				onContinue={mockOnContinue}
			/>
		);

		const continueButton = screen.getByRole('button', { name: /Continue/i });
		fireEvent.click(continueButton);

		expect(alertSpy).toHaveBeenCalledWith('Please select at least one representative.');
		expect(mockOnContinue).not.toHaveBeenCalled();

		alertSpy.mockRestore();
	});

	test('calls onContinue with selected representatives', () => {
		render(
			<SelectStep
				representatives={mockRepresentatives}
				areaInfo={null}
				onContinue={mockOnContinue}
			/>
		);

		const checkboxes = screen.getAllByRole('checkbox');

		// Select first and third representatives
		fireEvent.click(checkboxes[0]);
		fireEvent.click(checkboxes[2]);

		const continueButton = screen.getByRole('button', { name: /Continue/i });
		fireEvent.click(continueButton);

		expect(mockOnContinue).toHaveBeenCalledWith([
			mockRepresentatives[0],
			mockRepresentatives[2],
		]);
	});

	test('renders phone links when available', () => {
		render(
			<SelectStep
				representatives={mockRepresentatives}
				areaInfo={null}
				onContinue={mockOnContinue}
			/>
		);

		const phoneLink = screen.getByRole('link', { name: '020 1234 5678' });
		expect(phoneLink).toHaveAttribute('href', 'tel:020 1234 5678');
	});

	test('renders website links when available', () => {
		render(
			<SelectStep
				representatives={mockRepresentatives}
				areaInfo={null}
				onContinue={mockOnContinue}
			/>
		);

		const websiteLink = screen.getByRole('link', { name: 'Website' });
		expect(websiteLink).toHaveAttribute('href', 'https://johnsmith.mp');
		expect(websiteLink).toHaveAttribute('target', '_blank');
		expect(websiteLink).toHaveAttribute('rel', 'noopener noreferrer');
	});

	test('handles MS representative type', () => {
		const msRep: SelectableRepresentative = {
			type: 'MS',
			id: 1,
			name: 'Welsh MS',
			email: 'ms@senedd.wales',
			party: 'Plaid Cymru',
			constituency: 'Cardiff Central',
		};

		render(
			<SelectStep
				representatives={[msRep]}
				areaInfo={null}
				onContinue={mockOnContinue}
			/>
		);

		expect(screen.getByText('Member of the Senedd')).toBeInTheDocument();
		expect(screen.getByText('Welsh MS')).toBeInTheDocument();
		expect(screen.getByText('Cardiff Central')).toBeInTheDocument();
	});

	test('renders email addresses for all representatives', () => {
		render(
			<SelectStep
				representatives={mockRepresentatives}
				areaInfo={null}
				onContinue={mockOnContinue}
			/>
		);

		expect(screen.getByText('john@parliament.uk')).toBeInTheDocument();
		expect(screen.getByText('jane@council.gov.uk')).toBeInTheDocument();
		expect(screen.getByText('pcc@police.uk')).toBeInTheDocument();
	});

	test('selecting multiple representatives works correctly', () => {
		render(
			<SelectStep
				representatives={mockRepresentatives}
				areaInfo={null}
				onContinue={mockOnContinue}
			/>
		);

		const checkboxes = screen.getAllByRole('checkbox');

		// Select all
		checkboxes.forEach((checkbox) => fireEvent.click(checkbox));
		checkboxes.forEach((checkbox) => expect(checkbox).toBeChecked());

		const continueButton = screen.getByRole('button', { name: /Continue/i });
		fireEvent.click(continueButton);

		expect(mockOnContinue).toHaveBeenCalledWith(mockRepresentatives);
	});
});
