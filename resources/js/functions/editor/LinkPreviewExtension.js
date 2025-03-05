import { Extension, Node } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

import { VueNodeViewRenderer } from '@tiptap/vue-3'
import LinkPreview from '@/components/shared/editor/LinkPreview.vue'

// Regular expression for URL detection
const urlRegex = /(https?:\/\/|www\.)[^\s]+\.[^\s]+(?=[^.,:;!?()\[\]{}](?:\s|$)|$)/gi
let fetchMetadataGlobal = null;

/**
 * Link Preview Block Node - Define the node type for link previews
 */
export const LinkPreviewBlock = Node.create({
    name: 'linkPreviewBlock',

    group: 'inline',

    inline: true,

    addAttributes() {
        return {
            url: { default: null },
            title: { default: null },
            description: { default: null },
            image: { default: null },
            showPreview: { default: false },
            cssClasses: {}
        }
    },

    parseHTML() {
        return [{ tag: 'div[data-link-preview]' }]
    },

    renderHTML() {
        return ['div', { 'data-link-preview': '' }]
    },

    addNodeView() {
        return VueNodeViewRenderer(LinkPreview)
    }
})



/**
 * LinkPreviewExtension for TipTap
 * Automatically converts URLs into rich link previews with image, title, and description
 * Uses external CSS classes for styling
 */
export const LinkPreviewExtension = Extension.create({
    name: 'linkPreview',

    // Define the extension's priority
    priority: 100,

    // Setup dependencies
    addOptions() {
        return {
            // The protocol to prepend when 'www.' is detected without protocol
            defaultProtocol: 'https://',
            // Whether to open links in a new tab
            openInNewTab: true,
            // Function to fetch metadata for a URL
            fetchMetadata: async (url) => {
                try {
                    // In a real implementation, this would be replaced with your API endpoint
                    // that fetches metadata from the URL (likely using a server-side proxy)
                    const response = await fetch(`http://www.corsproxy.com/${url.replace('https', '')}`)
                    if (!response.ok) throw new Error('Failed to fetch metadata')
                    return await response.json()
                } catch (error) {
                    console.error('Error fetching link metadata:', error)
                    return {
                        url,
                        title: url,
                        description: '',
                        image: null
                    }
                }
            },
            // Maximum links to process in one transaction
            maxLinksPerTransaction: 5,
            // Placeholder image when no image is available
            placeholderImage: null,
            // CSS classes for different parts of the preview
            cssClasses: {
                container: 'max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700',
                imageLink: '',
                image: 'rounded-t-lg',
                contentContainer: 'p-5',
                titleLink: '',
                title: 'mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white',
                description: 'mb-3 font-normal text-gray-700 dark:text-gray-400',
                url: 'text-sm text-gray-500 dark:text-gray-400',
                plainLink: 'text-blue-600 hover:underline dark:text-blue-500'
            },
            // Loading state text and classes
            loadingState: {
                text: 'Loading link preview...',
                className: 'p-4 text-gray-500 text-center dark:text-gray-400'
            },
            // Default showPreview state for new link previews
            // This is the initial value when links are detected
            defaultShowPreview: false
        }
    },

    // Add the node to the extension
    addExtensions() {
        return [
            LinkPreviewBlock.configure({
                extension: this.options
            })
        ]
    },

    // Add custom commands to the editor
    addCommands() {
        return {
            // Command to manually create a link preview
            createLinkPreview: (url, showPreview = true) => ({ commands }) => {
                return commands.insertContent({
                    type: 'linkPreviewBlock',
                    attrs: { url, loading: true, showPreview }
                })
            },

            // Command to toggle preview visibility for all link previews
            toggleLinkPreviews: (show) => ({ tr, state, dispatch }) => {
                if (!dispatch) return true

                const newTr = tr.clone()
                let modified = false

                state.doc.descendants((node, pos) => {
                    if (node.type.name === 'linkPreviewBlock') {
                        newTr.setNodeMarkup(pos, null, {
                            ...node.attrs,
                            showPreview: show
                        })
                        modified = true
                    }
                })

                if (modified) {
                    dispatch(newTr)
                }

                return true
            },

            // Command to enable previews (for message sent scenario)
            enableLinkPreviews: () => ({ commands }) => {
                return commands.toggleLinkPreviews(true)
            }
        }
    },

    // Define fetchLinkMetadata as a function that is available on the instance
    onCreate() {
        // Store the function as a property of the instance
        fetchMetadataGlobal = (url, view) => {
            const { fetchMetadata } = this.options

            fetchMetadata(url).then(metadata => {
                if (!view || !view.state) return

                const { state, dispatch } = view
                const { tr } = state
                let updated = false

                // Find and update the link preview node
                state.doc.descendants((node, pos) => {
                    if (node.type.name === 'linkPreviewBlock' && node.attrs.url === url && node.attrs.loading) {
                        tr.setNodeMarkup(pos, null, {
                            ...node.attrs,
                            loading: false,
                            title: metadata.title || url,
                            description: metadata.description || '',
                            image: metadata.image || this.options.placeholderImage
                        })
                        updated = true
                    }
                })

                if (updated) {
                    dispatch(tr)
                }
            }).catch(error => {
                console.error('Error updating link preview:', error)
            })
        }
    },

    // Add the extension's plugins
    addProseMirrorPlugins() {
        const { defaultProtocol, maxLinksPerTransaction, previewMode, shouldShowPreview } = this.options
        const extension = this

        return [
            new Plugin({
                key: new PluginKey('linkPreview'),

                // Process clipboard paste events to detect links
                props: {
                    handlePaste: (view, event) => {
                        const text = event.clipboardData?.getData('text/plain')
                        if (!text) return false

                        // Check if pasted content is a URL
                        urlRegex.lastIndex = 0
                        const match = urlRegex.exec(text)

                        if (match) {
                            const url = match[0].startsWith('www.')
                                ? `${defaultProtocol}${match[0]}`
                                : match[0]

                            // Insert link preview node
                            const { state, dispatch } = view
                            const { tr } = state

                            // Skip if linkPreviewBlock is not in the schema
                            if (!state.schema.nodes.linkPreviewBlock) {
                                console.error('linkPreviewBlock node is not defined in the schema')
                                return false
                            }

                            // Use the default setting for showing previews
                            const initialShowPreview = this.options.defaultShowPreview

                            tr.replaceSelectionWith(
                                state.schema.nodes.linkPreviewBlock.create({
                                    url,
                                    loading: initialShowPreview, // Only load if showing preview
                                    showPreview: initialShowPreview
                                })
                            )

                            dispatch(tr)

                            // Only fetch metadata if preview is shown
                            fetchMetadataGlobal(url, view)

                            return true
                        }

                        return false
                    }
                },

                // Process changes to detect URLs in text
                appendTransaction: (transactions, oldState, newState) => {
                    // Skip if there are no changes
                    if (!transactions.some(transaction => transaction.docChanged)) {
                        return null
                    }

                    // Skip if linkPreviewBlock is not in the schema
                    if (!newState.schema.nodes.linkPreviewBlock) {
                        console.error('linkPreviewBlock node is not defined in the schema')
                        return null
                    }

                    const { tr } = newState
                    let modified = false
                    const linksProcessed = []

                    // Function to find URLs in text nodes
                    const findUrlsInNode = (node, pos) => {
                        if (linksProcessed.length >= maxLinksPerTransaction) return

                        if (node.isText && node.text) {
                            const text = node.text
                            let match

                            // Reset regex state
                            urlRegex.lastIndex = 0

                            while ((match = urlRegex.exec(text)) !== null) {
                                if (linksProcessed.length >= maxLinksPerTransaction) break

                                const start = pos + match.index
                                const end = start + match[0].length

                                // Extract the URL
                                let url = match[0]
                                if (url.startsWith('www.')) {
                                    url = `${defaultProtocol}${url}`
                                }

                                // Use the default setting for showing previews
                                const initialShowPreview = extension.options.defaultShowPreview

                                // Create a link preview node
                                const linkPreviewNode = newState.schema.nodes.linkPreviewBlock.create({
                                    url,
                                    loading: initialShowPreview, // Only load if showing preview
                                    showPreview: initialShowPreview
                                })

                                // Replace the text with link preview
                                tr.delete(start, end)
                                tr.insert(start, linkPreviewNode)

                                modified = true
                                linksProcessed.push({ url, showPreview: initialShowPreview })

                                // Update regex index due to the change in text
                                urlRegex.lastIndex = 0
                            }
                        }

                        // Process child nodes recursively
                        if (!node.isText && node.content) {
                            node.forEach((child, offset) => {
                                findUrlsInNode(child, pos + offset + 1)
                            })
                        }
                    }

                    // Find URLs in the document
                    newState.doc.descendants(findUrlsInNode)

                    // Process detected links
                    if (modified && extension.editor && extension.editor.view) {
                        const view = extension.editor.view

                        // Fetch metadata only for links that have preview enabled
                        linksProcessed.forEach(({ url, showPreview }) => {
                            if (showPreview) {
                                fetchMetadataGlobal(url, view)
                            }
                        })

                        return tr
                    }

                    return null
                }
            })
        ]
    }
})

