/**
 * SelectStep component for selecting representatives
 */
import { createElement, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { CouncillorItem } from './CouncillorItem';
import { PCCItem } from './PCCItem';
import type {
	RepresentativesData,
	Councillor,
	PCC,
	GenericRepresentative,
} from '../types';

interface SelectStepProps {
	data: RepresentativesData | GenericRepresentative[];
	onContinue: (
		selectedReps: Array< Councillor | PCC | GenericRepresentative >
	) => void;
}

export const SelectStep: React.FC< SelectStepProps > = ( {
	data,
	onContinue,
} ) => {
	const [ selectedReps, setSelectedReps ] = useState<
		Array< Councillor | PCC | GenericRepresentative >
	>( [] );

	const handleSelect = (
		rep: Councillor | PCC | GenericRepresentative,
		selected: boolean
	) => {
		if ( selected ) {
			setSelectedReps( [ ...selectedReps, rep ] );
		} else {
			setSelectedReps(
				selectedReps.filter(
					( r ) => JSON.stringify( r ) !== JSON.stringify( rep )
				)
			);
		}
	};

	const handleContinue = () => {
		if ( selectedReps.length === 0 ) {
			// eslint-disable-next-line no-alert
			alert(
				__(
					'Please select at least one representative.',
					'find-my-rep'
				)
			);
			return;
		}
		onContinue( selectedReps );
	};

	const isNestedData = ( d: any ): d is RepresentativesData => {
		return d && ( d.councillors || d.pcc );
	};

	const renderContent = () => {
		if ( isNestedData( data ) ) {
			return [
				data.councillors &&
					data.councillors.length > 0 &&
					createElement(
						'div',
						{
							key: 'councillors-section',
							className: 'representatives-section',
						},
						createElement(
							'h4',
							null,
							__( 'Local Councillors', 'find-my-rep' )
						),
						data.councillors.map( ( councillor, index ) =>
							createElement( CouncillorItem, {
								key: `councillor-${ index }`,
								councillor,
								index,
								onSelect: ( c, s ) =>
									handleSelect( c as Councillor, s ),
							} )
						)
					),
				data.pcc &&
					createElement(
						'div',
						{
							key: 'pcc-section',
							className: 'representatives-section',
						},
						createElement(
							'h4',
							null,
							__( 'Police and Crime Commissioner', 'find-my-rep' )
						),
						createElement( PCCItem, {
							pcc: data.pcc,
							index: data.councillors
								? data.councillors.length
								: 0,
							onSelect: ( p, s ) => handleSelect( p as PCC, s ),
						} )
					),
			];
		}

		if ( Array.isArray( data ) ) {
			return data.map( ( rep, index ) =>
				createElement(
					'div',
					{
						key: `rep-${ index }`,
						className: 'representative-item',
					},
					createElement( 'input', {
						type: 'checkbox',
						id: `rep-${ index }`,
						onChange: ( e: any ) =>
							handleSelect( rep, e.target.checked ),
						'data-rep': JSON.stringify( rep ),
					} ),
					createElement( 'label', {
						htmlFor: `rep-${ index }`,
						dangerouslySetInnerHTML: {
							__html: `
                        <strong>${ rep.name }</strong><br>
                        <em>${
							rep.title || rep.type || 'Representative'
						}</em><br>
                        ${ rep.email || '' }
                    `,
						},
					} )
				)
			);
		}

		return null;
	};

	return createElement(
		'div',
		{ className: 'find-my-rep-step step-select' },
		createElement(
			'h3',
			null,
			__( 'Select Representatives to Contact', 'find-my-rep' )
		),
		createElement(
			'div',
			{ className: 'representatives-list' },
			renderContent()
		),
		createElement(
			'button',
			{
				className: 'button button-primary continue-btn',
				onClick: handleContinue,
			},
			__( 'Continue', 'find-my-rep' )
		)
	);
};
