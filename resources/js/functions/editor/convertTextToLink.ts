import { Extension } from "@tiptap/vue-3";
import { Plugin } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { useTextToLinkStore } from "../../store/textToLinkStore";
import { useRouter } from "vue-router";


const items = [];

export const useConvertTextToLink = () => {
    const textToLinkStore = useTextToLinkStore();
    const convertTextToLink = Extension.create({
        name: 'convertTextToLink',
        addStorage() {
            return {
                links: []
            }
        },
        addProseMirrorPlugins() {
            return [
                new Plugin({
                    state: {
                        init(_, editor) {
                            return findLink(editor.doc)
                        },
                        apply(transaction, oldState) {
                            return transaction.docChanged ? findLink(transaction.doc) : oldState
                        },
                    },

                    props: {
                        decorations(state) {
                            return this.getState(state)
                        },
                    },
                }),
            ]
        }
    });
    interface Match {
        0: string;
        groups?: undefined;
        index: number;
        input: string;
        length: number;
    }
    const findLink = (doc) => {
        const decorations: Decoration[] = [];
        doc.descendants((node, pos) => {
            if (!textToLinkStore.items) {
                return;
            }
            const regex = new RegExp(textToLinkStore.items.map(obj => `${obj}-\\d+|${obj}-D-\\d+`).join("|"), 'g');

            for (const obj of Array.from(node.text?.matchAll(regex) ?? []) as any[]) {
                const item: Match = obj as Match;
                const text = obj[0];

                const index = item.index || 0
                const from = pos + index;
                const to = from + text.length;
                const decoration = Decoration.inline(from, to, {
                    nodeName: 'a',
                    href: `/open/${text}`,
                    target: '_blank'
                })

                decorations.push(decoration)
            }

        })

        return DecorationSet.create(doc, decorations)
    }

    return {
        convertTextToLink
    }
}
