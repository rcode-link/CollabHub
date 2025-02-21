import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { useTextToLinkStore } from '../../store/textToLinkStore.js' // Update this path as needed
import { useRouter } from 'vue-router'

export const useConvertTextToLink = () => {
    const textToLinkStore = useTextToLinkStore()
    const router = useRouter()

    // Simplified plugin key
    const pluginKey = new PluginKey('convertTextToLink')

    // Lightweight link finder with optimal regex handling
    const findLink = (doc) => {
        // Early return if no items
        if (!textToLinkStore.items?.length) return DecorationSet.empty

        const decorations = []
        // Create pattern once per document scan
        const pattern = new RegExp(textToLinkStore.items.map(item =>
            `${item}-\\d+|${item}-D-\\d+`).join('|'), 'g')

        doc.descendants((node, pos) => {
            // Skip non-text nodes quickly
            if (!node.isText) return

            const text = node.text
            if (!text) return

            // Reset regex for each new text node
            pattern.lastIndex = 0

            let match
            while ((match = pattern.exec(text)) !== null) {
                const id = match[0]
                const from = pos + match.index
                const to = from + id.length

                // Minimal decoration
                decorations.push(
                    Decoration.inline(from, to, {
                        nodeName: 'a',
                        class: 'router-link',
                        'data-id': id
                    })
                )
            }
        })

        return DecorationSet.create(doc, decorations)
    }

    // Create minimal extension
    const convertTextToLink = Extension.create({
        name: 'convertTextToLink',

        addProseMirrorPlugins() {
            // Use a single plugin with minimal features
            return [
                new Plugin({
                    key: pluginKey,

                    state: {
                        init(_, { doc }) {
                            return findLink(doc)
                        },
                        apply(tr, old) {
                            return tr.docChanged ? findLink(tr.doc) : old
                        }
                    },

                    props: {
                        decorations(state) {
                            return this.getState(state)
                        },

                        handleClick(view, pos, event) {
                            const target = event.target
                            if (target.classList.contains('router-link')) {
                                const id = target.getAttribute('data-id')
                                if (id) {
                                    event.preventDefault()
                                    router.push(`/open/${id}`)
                                    return true
                                }
                            }
                            return false
                        }
                    }
                })
            ]
        }
    })

    return { convertTextToLink }
}
