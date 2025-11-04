/**
 * Frontend TypeScript/React for Find My Rep plugin
 */
import { render } from '@wordpress/element';
import { FindMyRepApp } from './components/FindMyRepApp';

// Wait for DOM to be ready
if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}

function init() {
	const containers = document.querySelectorAll< HTMLElement >(
		'.find-my-rep-container'
	);

	containers.forEach( ( container ) => {
		const blockId = container.id || `block-${ Date.now() }`;

		// Clear existing content and render React app
		container.innerHTML = '';

		render( <FindMyRepApp blockId={ blockId } />, container );
	} );
}
