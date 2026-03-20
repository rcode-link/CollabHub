import { Doc } from 'yjs';
import { Extensions } from '@tiptap/core';
import { Transformer } from './types.js';
export declare class Tiptap implements Transformer {
    defaultExtensions: Extensions;
    extensions(extensions: Extensions): Tiptap;
    fromYdoc(document: Doc, fieldName?: string | Array<string>): any;
    toYdoc(document: any, fieldName?: string | Array<string>, extensions?: Extensions): Doc;
}
export declare const TiptapTransformer: Tiptap;
