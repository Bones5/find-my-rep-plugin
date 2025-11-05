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
			{ geographicInfo && (
				<div className="geographic-info">
					{ geographicInfo.area && (
						<div className="geographic-item">
							<strong>Area:</strong>{ ' ' }
							{ geographicInfo.area }
						</div>
					) }
					{ geographicInfo.ward && (
						<div className="geographic-item">
							<strong>Ward:</strong>{ ' ' }
							{ geographicInfo.ward }
						</div>
					) }
					{ geographicInfo.westminster_constituency && (
						<div className="geographic-item">
							<strong>Westminster Constituency:</strong>{ ' ' }
							{ geographicInfo.westminster_constituency }
						</div>
					) }
					{ geographicInfo.devolved_constituency && (
						<div className="geographic-item">
							<strong>Devolved Constituency:</strong>{ ' ' }
							{ geographicInfo.devolved_constituency }
						</div>
					) }
				</div>
			) }
			<div className="representatives-list">
				{ representatives.map( ( rep, index ) => {
					// Use email as unique key, fallback to index if email is missing
					const key = rep.email || `rep-${ index }`;
					return (
						<div key={ key } className="representative-item">
							<input
								type="checkbox"
								id={ `rep-${ index }` }
								checked={ selectedIds.has( index ) }
								onChange={ () => handleCheckboxChange( index ) }
							/>
							<label htmlFor={ `rep-${ index }` }>
								<strong>{ rep.name }</strong>
								<br />
								<em>
									{ rep.title ||
										rep.type ||
										'Representative' }
								</em>
								<br />
								{ rep.email }
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
