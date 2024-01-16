import {mergeAttributes, Node, VueNodeViewRenderer} from '@tiptap/vue-3'
import Vacation from "./Vacation.vue";

export default Node.create({
    name: 'vacation',

    group: 'block',

    atom: true,

    addAttributes() {
        return {
            eventId: null,
        }
    },

    parseHTML() {
        return [
            {
                tag: 'vacation-request',
            },
        ]
    },

    renderHTML({HTMLAttributes}) {
        return ['vacation-request', mergeAttributes(HTMLAttributes)]
    },

    addNodeView() {
        return VueNodeViewRenderer(Vacation)
    },
});
