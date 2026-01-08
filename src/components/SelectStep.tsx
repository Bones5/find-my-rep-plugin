import React, { useState } from 'react';
import type { SelectableRepresentative, AreaInfo } from '../types';

interface SelectStepProps {
	representatives: SelectableRepresentative[];
	areaInfo: AreaInfo | null;
	onContinue: ( selectedReps: SelectableRepresentative[] ) => void;
}

/**
 * Get descriptive title for a representative type
 */
function getRepresentativeTypeLabel( type: string ): string {
	switch ( type ) {
		case 'MP':
			return 'Member of Parliament';
		case 'MS':
			return 'Member of the Senedd';
		case 'PCC':
			return 'Police and Crime Commissioner';
		case 'Councillor':
			return 'Local Councillor';
		default:
			return type;
	}
}

/**
 * Get contextual information for a representative (constituency, ward, etc.)
 */
function getRepresentativeContext( rep: SelectableRepresentative ): string {
	switch ( rep.type ) {
		case 'MP':
		case 'MS':
			return rep.constituency || '';
		case 'PCC':
			return rep.force || rep.area || '';
		case 'Councillor':
			return [ rep.ward, rep.council ].filter( Boolean ).join( ', ' );
		default:
			return '';
	}
}

export const SelectStep: React.FC< SelectStepProps > = ( {
	representatives,
	areaInfo,
	onContinue,
} ) => {
	const [ selectedIds, setSelectedIds ] = useState< Set< number > >(
		new Set()
	);

	const handleCheckboxChange = ( index: number ) => {
		const newSelectedIds = new Set( selectedIds );
		if ( newSelectedIds.has( index ) ) {
			newSelectedIds.delete( index );
		} else {
			newSelectedIds.add( index );
		}
		setSelectedIds( newSelectedIds );
	};

	const handleContinue = () => {
		if ( selectedIds.size === 0 ) {
			// eslint-disable-next-line no-alert
			alert( 'Please select at least one representative.' );
			return;
		}

		const selectedReps = representatives.filter( ( _, index ) =>
			selectedIds.has( index )
		);
		onContinue( selectedReps );
	};

	return (
		<div className="find-my-rep-step step-select">
			<h3>Select Representatives to Contact</h3>

			{ /* Area information header */ }
			{ areaInfo && (
				<div className="area-info-summary">
					{ areaInfo.localAuthority && (
						<span className="area-badge">
							{ areaInfo.localAuthority.name }
						</span>
					) }
					{ areaInfo.constituency && (
						<span className="area-badge">
							{ areaInfo.constituency.name }
						</span>
					) }
				</div>
			) }

			<div className="representatives-list">
				{ representatives.map( ( rep, index ) => {
					const key = `${ rep.type }-${ rep.id }`;
					const typeLabel = getRepresentativeTypeLabel( rep.type );
					const context = getRepresentativeContext( rep );

					return (
						<div key={ key } className="representative-item">
							<input
								type="checkbox"
								id={ `rep-${ index }` }
								checked={ selectedIds.has( index ) }
								onChange={ () => handleCheckboxChange( index ) }
							/>
							<label htmlFor={ `rep-${ index }` }>
								<div className="rep-type-title">
									{ typeLabel }
								</div>
								{ context && (
									<div className="rep-context">
										{ context }
									</div>
								) }
								<div className="rep-details">
									<strong>{ rep.name }</strong>
									{ rep.party && (
										<span className="rep-party">
											{ rep.party }
										</span>
									) }
									<div className="rep-contact-info">
										<span className="rep-email">
											{ rep.email }
										</span>
										{ rep.phone && (
											<span className="rep-phone">
												<a
													href={ `tel:${ rep.phone }` }
												>
													{ rep.phone }
												</a>
											</span>
										) }
										{ rep.website && (
											<span className="rep-website">
												<a
													href={ rep.website }
													target="_blank"
													rel="noopener noreferrer"
												>
													Website
												</a>
											</span>
										) }
									</div>
								</div>
							</label>
						</div>
					);
				} ) }
			</div>
			<button
				className="button button-primary continue-btn"
				onClick={ handleContinue }
			>
				Continue
			</button>
		</div>
	);
};
