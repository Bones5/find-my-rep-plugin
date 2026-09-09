import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';

interface PostcodeStepProps {
	onFindReps: ( postcode: string ) => void;
	initialPostcode?: string;
	error?: string;
	loading: boolean;
}

export const PostcodeStep: React.FC< PostcodeStepProps > = ( {
	onFindReps,
	initialPostcode = '',
	error,
	loading,
} ) => {
	const [ postcode, setPostcode ] = useState( initialPostcode );

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
			<h3>{ __( 'Find Your Representatives', 'find-my-rep' ) }</h3>
			<label htmlFor="postcode-input">
				{ __( 'Enter your postcode:', 'find-my-rep' ) }
			</label>
			<input
				type="text"
				id="postcode-input"
				className="postcode-input"
				placeholder={ __( 'e.g. CF10 1EP', 'find-my-rep' ) }
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
				{ __( 'Find Representatives', 'find-my-rep' ) }
			</button>
			{ error && (
				<div className="error-message" style={ { display: 'block' } }>
					{ error }
				</div>
			) }
		</div>
	);
};
