import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import {
	CheckboxControl,
	Notice,
	TextareaControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { dispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { BlockAttributes, RepresentativeType } from './types';

const representativeOptions: Array< {
	value: RepresentativeType;
	label: string;
} > = [
	{ value: 'MP', label: __( 'Member of Parliament', 'find-my-rep' ) },
	{ value: 'MS', label: __( 'Members of the Senedd', 'find-my-rep' ) },
	{
		value: 'PCC',
		label: __( 'Police and Crime Commissioner', 'find-my-rep' ),
	},
	{ value: 'Councillor', label: __( 'Local councillors', 'find-my-rep' ) },
];

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
	const representativeTypes =
		attributes.representativeTypes ||
		representativeOptions.map( ( option ) => option.value );
	const recipientsAreInvalid = representativeTypes.length === 0;
	const configurationIsInvalid = questionIsInvalid || recipientsAreInvalid;

	if ( ! attributes.blockId ) {
		setAttributes( { blockId: 'block-' + Date.now() } );
	}

	useEffect( () => {
		const lockName = `find-my-rep-question-${ attributes.blockId || 'new' }`;
		const editor = dispatch( 'core/editor' ) as EditorActions;

		if ( configurationIsInvalid ) {
			editor.lockPostSaving( lockName );
		} else {
			editor.unlockPostSaving( lockName );
		}

		return () => editor.unlockPostSaving( lockName );
	}, [ attributes.blockId, configurationIsInvalid ] );

	const setRepresentativeType = (
		representativeType: RepresentativeType,
		isSelected: boolean
	) => {
		setAttributes( {
			representativeTypes: isSelected
				? [ ...representativeTypes, representativeType ]
				: representativeTypes.filter(
						( currentType ) => currentType !== representativeType
				  ),
		} );
	};

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
					<h4>{ __( 'Representatives to contact', 'find-my-rep' ) }</h4>
					<p>
						{ __(
							'Choose which representative types visitors will contact.',
							'find-my-rep'
						) }
					</p>
					{ representativeOptions.map( ( option ) => (
						<CheckboxControl
							key={ option.value }
							label={ option.label }
							checked={ representativeTypes.includes( option.value ) }
							onChange={ ( isSelected ) =>
								setRepresentativeType( option.value, isSelected )
							}
						/>
					) ) }
					{ recipientsAreInvalid && (
						<Notice status="error" isDismissible={ false }>
							{ __(
								'Select at least one representative type before publishing or updating this page.',
								'find-my-rep'
							) }
						</Notice>
					) }
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
									? undefined
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
					{ questionIsInvalid && (
						<Notice status="error" isDismissible={ false }>
							{ __(
								'Enter a question before publishing or updating this page.',
								'find-my-rep'
							) }
						</Notice>
					) }
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
		representativeTypes: {
			type: 'array',
			default: [ 'MP', 'MS', 'PCC', 'Councillor' ],
		},
	},
	edit: Edit,
	save: () => {
		return null; // Dynamic block - rendered server-side
	},
} );
