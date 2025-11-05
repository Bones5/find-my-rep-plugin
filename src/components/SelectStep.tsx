import React, { useState } from 'react';
import type { Representative, GeographicInfo } from '../types';

interface SelectStepProps {
	representatives: Representative[];
	geographicInfo?: GeographicInfo;
	onContinue: ( selectedReps: Representative[] ) => void;
}

export const SelectStep: React.FC< SelectStepProps > = ( {
	representatives,
	geographicInfo,
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
			<div className="representatives-list">
				{ representatives.map( ( rep, index ) => {
					// Use email as unique key, fallback to index if email is missing
					const key = rep.email || `rep-${ index }`;
					const repType = rep.type || rep.title || 'Representative';
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
									{ repType }
								</div>
								{ geographicInfo && (
									<div className="rep-geographic-info">
										{ geographicInfo.area && (
											<span className="geo-detail">
												{ geographicInfo.area }
											</span>
										) }
										{ geographicInfo.ward && (
											<span className="geo-detail">
												{ geographicInfo.ward }
											</span>
										) }
										{ geographicInfo.westminster_constituency && (
											<span className="geo-detail">
												{
													geographicInfo.westminster_constituency
												}
											</span>
										) }
										{ geographicInfo.devolved_constituency && (
											<span className="geo-detail">
												{
													geographicInfo.devolved_constituency
												}
											</span>
										) }
									</div>
								) }
								<div className="rep-details">
									<strong>{ rep.name }</strong>
									{ rep.title && (
										<div className="rep-title-detail">
											{ rep.title }
										</div>
									) }
									<div className="rep-email">
										{ rep.email }
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
