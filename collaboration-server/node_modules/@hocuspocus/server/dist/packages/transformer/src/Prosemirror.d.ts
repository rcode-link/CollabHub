import { Doc } from 'yjs';
import { Schema } from '@tiptap/pm/model';
import { Transformer } from './types.js';
declare class Prosemirror implements Transformer {
    defaultSchema: Schema;
    schema(schema: Schema): Prosemirror;
    fromYdoc(document: Doc, fieldName?: string | Array<string>): any;
    toYdoc(document: any, fieldName?: string | Array<string>, schema?: Schema): Doc;
}
export declare const ProsemirrorTransformer: Prosemirror;
export {};
