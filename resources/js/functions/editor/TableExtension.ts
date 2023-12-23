import {Table} from "@tiptap/extension-table";
import {v4} from 'uuid'

export default Table.extend({
    addAttributes() {
        return {
            id: {
                default: v4(),
            }
        }
    }
    , parseHTML() {
        return [
            {
                getAttrs: (el) => !!(el as HTMLSpanElement).getAttribute('id')?.trim() && null,
            },
        ]
    },
})
