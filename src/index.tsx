import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import {
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	CheckboxControl,
	Notice,
	Panel,
	PanelBody,
	TextareaControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { dispatch } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
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
	clientId: string;
	isSelected: boolean;
	setAttributes: ( attributes: Partial< BlockAttributes > ) => void;
}

interface EditorActions {
	lockPostSaving: ( lockName: string ) => void;
	unlockPostSaving: ( lockName: string ) => void;
}

interface BlockEditorActions {
	selectBlock: ( clientId: string ) => void;
}

function Edit( { attributes, clientId, isSelected, setAttributes }: EditProps ) {
	const blockProps = useBlockProps();
	const questionToggleRef = useRef< HTMLDivElement >( null );
	const [ questionIsDirty, setQuestionIsDirty ] = useState( false );
	const questionIsInvalid =
		!! attributes.includeQuestion && ! attributes.questionText?.trim();
	const representativeTypes =
		attributes.representativeTypes ||
		representativeOptions.map( ( option ) => option.value );
	const recipientsAreInvalid = representativeTypes.length === 0;
	const configurationIsInvalid = questionIsInvalid || recipientsAreInvalid;
	const globalLetterTemplate = window.findMyRepEditorData.letterTemplate;

	useEffect( () => {
		if ( ! attributes.blockId ) {
			setAttributes( { blockId: 'block-' + Date.now() } );
		}
	}, [ attributes.blockId, setAttributes ] );

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

	const handleQuestionPointerDown = (
		event: React.PointerEvent< HTMLDivElement >
	) => {
		if ( isSelected || event.button !== 0 ) {
			return;
		}

		event.preventDefault();
		( dispatch( 'core/block-editor' ) as BlockEditorActions ).selectBlock(
			clientId
		);
		setQuestionIsDirty( false );
		setAttributes( { includeQuestion: ! attributes.includeQuestion } );
		window.requestAnimationFrame( () => {
			questionToggleRef.current
				?.querySelector< HTMLInputElement >( 'input' )
				?.focus();
		} );
	};

	return (
		<div { ...blockProps }>
			<Panel>
				<PanelBody>
					<VStack spacing={ 3 }>
						<Heading level={ 2 }>
							{ __( 'Representative contact form', 'find-my-rep' ) }
						</Heading>
						<Text variant="muted">
							{ __(
								'Choose which representatives this form includes, customize its letter template, and optionally ask visitors a question.',
								'find-my-rep'
							) }
						</Text>
					</VStack>
				</PanelBody>
				<PanelBody
					title={ __( 'Representatives to contact', 'find-my-rep' ) }
					initialOpen={ true }
				>
					<fieldset style={ { border: 0, margin: 0, padding: 0 } }>
						<legend className="screen-reader-text">
							{ __( 'Representative types', 'find-my-rep' ) }
						</legend>
						<VStack spacing={ 4 }>
							<Text variant="muted">
								{ __(
									'Select every type of representative visitors should be able to contact.',
									'find-my-rep'
								) }
							</Text>
							<VStack spacing={ 2 }>
								{ representativeOptions.map( ( option ) => (
									<CheckboxControl
										key={ option.value }
										label={ option.label }
										checked={ representativeTypes.includes(
											option.value
										) }
										onChange={ ( isSelected ) =>
											setRepresentativeType(
												option.value,
												isSelected
											)
										}
									/>
								) ) }
							</VStack>
						</VStack>
					</fieldset>
					{ recipientsAreInvalid && (
						<Notice status="error" isDismissible={ false }>
							{ __(
								'Select at least one representative type before publishing or updating this page.',
								'find-my-rep'
							) }
						</Notice>
					) }
				</PanelBody>
				<PanelBody
					title={ __( 'Question', 'find-my-rep' ) }
					initialOpen={ true }
				>
					<VStack spacing={ 4 }>
						<Text variant="muted">
							{ __(
								'Turn this on to ask visitors a question before they review their letter. Add {{question_response}} to the letter template to insert their answer.',
								'find-my-rep'
							) }
						</Text>
						<div
							ref={ questionToggleRef }
							onPointerDown={ handleQuestionPointerDown }
						>
							<ToggleControl
								label={ __( 'Include a question', 'find-my-rep' ) }
								checked={ !! attributes.includeQuestion }
								onChange={ ( includeQuestion ) => {
									setQuestionIsDirty( false );
									setAttributes( { includeQuestion } )
								} }
							/>
						</div>
						{ attributes.includeQuestion && (
							<TextControl
								label={ __( 'Question text', 'find-my-rep' ) }
								hideLabelFromVision
								help={
									questionIsInvalid
										? undefined
										: __(
											'Enter the question visitors will see. Answering it is optional.',
											'find-my-rep'
										  )
								}
								value={ attributes.questionText || '' }
								onChange={ ( questionText ) => {
									setQuestionIsDirty( true );
									setAttributes( { questionText } )
								} }
								__nextHasNoMarginBottom
							/>
						) }
						{ questionIsDirty && questionIsInvalid && (
							<Notice status="error" isDismissible={ false }>
								{ __(
									'Enter a question before publishing or updating this page.',
									'find-my-rep'
								) }
							</Notice>
						) }
					</VStack>
				</PanelBody>
				<PanelBody
					title={ __( 'Letter Template', 'find-my-rep' ) }
					initialOpen={ true }
				>
					<VStack spacing={ 4 }>
						<Text variant="muted">
							{ __(
								'Enter the letter visitors will send, or leave this blank to use the global default template.',
								'find-my-rep'
							) }
						</Text>
						<TextareaControl
							label={ __( 'Template content', 'find-my-rep' ) }
							hideLabelFromVision
							help={ __(
								'Available placeholders: {{representative_name}} and {{representative_title}}.',
								'find-my-rep'
							) }
							placeholder={ globalLetterTemplate }
							value={ attributes.letterTemplate || '' }
							onChange={ ( value ) =>
								setAttributes( { letterTemplate: value } )
							}
							rows={ 10 }
						/>
					</VStack>
				</PanelBody>
			</Panel>
		</div>
	);
}

registerBlockType< BlockAttributes >( 'find-my-rep/contact-block', {
	apiVersion: 3,
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
