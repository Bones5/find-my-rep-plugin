import {
	apiResponseToSelectableReps,
	mpToSelectable,
	msToSelectable,
	pccToSelectable,
	councillorToSelectable,
} from '../../src/types';
import type {
	RepresentativesApiResponse,
	MP,
	MS,
	PCC,
	Councillor,
	SelectableRepresentative,
} from '../../src/types';

describe('Type Utility Functions', () => {
	describe('mpToSelectable', () => {
		it('converts an MP to a SelectableRepresentative', () => {
			const mp: MP = {
				id: 1,
				name: 'John Smith',
				party: 'Labour',
				constituency: 'Test Constituency',
				email: 'john@parliament.uk',
				phone: '020 1234 5678',
				website: 'https://johnsmith.mp',
			};

			const result = mpToSelectable(mp);

			expect(result).toEqual({
				type: 'MP',
				id: 1,
				name: 'John Smith',
				email: 'john@parliament.uk',
				party: 'Labour',
				constituency: 'Test Constituency',
				phone: '020 1234 5678',
				website: 'https://johnsmith.mp',
			});
		});

		it('handles MP with optional fields missing', () => {
			const mp: MP = {
				id: 2,
				name: 'Jane Doe',
				party: 'Conservative',
				constituency: 'Another Constituency',
				email: 'jane@parliament.uk',
			};

			const result = mpToSelectable(mp);

			expect(result.type).toBe('MP');
			expect(result.phone).toBeUndefined();
			expect(result.website).toBeUndefined();
		});
	});

	describe('msToSelectable', () => {
		it('converts an MS to a SelectableRepresentative', () => {
			const ms: MS = {
				id: 1,
				name: 'Welsh Representative',
				party: 'Plaid Cymru',
				constituency: 'Cardiff Central',
				email: 'rep@senedd.wales',
				phone: '029 1234 5678',
				website: 'https://example.senedd.wales',
			};

			const result = msToSelectable(ms);

			expect(result).toEqual({
				type: 'MS',
				id: 1,
				name: 'Welsh Representative',
				email: 'rep@senedd.wales',
				party: 'Plaid Cymru',
				constituency: 'Cardiff Central',
				phone: '029 1234 5678',
				website: 'https://example.senedd.wales',
			});
		});
	});

	describe('pccToSelectable', () => {
		it('converts a PCC to a SelectableRepresentative', () => {
			const pcc: PCC = {
				id: 1,
				name: 'Police Commissioner',
				force: 'Metropolitan Police',
				area: 'Greater London',
				email: 'pcc@met.police.uk',
				website: 'https://met.police.uk/pcc',
			};

			const result = pccToSelectable(pcc);

			expect(result).toEqual({
				type: 'PCC',
				id: 1,
				name: 'Police Commissioner',
				email: 'pcc@met.police.uk',
				force: 'Metropolitan Police',
				area: 'Greater London',
				website: 'https://met.police.uk/pcc',
			});
		});

		it('handles PCC without optional website', () => {
			const pcc: PCC = {
				id: 2,
				name: 'Another Commissioner',
				force: 'West Midlands Police',
				area: 'West Midlands',
				email: 'pcc@westmidlands.police.uk',
			};

			const result = pccToSelectable(pcc);

			expect(result.type).toBe('PCC');
			expect(result.website).toBeUndefined();
		});
	});

	describe('councillorToSelectable', () => {
		it('converts a Councillor to a SelectableRepresentative', () => {
			const councillor: Councillor = {
				id: 1,
				name: 'Local Councillor',
				party: 'Green',
				ward: 'Central Ward',
				council: 'Test City Council',
				email: 'councillor@council.gov.uk',
				phone: '0123 456 789',
			};

			const result = councillorToSelectable(councillor);

			expect(result).toEqual({
				type: 'Councillor',
				id: 1,
				name: 'Local Councillor',
				email: 'councillor@council.gov.uk',
				party: 'Green',
				ward: 'Central Ward',
				council: 'Test City Council',
				phone: '0123 456 789',
			});
		});
	});

	describe('apiResponseToSelectableReps', () => {
		it('converts a full API response with all representative types', () => {
			const apiResponse: RepresentativesApiResponse = {
				postcode: 'SW1A 1AA',
				mp: {
					id: 1,
					name: 'MP Name',
					party: 'Labour',
					constituency: 'Westminster',
					email: 'mp@parliament.uk',
				},
				ms: {
					id: 2,
					name: 'MS Name',
					party: 'Plaid Cymru',
					constituency: 'Cardiff',
					email: 'ms@senedd.wales',
				},
				pcc: {
					id: 3,
					name: 'PCC Name',
					force: 'Met Police',
					area: 'London',
					email: 'pcc@met.uk',
				},
				councillors: [
					{
						id: 4,
						name: 'Councillor One',
						party: 'Conservative',
						ward: 'North Ward',
						council: 'Test Council',
						email: 'cllr1@council.uk',
					},
					{
						id: 5,
						name: 'Councillor Two',
						party: 'Labour',
						ward: 'South Ward',
						council: 'Test Council',
						email: 'cllr2@council.uk',
					},
				],
			};

			const result = apiResponseToSelectableReps(apiResponse);

			expect(result).toHaveLength(5);
			expect(result[0].type).toBe('MP');
			expect(result[1].type).toBe('MS');
			expect(result[2].type).toBe('PCC');
			expect(result[3].type).toBe('Councillor');
			expect(result[4].type).toBe('Councillor');
		});

		it('handles response with only MP', () => {
			const apiResponse: RepresentativesApiResponse = {
				postcode: 'M1 1AA',
				mp: {
					id: 1,
					name: 'MP Only',
					party: 'Labour',
					constituency: 'Manchester',
					email: 'mp@parliament.uk',
				},
			};

			const result = apiResponseToSelectableReps(apiResponse);

			expect(result).toHaveLength(1);
			expect(result[0].type).toBe('MP');
			expect(result[0].name).toBe('MP Only');
		});

		it('handles response with null values', () => {
			const apiResponse: RepresentativesApiResponse = {
				postcode: 'SW1A 1AA',
				mp: null,
				ms: null,
				pcc: null,
				councillors: [],
			};

			const result = apiResponseToSelectableReps(apiResponse);

			expect(result).toHaveLength(0);
		});

		it('handles response with empty councillors array', () => {
			const apiResponse: RepresentativesApiResponse = {
				postcode: 'SW1A 1AA',
				mp: {
					id: 1,
					name: 'MP Name',
					party: 'Labour',
					constituency: 'Test',
					email: 'mp@parliament.uk',
				},
				councillors: [],
			};

			const result = apiResponseToSelectableReps(apiResponse);

			expect(result).toHaveLength(1);
		});

		it('handles response with undefined fields', () => {
			const apiResponse: RepresentativesApiResponse = {
				postcode: 'SW1A 1AA',
			};

			const result = apiResponseToSelectableReps(apiResponse);

			expect(result).toHaveLength(0);
		});

		it('preserves order: MP, MS, PCC, then Councillors', () => {
			const apiResponse: RepresentativesApiResponse = {
				postcode: 'CF10 1AA',
				councillors: [
					{
						id: 1,
						name: 'Councillor',
						party: 'Lab',
						ward: 'W',
						council: 'C',
						email: 'c@c.uk',
					},
				],
				pcc: {
					id: 2,
					name: 'PCC',
					force: 'F',
					area: 'A',
					email: 'p@p.uk',
				},
				mp: {
					id: 3,
					name: 'MP',
					party: 'Lab',
					constituency: 'C',
					email: 'm@m.uk',
				},
				ms: {
					id: 4,
					name: 'MS',
					party: 'PC',
					constituency: 'C',
					email: 's@s.uk',
				},
			};

			const result = apiResponseToSelectableReps(apiResponse);

			expect(result[0].type).toBe('MP');
			expect(result[1].type).toBe('MS');
			expect(result[2].type).toBe('PCC');
			expect(result[3].type).toBe('Councillor');
		});
	});
});