// Usage example:
// import { Editor } from '@tiptap/core'
// import StarterKit from '@tiptap/starter-kit'
// import { LinkPreviewExtension } from './link-preview-extension'
//
// // Example: Setup for chat with different preview behavior in input vs messages
// const chatInputEditor = new Editor({
//   element: document.querySelector('.chat-input'),
//   extensions: [
//     StarterKit,
//     LinkPreviewExtension.configure({
//       defaultShowPreview: false, // Links in input don't show previews by default
//     })
//   ]
// })
//
// // Example: Setup for message display with previews enabled
// const messageDisplayEditor = new Editor({
//   element: document.querySelector('.message-display'),
//   extensions: [
//     StarterKit,
//     LinkPreviewExtension.configure({
//       defaultShowPreview: true // Always show previews in the message display
//     })
//   ]
// })
//
// // When sending a message from input to display:
// sendMessageButton.addEventListener('click', () => {
//   // 1. Get content from input (links as plain URLs)
//   const inputContent = chatInputEditor.getJSON()
//
//   // 2. Insert content into message display - which will render links as previews
//   messageDisplayEditor.commands.setContent(inputContent)
//
//   // 3. Clear the input
//   chatInputEditor.commands.clearContent()
// })
//
// // Alternative: Use the same editor but toggle preview state when sending
// // sendMessageButton.addEventListener('click', () => {
// //   editor.commands.enableLinkPreviews() // Enable all link previews
// //   const messageWithPreviews = editor.getHTML()
// //   // Send the message...
// //   editor.commands.clearContent()
// // })
