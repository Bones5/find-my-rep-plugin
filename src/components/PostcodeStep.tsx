import React, { useState } from 'react';

interface PostcodeStepProps {
	onFindReps: ( postcode: string ) => void;
	error?: string;
	loading: boolean;
}

export const PostcodeStep: React.FC< PostcodeStepProps > = ( {
	onFindReps,
	error,
	loading,
} ) => {
	const [ postcode, setPostcode ] = useState( '' );

	const handleSubmit = () => {
		const trimmedPostcode = postcode.trim();
		if ( ! trimmedPostcode ) {
			return;
		}
		onFindReps( trimmedPostcode );
	};

	const handleKeyPress = ( e: React.KeyboardEvent< HTMLInputElement > ) => {
		if ( e.key === 'Enter' ) {
			handleSubmit();
		}
	};

	return (
		<div className="find-my-rep-step step-postcode">
			<h3>Find Your Representatives</h3>
			<label htmlFor="postcode-input">Enter your postcode:</label>
			<input
				type="text"
				id="postcode-input"
				className="postcode-input"
				placeholder="e.g. SW1A 1AA"
				value={ postcode }
				onChange={ ( e ) => setPostcode( e.target.value ) }
				onKeyPress={ handleKeyPress }
				disabled={ loading }
			/>
			<button
				className="button button-primary find-reps-btn"
				onClick={ handleSubmit }
				disabled={ loading }
			>
				Find Representatives
			</button>
			{ error && (
				<div className="error-message" style={ { display: 'block' } }>
					{ error }
				</div>
			) }
		</div>
	);
};
