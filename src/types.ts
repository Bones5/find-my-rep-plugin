/**
 * Type definitions for Find My Rep plugin
 */

export interface Councillor {
	id: number;
	name: string;
	party?: string;
	ward?: string;
	council?: string;
	email?: string;
	phone?: string;
}

export interface PCC {
	id: number;
	name: string;
	force?: string;
	area?: string;
	email?: string;
	website?: string;
}

export interface RepresentativesData {
	postcode: string;
	councillors?: Councillor[];
	pcc?: PCC;
}

export interface GenericRepresentative {
	name: string;
	email: string;
	title?: string;
	type?: string;
}

export interface FindMyRepData {
	ajaxUrl: string;
	nonce: string;
	letterTemplate: string;
}

declare global {
	interface Window {
		findMyRepData: FindMyRepData;
	}
}
