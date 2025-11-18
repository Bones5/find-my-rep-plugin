import React, { useState } from 'react';
import type { Representative } from '../types';

interface LetterStepProps {
	selectedReps: Representative[];
	letterTemplate: string;
	onSend: (
		senderName: string,
		senderEmail: string,
		letterContent: string
	) => void;
	loading: boolean;
	success?: string;
}

export const LetterStep: React.FC< LetterStepProps > = ( {
	letterTemplate,
	onSend,
	loading,
	success,
} ) => {
	const [ senderName, setSenderName ] = useState( '' );
	const [ senderEmail, setSenderEmail ] = useState( '' );
	const [ letterContent, setLetterContent ] = useState( letterTemplate );

	const isValidEmail = ( email: string ): boolean => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( email );
	};

	const handleSend = () => {
		if (
			! senderName.trim() ||
			! senderEmail.trim() ||
			! letterContent.trim()
		) {
			// eslint-disable-next-line no-alert
			alert( 'Please fill in all fields.' );
			return;
		}

		if ( ! isValidEmail( senderEmail ) ) {
			// eslint-disable-next-line no-alert
			alert( 'Please enter a valid email address.' );
			return;
		}

		onSend( senderName, senderEmail, letterContent );
	};

	return (
		<div className="find-my-rep-step step-letter">
			<h3>Review and Edit Your Letter</h3>
			<div className="letter-fields">
				<label htmlFor="sender-name">Your Name:</label>
				<input
					type="text"
					id="sender-name"
					className="sender-name"
					value={ senderName }
					onChange={ ( e ) => setSenderName( e.target.value ) }
					required
					disabled={ loading || !! success }
				/>

				<label htmlFor="sender-email">Your Email:</label>
				<input
					type="email"
					id="sender-email"
					className="sender-email"
					value={ senderEmail }
					onChange={ ( e ) => setSenderEmail( e.target.value ) }
					required
					disabled={ loading || !! success }
				/>
			</div>
			<textarea
				className="letter-content"
				rows={ 15 }
				value={ letterContent }
				onChange={ ( e ) => setLetterContent( e.target.value ) }
				disabled={ loading || !! success }
			/>
			{ ! success && (
				<button
					className="button button-primary send-btn send-button"
					onClick={ handleSend }
					disabled={ loading }
				>
					{ loading ? 'Sending...' : 'Send' }
				</button>
			) }
			{ success && (
				<div className="success-message" style={ { display: 'block' } }>
					{ success }
				</div>
			) }
		</div>
	);
};
