import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import {
	TextareaControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { dispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { BlockAttributes } from './types';

interface EditProps {
	attributes: BlockAttributes;
	setAttributes: ( attributes: Partial< BlockAttributes > ) => void;
}

interface EditorActions {
	lockPostSaving: ( lockName: string ) => void;
	unlockPostSaving: ( lockName: string ) => void;
}

function Edit( { attributes, setAttributes }: EditProps ) {
	const blockProps = useBlockProps();
	const questionIsInvalid =
		!! attributes.includeQuestion && ! attributes.questionText?.trim();

	if ( ! attributes.blockId ) {
		setAttributes( { blockId: 'block-' + Date.now() } );
	}

	useEffect( () => {
		const lockName = `find-my-rep-question-${ attributes.blockId || 'new' }`;
		const editor = dispatch( 'core/editor' ) as EditorActions;

		if ( questionIsInvalid ) {
			editor.lockPostSaving( lockName );
		} else {
			editor.unlockPostSaving( lockName );
		}

		return () => editor.unlockPostSaving( lockName );
	}, [ attributes.blockId, questionIsInvalid ] );

	return (
		<div { ...blockProps }>
			<div
				style={ {
					padding: '20px',
					border: '2px dashed #ccc',
					borderRadius: '4px',
					backgroundColor: '#f9f9f9',
				} }
			>
				<div style={ { textAlign: 'center' } }>
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
				<div
					style={ {
						marginTop: '20px',
						padding: '16px',
						backgroundColor: '#fff',
						border: '1px solid #ddd',
						borderRadius: '4px',
					} }
				>
					<TextareaControl
						label={ __( 'Custom Letter Template', 'find-my-rep' ) }
						help={ __(
							'Leave empty to use the global default template. Available placeholders: {{representative_name}}, {{representative_title}}, and {{question_response}}.',
							'find-my-rep'
						) }
						value={ attributes.letterTemplate || '' }
						onChange={ ( value ) =>
							setAttributes( { letterTemplate: value } )
						}
						rows={ 10 }
					/>
					<ToggleControl
						label={ __( 'Include a custom question', 'find-my-rep' ) }
						checked={ !! attributes.includeQuestion }
						onChange={ ( includeQuestion ) =>
							setAttributes( { includeQuestion } )
						}
					/>
					{ attributes.includeQuestion && (
						<TextControl
							label={ __( 'Question', 'find-my-rep' ) }
							help={
								questionIsInvalid
									? __(
										'Enter a question before publishing or updating this page.',
										'find-my-rep'
									)
									: __(
										'The visitor may answer this question or leave it blank.',
										'find-my-rep'
									)
							}
							value={ attributes.questionText || '' }
							onChange={ ( questionText ) =>
								setAttributes( { questionText } )
							}
							__nextHasNoMarginBottom
						/>
					) }
				</div>
			</div>
		</div>
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
		includeQuestion: {
			type: 'boolean',
			default: false,
		},
		questionText: {
			type: 'string',
			default: '',
		},
	},
	edit: Edit,
	save: () => {
		return null; // Dynamic block - rendered server-side
	},
} );
