/**
 * Frontend React app for Find My Rep plugin
 */

import { createRoot } from 'react-dom/client';
import { FindMyRepApp } from './components/FindMyRepApp';

// Wait for DOM to be ready
const initializeApp = () => {
	const containers = document.querySelectorAll( '.find-my-rep-container' );

	containers.forEach( ( container ) => {
		const blockId = container.id;
		const root = createRoot( container );
		root.render( <FindMyRepApp blockId={ blockId } /> );
	} );
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initializeApp );
} else {
	initializeApp();
}
