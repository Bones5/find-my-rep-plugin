/**
 * Frontend JavaScript for Find My Rep plugin
 */

/* global findMyRepData, alert */
( function () {
	'use strict';

	// Wait for DOM to be ready
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}

	function init() {
		const containers = document.querySelectorAll(
			'.find-my-rep-container'
		);

		containers.forEach( ( container ) => {
			initializeContainer( container );
		} );
	}

	function initializeContainer( container ) {
		const postcodeInput = container.querySelector( '.postcode-input' );
		const findRepsBtn = container.querySelector( '.find-reps-btn' );
		const continueBtn = container.querySelector( '.continue-btn' );
		const sendBtn = container.querySelector( '.send-btn' );

		const stepPostcode = container.querySelector( '.step-postcode' );
		const stepSelect = container.querySelector( '.step-select' );
		const stepLetter = container.querySelector( '.step-letter' );

		const repsList = container.querySelector( '.representatives-list' );
		const letterContent = container.querySelector( '.letter-content' );
		const errorMessage = container.querySelector( '.error-message' );
		const successMessage = container.querySelector( '.success-message' );
		const loadingSpinner = container.querySelector( '.loading-spinner' );

		let selectedReps = [];

		// Find representatives
		findRepsBtn.addEventListener( 'click', function () {
			const postcode = postcodeInput.value.trim();

			if ( ! postcode ) {
				showError( 'Please enter a postcode.' );
				return;
			}

			showLoading( true );
			hideError();

			fetch( findMyRepData.ajaxUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams( {
					action: 'find_my_rep_get_representatives',
					nonce: findMyRepData.nonce,
					postcode,
				} ),
			} )
				.then( ( response ) => {
					// Check if HTTP request was successful
					if ( ! response.ok ) {
						throw new Error(
							`HTTP error! status: ${ response.status }`
						);
					}
					return response.json();
				} )
				.then( ( data ) => {
					showLoading( false );

					// Ensure data has expected structure
					if (
						typeof data !== 'object' ||
						data === null ||
						typeof data.success !== 'boolean'
					) {
						throw new Error( 'Invalid response format' );
					}

					if ( data.success && data.data ) {
						displayRepresentatives( data.data );
						showStep( 'select' );
					} else {
						const errorMsg =
							data.data && data.data.message
								? data.data.message
								: 'Failed to fetch representatives.';
						showError( errorMsg );
					}
				} )
				.catch( ( error ) => {
					showLoading( false );
					showError( 'An error occurred. Please try again.' );
					// eslint-disable-next-line no-console
					console.error( 'Error:', error );
				} );
		} );

		// Continue to letter step
		continueBtn.addEventListener( 'click', function () {
			const checkboxes = repsList.querySelectorAll(
				'input[type="checkbox"]:checked'
			);

			if ( checkboxes.length === 0 ) {
				// eslint-disable-next-line no-alert
				alert( 'Please select at least one representative.' );
				return;
			}

			selectedReps = [];
			checkboxes.forEach( ( checkbox ) => {
				const repData = JSON.parse(
					checkbox.getAttribute( 'data-rep' )
				);
				selectedReps.push( repData );
			} );

			// Populate letter with template
			letterContent.value = findMyRepData.letterTemplate;

			showStep( 'letter' );
		} );

		// Send letters
		sendBtn.addEventListener( 'click', function () {
			const senderName = container
				.querySelector( '.sender-name' )
				.value.trim();
			const senderEmail = container
				.querySelector( '.sender-email' )
				.value.trim();
			const letter = letterContent.value.trim();

			if ( ! senderName || ! senderEmail || ! letter ) {
				// eslint-disable-next-line no-alert
				alert( 'Please fill in all fields.' );
				return;
			}

			if ( ! isValidEmail( senderEmail ) ) {
				// eslint-disable-next-line no-alert
				alert( 'Please enter a valid email address.' );
				return;
			}

			showLoading( true );

			fetch( findMyRepData.ajaxUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams( {
					action: 'find_my_rep_send_letter',
					nonce: findMyRepData.nonce,
					sender_name: senderName,
					sender_email: senderEmail,
					letter_content: letter,
					representatives: JSON.stringify( selectedReps ),
				} ),
			} )
				.then( ( response ) => {
					// Check if HTTP request was successful
					if ( ! response.ok ) {
						throw new Error(
							`HTTP error! status: ${ response.status }`
						);
					}
					return response.json();
				} )
				.then( ( data ) => {
					showLoading( false );

					// Ensure data has expected structure
					if (
						typeof data !== 'object' ||
						data === null ||
						typeof data.success !== 'boolean'
					) {
						throw new Error( 'Invalid response format' );
					}

					if ( data.success && data.data ) {
						successMessage.textContent = data.data.message;
						successMessage.style.display = 'block';
						sendBtn.style.display = 'none';

						if ( data.data.errors && data.data.errors.length > 0 ) {
							const errorList = document.createElement( 'ul' );
							data.data.errors.forEach( ( err ) => {
								const li = document.createElement( 'li' );
								li.textContent = err;
								errorList.appendChild( li );
							} );
							successMessage.appendChild( errorList );
						}
					} else {
						const errorMsg =
							data.data && data.data.message
								? data.data.message
								: 'Failed to send letters.';
						// eslint-disable-next-line no-alert
						alert( errorMsg );
					}
				} )
				.catch( ( error ) => {
					showLoading( false );
					// eslint-disable-next-line no-alert
					alert( 'An error occurred. Please try again.' );
					// eslint-disable-next-line no-console
					console.error( 'Error:', error );
				} );
		} );

		function displayRepresentatives( reps ) {
			repsList.innerHTML = '';

			if ( ! Array.isArray( reps ) ) {
				reps = [ reps ];
			}

			reps.forEach( ( rep, index ) => {
				const repDiv = document.createElement( 'div' );
				repDiv.className = 'representative-item';

				const checkbox = document.createElement( 'input' );
				checkbox.type = 'checkbox';
				checkbox.id = 'rep-' + index;
				checkbox.setAttribute( 'data-rep', JSON.stringify( rep ) );

				const label = document.createElement( 'label' );
				label.htmlFor = 'rep-' + index;
				label.innerHTML = `
                    <strong>${ escapeHtml( rep.name ) }</strong><br>
                    <em>${ escapeHtml(
						rep.title || rep.type || 'Representative'
					) }</em><br>
                    ${ rep.email ? escapeHtml( rep.email ) : '' }
                `;

				repDiv.appendChild( checkbox );
				repDiv.appendChild( label );
				repsList.appendChild( repDiv );
			} );
		}

		function showStep( step ) {
			stepPostcode.style.display = 'none';
			stepSelect.style.display = 'none';
			stepLetter.style.display = 'none';

			if ( step === 'postcode' ) {
				stepPostcode.style.display = 'block';
			} else if ( step === 'select' ) {
				stepSelect.style.display = 'block';
			} else if ( step === 'letter' ) {
				stepLetter.style.display = 'block';
			}
		}

		function showLoading( show ) {
			loadingSpinner.style.display = show ? 'block' : 'none';
		}

		function showError( message ) {
			errorMessage.textContent = message;
			errorMessage.style.display = 'block';
		}

		function hideError() {
			errorMessage.style.display = 'none';
		}

		function isValidEmail( email ) {
			return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( email );
		}

		function escapeHtml( text ) {
			const div = document.createElement( 'div' );
			div.textContent = text;
			return div.innerHTML;
		}
	}
} )();
