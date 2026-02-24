import Image from '@tiptap/extension-image'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import AuthImageNode from '@/components/shared/AuthImageNode.vue'

export const AuthImageExtension = Image.extend({
    addNodeView() {
        return VueNodeViewRenderer(AuthImageNode)
    },
})

export default AuthImageExtension
