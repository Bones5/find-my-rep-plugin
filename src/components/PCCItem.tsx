/**
 * Component for displaying a PCC representative
 */
import { createElement } from '@wordpress/element';
import type { PCC } from '../types';

interface PCCItemProps {
	pcc: PCC;
	index: number;
	onSelect: ( pcc: PCC, selected: boolean ) => void;
}

const escapeHtml = ( text: string ): string => {
	const div = document.createElement( 'div' );
	div.textContent = text;
	return div.innerHTML;
};

export const PCCItem: React.FC< PCCItemProps > = ( {
	pcc,
	index,
	onSelect,
} ) => {
	const handleChange = ( e: React.ChangeEvent< HTMLInputElement > ) => {
		onSelect( pcc, e.target.checked );
	};

	return createElement(
		'div',
		{ className: 'representative-item pcc-item' },
		createElement( 'input', {
			type: 'checkbox',
			id: `rep-${ index }`,
			onChange: handleChange,
			'data-rep': JSON.stringify( pcc ),
		} ),
		createElement( 'label', {
			htmlFor: `rep-${ index }`,
			dangerouslySetInnerHTML: {
				__html: `
                <strong>${ escapeHtml( pcc.name ) }</strong><br>
                <em>Police and Crime Commissioner</em><br>
                Force: ${ escapeHtml( pcc.force || 'N/A' ) }<br>
                Area: ${ escapeHtml( pcc.area || 'N/A' ) }<br>
                ${ pcc.email ? 'Email: ' + escapeHtml( pcc.email ) : '' }
                ${
					pcc.website
						? '<br>Website: <a href="' +
						  escapeHtml( pcc.website ) +
						  '" target="_blank">' +
						  escapeHtml( pcc.website ) +
						  '</a>'
						: ''
				}
            `,
			},
		} )
	);
};
