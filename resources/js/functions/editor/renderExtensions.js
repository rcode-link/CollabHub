/**
 * Extensions used by generateHTML() to render stored TipTap JSON to HTML.
 * Defined at module level so the lowlight instance and extension objects are
 * created exactly once, shared across every RenderMessage component instance.
 */
import StarterKit from '@tiptap/starter-kit'
import { Link } from '@tiptap/extension-link'
import Mention from '@tiptap/extension-mention'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import tableExtension from '@/functions/editor/TableExtension'
import { createLowlight } from 'lowlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import hljs from 'highlight.js'
import vacation from '@/components/shared/vacationPlugin/vacation'
import { SmilieReplacer } from '@/functions/smilieReplacer'
import drawIoExtension from '@rcode-link/tiptap-drawio'
import { ResizableImage } from '@/functions/editor/blocks/imageNode/ImageNode'

const lowlight = createLowlight()
hljs.listLanguages().forEach(lang => {
    try {
        lowlight.register(lang, hljs.getLanguage(lang)?.rawDefinition)
    } catch {}
})

export const renderExtensions = [
    StarterKit.configure({ codeBlock: false }),
    CodeBlockLowlight.configure({ lowlight }),
    Mention.configure({ HTMLAttributes: { class: 'mention' } }),
    Link.configure({ openOnClick: false }),
    tableExtension.configure({ resizable: false, allowTableNodeSelection: false }),
    TableRow,
    TableHeader,
    TableCell,
    vacation,
    SmilieReplacer,
    drawIoExtension,
    ResizableImage,
]
