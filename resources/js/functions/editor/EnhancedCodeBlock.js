import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import CodeBlockView from '@/components/shared/editor/CodeBlockView.vue'

/**
 * EnhancedCodeBlock — extends CodeBlockLowlight with:
 *  - data-language attribute on <pre> for CSS language label
 *  - Vue NodeView with copy-to-clipboard button (interactive editors)
 */
export const EnhancedCodeBlock = CodeBlockLowlight.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            language: {
                default: null,
                parseHTML: element => {
                    const code = element.querySelector('code')
                    const cls = code
                        ? [...code.classList].find(c => c.startsWith('language-'))
                        : null
                    return cls ? cls.replace('language-', '') : element.getAttribute('data-language') || null
                },
                renderHTML: attributes => {
                    if (!attributes.language) return {}
                    return { 'data-language': attributes.language }
                },
            },
        }
    },

    renderHTML({ node, HTMLAttributes }) {
        const lang = node.attrs.language
        return [
            'pre',
            { ...HTMLAttributes, ...(lang ? { 'data-language': lang } : {}) },
            ['code', { class: lang ? `language-${lang}` : null }, 0],
        ]
    },

    addNodeView() {
        return VueNodeViewRenderer(CodeBlockView)
    },
})

/**
 * Render-only variant for generateHTML() — no NodeView, just proper renderHTML.
 * Use this in renderExtensions.js.
 */
export const EnhancedCodeBlockRender = CodeBlockLowlight.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            language: {
                default: null,
                parseHTML: element => {
                    const code = element.querySelector('code')
                    const cls = code
                        ? [...code.classList].find(c => c.startsWith('language-'))
                        : null
                    return cls ? cls.replace('language-', '') : element.getAttribute('data-language') || null
                },
                renderHTML: attributes => {
                    if (!attributes.language) return {}
                    return { 'data-language': attributes.language }
                },
            },
        }
    },

    renderHTML({ node, HTMLAttributes }) {
        const lang = node.attrs.language
        return [
            'pre',
            { ...HTMLAttributes, ...(lang ? { 'data-language': lang } : {}) },
            ['code', { class: lang ? `language-${lang}` : null }, 0],
        ]
    },
})
