import { Mark, mergeAttributes } from '@tiptap/core'

export const CommentMark = Mark.create({
  name: 'comment',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: el => el.getAttribute('data-comment-id'),
        renderHTML: attrs => {
          if (!attrs.commentId) return {}
          return { 'data-comment-id': attrs.commentId }
        },
      },
      resolved: {
        default: false,
        parseHTML: el => el.getAttribute('data-resolved') === 'true',
        renderHTML: attrs => {
          if (!attrs.resolved) return {}
          return { 'data-resolved': 'true' }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-comment-id]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'comment-highlight',
      }),
      0,
    ]
  },
})
