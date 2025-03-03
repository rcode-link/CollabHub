import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

// Avoid importing the entire vue-router - instead, accept a navigation function
export const useConvertTextToLink = (items, navigateFn) => {
    // Simplified plugin key
    const pluginKey = new PluginKey('convertTextToLink')

    // Optimize pattern creation - only recreate when items change
    const createPattern = (itemList) => {
        if (!itemList?.length) return null
        return new RegExp(itemList.map(item => `${item}-\\d+|${item}-D-\\d+`).join('|'), 'g')
    }

    // Lightweight link finder with optimal regex handling
    const findLink = (doc) => {
        // Early return if no items
        if (!items?.length) return DecorationSet.empty

        const decorations = []
        // Create pattern only once
        const pattern = createPattern(items)
        if (!pattern) return DecorationSet.empty

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
                            if (target?.classList?.contains('router-link')) {
                                const id = target.getAttribute('data-id')
                                if (id) {
                                    event.preventDefault()
                                    // Use the provided navigation function or fallback to window.location
                                    if (typeof navigateFn === 'function') {
                                        navigateFn(`/open/${id}`)
                                    } else {
                                        window.location.href = `/open/${id}`
                                    }
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
