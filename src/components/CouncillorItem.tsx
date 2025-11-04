/**
 * Component for displaying a councillor representative
 */
import { createElement } from '@wordpress/element';
import type { Councillor } from '../types';

interface CouncillorItemProps {
	councillor: Councillor;
	index: number;
	onSelect: ( councillor: Councillor, selected: boolean ) => void;
}

const escapeHtml = ( text: string ): string => {
	const div = document.createElement( 'div' );
	div.textContent = text;
	return div.innerHTML;
};

export const CouncillorItem: React.FC< CouncillorItemProps > = ( {
	councillor,
	index,
	onSelect,
} ) => {
	const handleChange = ( e: React.ChangeEvent< HTMLInputElement > ) => {
		onSelect( councillor, e.target.checked );
	};

	return createElement(
		'div',
		{ className: 'representative-item councillor-item' },
		createElement( 'input', {
			type: 'checkbox',
			id: `rep-${ index }`,
			onChange: handleChange,
			'data-rep': JSON.stringify( councillor ),
		} ),
		createElement( 'label', {
			htmlFor: `rep-${ index }`,
			dangerouslySetInnerHTML: {
				__html: `
                <strong>${ escapeHtml( councillor.name ) }</strong><br>
                <em>${ escapeHtml(
					councillor.party || 'Independent'
				) }</em><br>
                Ward: ${ escapeHtml( councillor.ward || 'N/A' ) }<br>
                Council: ${ escapeHtml( councillor.council || 'N/A' ) }<br>
                ${
					councillor.email
						? 'Email: ' + escapeHtml( councillor.email )
						: ''
				}
                ${
					councillor.phone
						? '<br>Phone: ' + escapeHtml( councillor.phone )
						: ''
				}
            `,
			},
		} )
	);
};
