import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

registerBlockType( 'find-my-rep/contact-block', {
	title: __( 'Find My Rep Contact Form', 'find-my-rep' ),
	description: __(
		'A block for contacting local representatives via templated letters.',
		'find-my-rep'
	),
	category: 'widgets',
	icon: 'email',
	supports: {
		html: false,
	},
	attributes: {
		blockId: {
			type: 'string',
			default: '',
		},
	},
	edit: ( { attributes, setAttributes } ) => {
		const blockProps = useBlockProps();

		if ( ! attributes.blockId ) {
			setAttributes( { blockId: 'block-' + Date.now() } );
		}

		return (
			<div { ...blockProps }>
				<div
					style={ {
						padding: '20px',
						border: '2px dashed #ccc',
						borderRadius: '4px',
						textAlign: 'center',
						backgroundColor: '#f9f9f9',
					} }
				>
					<h3>{ __( 'Find My Rep Contact Form', 'find-my-rep' ) }</h3>
					<p>
						{ __(
							'This block will display a form for users to contact their local representatives.',
							'find-my-rep'
						) }
					</p>
					<p>
						<strong>
							{ __(
								'Preview is only available on the frontend.',
								'find-my-rep'
							) }
						</strong>
					</p>
				</div>
			</div>
		);
	},
	save: () => {
		return null; // Dynamic block - rendered server-side
	},
} );
