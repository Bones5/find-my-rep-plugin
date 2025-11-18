import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { BlockAttributes } from './types';

interface EditProps {
	attributes: BlockAttributes;
	setAttributes: ( attributes: Partial< BlockAttributes > ) => void;
}

function Edit( { attributes, setAttributes }: EditProps ) {
	const blockProps = useBlockProps();

	if ( ! attributes.blockId ) {
		setAttributes( { blockId: 'block-' + Date.now() } );
	}

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Letter Template Settings', 'find-my-rep' ) }
					initialOpen={ true }
				>
					<TextareaControl
						label={ __( 'Custom Letter Template', 'find-my-rep' ) }
						help={ __(
							'Leave empty to use the global default template. Use {{representative_name}} and {{representative_title}} as placeholders.',
							'find-my-rep'
						) }
						value={ attributes.letterTemplate || '' }
						onChange={ ( value ) =>
							setAttributes( { letterTemplate: value } )
						}
						rows={ 10 }
					/>
				</PanelBody>
			</InspectorControls>
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
					<div
						style={ {
							marginTop: '15px',
							padding: '10px',
							backgroundColor: '#fff',
							border: '1px solid #ddd',
							borderRadius: '4px',
							textAlign: 'left',
						} }
					>
						<p
							style={ {
								margin: '0 0 8px 0',
								fontWeight: 'bold',
								fontSize: '13px',
							} }
						>
							{ __( 'Letter Template:', 'find-my-rep' ) }
						</p>
						{ attributes.letterTemplate ? (
							<>
								<p
									style={ {
										margin: '0 0 8px 0',
										fontSize: '12px',
										color: '#0073aa',
									} }
								>
									✓{ ' ' }
									{ __(
										'Using custom template for this block',
										'find-my-rep'
									) }
								</p>
								<div
									style={ {
										maxHeight: '120px',
										overflow: 'auto',
										padding: '8px',
										backgroundColor: '#f5f5f5',
										borderRadius: '3px',
										fontSize: '12px',
										fontFamily: 'monospace',
										whiteSpace: 'pre-wrap',
										wordBreak: 'break-word',
									} }
								>
									{ attributes.letterTemplate.substring(
										0,
										200
									) }
									{ attributes.letterTemplate.length > 200
										? '...'
										: '' }
								</div>
							</>
						) : (
							<p
								style={ {
									margin: '0',
									fontSize: '12px',
									color: '#666',
								} }
							>
								{ __(
									'Using global default template',
									'find-my-rep'
								) }
							</p>
						) }
						<p
							style={ {
								margin: '8px 0 0 0',
								fontSize: '11px',
								color: '#666',
								fontStyle: 'italic',
							} }
						>
							{ __(
								'→ Edit template in the block settings sidebar',
								'find-my-rep'
							) }
						</p>
					</div>
				</div>
			</div>
		</>
	);
}

registerBlockType< BlockAttributes >( 'find-my-rep/contact-block', {
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
		letterTemplate: {
			type: 'string',
			default: '',
		},
	},
	edit: Edit,
	save: () => {
		return null; // Dynamic block - rendered server-side
	},
} );
