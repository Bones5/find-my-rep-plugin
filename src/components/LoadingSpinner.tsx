import React from 'react';

interface LoadingSpinnerProps {
	visible: boolean;
}

export const LoadingSpinner: React.FC< LoadingSpinnerProps > = ( {
	visible,
} ) => {
	if ( ! visible ) {
		return null;
	}

	return (
		<div className="loading-spinner" style={ { display: 'block' } }>
			<span className="spinner is-active"></span>
		</div>
	);
};
