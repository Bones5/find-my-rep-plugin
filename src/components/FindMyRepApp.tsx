/**
 * Main application component for the Find My Rep plugin.
 * Note: Uses alert() for error messages to maintain consistency with original implementation.
 * Future enhancement: Replace with inline error messages or toast notifications.
 */
import React, { useState } from 'react';
import type {
	Representative,
	WPAjaxResponse,
	ErrorData,
	SuccessData,
	GeographicInfo,
	RepresentativesResponse,
} from '../types';
import { PostcodeStep } from './PostcodeStep';
import { SelectStep } from './SelectStep';
import { LetterStep } from './LetterStep';
import { LoadingSpinner } from './LoadingSpinner';

type Step = 'postcode' | 'select' | 'letter';

interface FindMyRepAppProps {
	blockId: string;
}

export const FindMyRepApp: React.FC< FindMyRepAppProps > = ( { blockId } ) => {
	const [ currentStep, setCurrentStep ] = useState< Step >( 'postcode' );
	const [ representatives, setRepresentatives ] = useState<
		Representative[]
	>( [] );
	const [ selectedReps, setSelectedReps ] = useState< Representative[] >(
		[]
	);
	const [ geographicInfo, setGeographicInfo ] = useState<
		GeographicInfo | undefined
	>( undefined );
	const [ error, setError ] = useState< string >( '' );
	const [ success, setSuccess ] = useState< string >( '' );
	const [ loading, setLoading ] = useState( false );

	const { ajaxUrl, nonce, letterTemplate } = window.findMyRepData;

	const handleFindReps = async ( postcode: string ) => {
		setLoading( true );
		setError( '' );

		try {
			const response = await fetch( ajaxUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams( {
					action: 'find_my_rep_get_representatives',
					nonce,
					postcode,
				} ),
			} );

			if ( ! response.ok ) {
				throw new Error( `HTTP error! status: ${ response.status }` );
			}

			const data: WPAjaxResponse< RepresentativesResponse | ErrorData > =
				await response.json();

			if (
				typeof data !== 'object' ||
				data === null ||
				typeof data.success !== 'boolean'
			) {
				throw new Error( 'Invalid response format' );
			}

			if ( data.success ) {
				if (
					typeof data.data === 'object' &&
					data.data !== null &&
					'representatives' in data.data
				) {
					const responseData = data.data as RepresentativesResponse;
					setRepresentatives( responseData.representatives );
					setGeographicInfo( responseData.geographic_info );
					setCurrentStep( 'select' );
				} else {
					const errorData = data.data as ErrorData;
					setError(
						errorData?.message || 'Failed to fetch representatives.'
					);
				}
			} else {
				const errorData = data.data as ErrorData;
				setError(
					errorData?.message || 'Failed to fetch representatives.'
				);
			}
		} catch ( err ) {
			setError( 'An error occurred. Please try again.' );
			// eslint-disable-next-line no-console
			console.error( 'Error:', err );
		} finally {
			setLoading( false );
		}
	};

	const handleContinue = ( reps: Representative[] ) => {
		setSelectedReps( reps );
		setCurrentStep( 'letter' );
	};

	const handleSend = async (
		senderName: string,
		senderEmail: string,
		letterContent: string
	) => {
		setLoading( true );

		try {
			const response = await fetch( ajaxUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams( {
					action: 'find_my_rep_send_letter',
					nonce,
					sender_name: senderName,
					sender_email: senderEmail,
					letter_content: letterContent,
					representatives: JSON.stringify( selectedReps ),
				} ),
			} );

			if ( ! response.ok ) {
				throw new Error( `HTTP error! status: ${ response.status }` );
			}

			const data: WPAjaxResponse< SuccessData | ErrorData > =
				await response.json();

			if (
				typeof data !== 'object' ||
				data === null ||
				typeof data.success !== 'boolean'
			) {
				throw new Error( 'Invalid response format' );
			}

			if ( data.success ) {
				const successData = data.data as SuccessData;
				let message = successData.message;
				if ( successData.errors && successData.errors.length > 0 ) {
					message +=
						'\n\nErrors:\n' + successData.errors.join( '\n' );
				}
				setSuccess( message );
			} else {
				const errorData = data.data as ErrorData;
				// eslint-disable-next-line no-alert
				alert( errorData?.message || 'Failed to send letters.' );
			}
		} catch ( err ) {
			// eslint-disable-next-line no-alert
			alert( 'An error occurred. Please try again.' );
			// eslint-disable-next-line no-console
			console.error( 'Error:', err );
		} finally {
			setLoading( false );
		}
	};

	return (
		<div className="find-my-rep-container" id={ blockId }>
			{ currentStep === 'postcode' && (
				<PostcodeStep
					onFindReps={ handleFindReps }
					error={ error }
					loading={ loading }
				/>
			) }
			{ currentStep === 'select' && (
				<SelectStep
					representatives={ representatives }
					geographicInfo={ geographicInfo }
					onContinue={ handleContinue }
				/>
			) }
			{ currentStep === 'letter' && (
				<LetterStep
					selectedReps={ selectedReps }
					letterTemplate={ letterTemplate }
					onSend={ handleSend }
					loading={ loading }
					success={ success }
				/>
			) }
			<LoadingSpinner visible={ loading } />
		</div>
	);
};
