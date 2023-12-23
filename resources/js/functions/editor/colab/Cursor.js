import {Extension,} from '@tiptap/vue-3';

import {Decoration, DecorationSet} from "prosemirror-view";
import {useUserStore} from "../../../store/user.js";
import {Plugin, PluginKey} from '@tiptap/pm/state'

const userState = useUserStore();

const getDecorations = ({doc, selections}, {clientID}) => {
    // const {  } = this.editor.extensions.options.collaboration;
    const decorations = selections
        .filter((selection) => selection.clientID !== clientID)
        .map((selection) => {
            const decors = [];
            if (selection.selection) {
                const {from, to} = selection.selection;
                const span = document.createElement('span');
                span.className = `cursor client-${selection.clientID}`;
                decors.push(Decoration.widget(to, span));
                if (from !== to) {
                    decors.push(Decoration.inline(from, to, {
                        nodeName: 'span',
                        class: `selection client-${selection.clientID}`,
                    }));
                }
            }
            return decors;
        })
        .flat();

    return DecorationSet.create(doc, decorations);
}
export const Cursors = Extension.create({
    name: 'cursors',
    addCommands() {
        return {
            updateColabCursors: (selections) => ({commands}) => {
                const {tr} = this.editor.state;
                const transaction = tr
                    .setMeta('selections', selections)
                    .setMeta('addToHistory', false);

                this.editor.view.dispatch(transaction);
            }
        }
    },

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('my-key'),
                init: (_, {doc}) => getDecorations({doc, selections: []}, this.editor.extensions.options.collaboration),
                apply: (transaction, decorationSet) => {
                    const {mapping, doc} = transaction;
                    const selections = transaction.getMeta('selections');

                    if (selections) {
                        return getDecorations({doc, selections}, this.editor.extensions.options.collaboration);
                    }

                    return decorationSet.map(mapping, doc);
                },
                props: {
                    decorations(state) {
                        return this.getState(state);
                    },
                },
            })
        ]
    },

    // onTransaction({transaction}) {
    //     const {mapping, doc} = transaction;
    //     const selections = transaction.getMeta('selections');
    //     console.log({selections})
    //
    //     // if (!selections) {
    //     //     return;
    //     // }
    //     // const decorations = selections
    //     //     .filter((selection) => selection.clientID !== userState.user.id)
    //     //     .map((selection) => {
    //     //         const decors = [];
    //     //         if (selection.selection) {
    //     //             const {from, to} = selection.selection;
    //     //             const span = document.createElement('span');
    //     //             span.className = `cursor client-${selection.clientID}`;
    //     //             decors.push(Decoration.widget(to, span));
    //     //             if (from !== to) {
    //     //                 decors.push(Decoration.inline(from, to, {
    //     //                     nodeName: 'span',
    //     //                     class: `selection client-${selection.clientID}`,
    //     //                 }));
    //     //             }
    //     //         }
    //     //         return decors;
    //     //     })
    //     //     .flat();
    // }

})

// export default class Cursors extends Extension. {
//     get name() {
//         return 'cursors';
//     }
//
//     get defaultOptions() {
//         return {
//         };
//     }
//
//     getDecorations({ doc, selections }) {
//         const decorations = selections
//             .filter((selection) => selection.clientID !== clientID)
//             .map((selection) => {
//                 const decors = [];
//                 if (selection.selection) {
//                     const { from, to } = selection.selection;
//                     const span = document.createElement('span');
//                     span.className = `cursor client-${selection.clientID}`;
//                     decors.push(Decoration.widget(to, span));
//                     if (from !== to) {
//                         decors.push(Decoration.inline(from, to, {
//                             nodeName: 'span',
//                             class: `selection client-${selection.clientID}`,
//                         }));
//                     }
//                 }
//                 return decors;
//             })
//             .flat();
//
//         return DecorationSet.create(doc, decorations);
//     }
//
//     get plugins() {
//         return [
//             new Plugin({
//                 state: {
//                     init: (_, { doc }) => this.getDecorations({ doc, selections: [] }),
//                     apply: (transaction, decorationSet) => {
//                         const { mapping, doc } = transaction;
//                         const selections = transaction.getMeta('selections');
//
//                         if (selections) {
//                             return this.getDecorations({ doc, selections });
//                         }
//
//                         return decorationSet.map(mapping, doc);
//                     },
//                 },
//                 props: {
//                     decorations(state) {
//                         return this.getState(state);
//                     },
//                 },
//             }),
//         ];
//     }
//
//     update(selections) {
//         const { tr } = this.editor.state;
//         const transaction = tr
//             .setMeta('selections', selections)
//             .setMeta('addToHistory', false);
//
//         this.editor.view.dispatch(transaction);
//     }
// }
