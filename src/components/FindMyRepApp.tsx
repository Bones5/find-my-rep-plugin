/**
 * Main FindMyRep application component
 */
import { createElement, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { SelectStep } from './SelectStep';
import type {
	RepresentativesData,
	Councillor,
	PCC,
	GenericRepresentative,
} from '../types';

type Step = 'postcode' | 'select' | 'letter';

interface FindMyRepAppProps {
	blockId: string;
}

export const FindMyRepApp: React.FC< FindMyRepAppProps > = ( { blockId } ) => {
	const [ currentStep, setCurrentStep ] = useState< Step >( 'postcode' );
	const [ postcode, setPostcode ] = useState( '' );
	const [ representativesData, setRepresentativesData ] = useState<
		RepresentativesData | GenericRepresentative[] | null
	>( null );
	const [ selectedReps, setSelectedReps ] = useState<
		Array< Councillor | PCC | GenericRepresentative >
	>( [] );
	const [ senderName, setSenderName ] = useState( '' );
	const [ senderEmail, setSenderEmail ] = useState( '' );
	const [ letterContent, setLetterContent ] = useState( '' );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ errorMessage, setErrorMessage ] = useState( '' );
	const [ successMessage, setSuccessMessage ] = useState( '' );

	const showError = ( message: string ) => {
		setErrorMessage( message );
	};

	const hideError = () => {
		setErrorMessage( '' );
	};

	const isValidEmail = ( email: string ): boolean => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( email );
	};

	const handleFindReps = async () => {
		if ( ! postcode.trim() ) {
			showError( __( 'Please enter a postcode.', 'find-my-rep' ) );
			return;
		}

		setIsLoading( true );
		hideError();

		try {
			const response = await fetch( window.findMyRepData.ajaxUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams( {
					action: 'find_my_rep_get_representatives',
					nonce: window.findMyRepData.nonce,
					postcode,
				} ),
			} );

			if ( ! response.ok ) {
				throw new Error( `HTTP error! status: ${ response.status }` );
			}

			const data = await response.json();

			if (
				typeof data !== 'object' ||
				data === null ||
				typeof data.success !== 'boolean'
			) {
				throw new Error( 'Invalid response format' );
			}

			if ( data.success && data.data ) {
				setRepresentativesData( data.data );
				setCurrentStep( 'select' );
			} else {
				const errorMsg =
					data.data && data.data.message
						? data.data.message
						: __(
								'Failed to fetch representatives.',
								'find-my-rep'
						  );
				showError( errorMsg );
			}
		} catch ( error ) {
			showError(
				__( 'An error occurred. Please try again.', 'find-my-rep' )
			);
			// eslint-disable-next-line no-console
			console.error( 'Error:', error );
		} finally {
			setIsLoading( false );
		}
	};

	const handleContinue = (
		reps: Array< Councillor | PCC | GenericRepresentative >
	) => {
		setSelectedReps( reps );
		setLetterContent( window.findMyRepData.letterTemplate );
		setCurrentStep( 'letter' );
	};

	const handleSendLetters = async () => {
		if (
			! senderName.trim() ||
			! senderEmail.trim() ||
			! letterContent.trim()
		) {
			// eslint-disable-next-line no-alert
			alert( __( 'Please fill in all fields.', 'find-my-rep' ) );
			return;
		}

		if ( ! isValidEmail( senderEmail ) ) {
			// eslint-disable-next-line no-alert
			alert( __( 'Please enter a valid email address.', 'find-my-rep' ) );
			return;
		}

		setIsLoading( true );

		try {
			const response = await fetch( window.findMyRepData.ajaxUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams( {
					action: 'find_my_rep_send_letter',
					nonce: window.findMyRepData.nonce,
					sender_name: senderName,
					sender_email: senderEmail,
					letter_content: letterContent,
					representatives: JSON.stringify( selectedReps ),
				} ),
			} );

			if ( ! response.ok ) {
				throw new Error( `HTTP error! status: ${ response.status }` );
			}

			const data = await response.json();

			if (
				typeof data !== 'object' ||
				data === null ||
				typeof data.success !== 'boolean'
			) {
				throw new Error( 'Invalid response format' );
			}

			if ( data.success && data.data ) {
				setSuccessMessage( data.data.message );
			} else {
				const errorMsg =
					data.data && data.data.message
						? data.data.message
						: __( 'Failed to send letters.', 'find-my-rep' );
				// eslint-disable-next-line no-alert
				alert( errorMsg );
			}
		} catch ( error ) {
			// eslint-disable-next-line no-alert
			alert(
				__( 'An error occurred. Please try again.', 'find-my-rep' )
			);
			// eslint-disable-next-line no-console
			console.error( 'Error:', error );
		} finally {
			setIsLoading( false );
		}
	};

	return createElement(
		'div',
		{ className: 'find-my-rep-container', id: blockId },
		currentStep === 'postcode' &&
			createElement(
				'div',
				{ className: 'find-my-rep-step step-postcode' },
				createElement(
					'h3',
					null,
					__( 'Find Your Representatives', 'find-my-rep' )
				),
				createElement(
					'label',
					{ htmlFor: 'postcode-input' },
					__( 'Enter your postcode:', 'find-my-rep' )
				),
				createElement( 'input', {
					type: 'text',
					id: 'postcode-input',
					className: 'postcode-input',
					placeholder: 'e.g. SW1A 1AA',
					value: postcode,
					onChange: ( e: any ) => setPostcode( e.target.value ),
				} ),
				createElement(
					'button',
					{
						className: 'button button-primary find-reps-btn',
						onClick: handleFindReps,
					},
					__( 'Find Representatives', 'find-my-rep' )
				),
				errorMessage &&
					createElement(
						'div',
						{
							className: 'error-message',
							style: { display: 'block' },
						},
						errorMessage
					)
			),
		currentStep === 'select' &&
			representativesData &&
			createElement( SelectStep, {
				data: representativesData,
				onContinue: handleContinue,
			} ),
		currentStep === 'letter' &&
			createElement(
				'div',
				{ className: 'find-my-rep-step step-letter' },
				createElement(
					'h3',
					null,
					__( 'Review and Edit Your Letter', 'find-my-rep' )
				),
				createElement(
					'div',
					{ className: 'letter-fields' },
					createElement(
						'label',
						{ htmlFor: 'sender-name' },
						__( 'Your Name:', 'find-my-rep' )
					),
					createElement( 'input', {
						type: 'text',
						id: 'sender-name',
						className: 'sender-name',
						required: true,
						value: senderName,
						onChange: ( e: any ) => setSenderName( e.target.value ),
					} ),
					createElement(
						'label',
						{ htmlFor: 'sender-email' },
						__( 'Your Email:', 'find-my-rep' )
					),
					createElement( 'input', {
						type: 'email',
						id: 'sender-email',
						className: 'sender-email',
						required: true,
						value: senderEmail,
						onChange: ( e: any ) =>
							setSenderEmail( e.target.value ),
					} )
				),
				createElement( 'textarea', {
					className: 'letter-content',
					rows: 15,
					value: letterContent,
					onChange: ( e: any ) => setLetterContent( e.target.value ),
				} ),
				! successMessage &&
					createElement(
						'button',
						{
							className: 'button button-primary send-btn',
							onClick: handleSendLetters,
						},
						__( 'Send Letters', 'find-my-rep' )
					),
				successMessage &&
					createElement(
						'div',
						{
							className: 'success-message',
							style: { display: 'block' },
						},
						successMessage
					)
			),
		isLoading &&
			createElement(
				'div',
				{
					className: 'loading-spinner',
					style: { display: 'block' },
				},
				createElement( 'span', {
					className: 'spinner is-active',
				} )
			)
	);
};
