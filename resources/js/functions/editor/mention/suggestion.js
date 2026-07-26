import { h, render } from 'vue'
import { tippy } from 'vue-tippy'

import MentionList from '@/functions/editor/mention/MentionList.vue'
import { useUserStore } from "@/store/user";

export default function useSuggestion() {

  const userState = useUserStore();
  const plugin = {
    items: async ({ query }) => {
      if (!userState.company?.id) return [];

      return await window.axios.get(`/api/v1/company/users/${userState.company.id}`, {
        params: {
          'user': query,
        }
      }).then(res => (res.data.data ?? []).slice(0, 8)).catch(() => []);
    },

    render: () => {
      let holder = null
      let popup = null
      let listInstance = null

      // MentionList is pure-props, so it can be mounted standalone — no
      // dependency on the editor's Vue app context (VueRenderer needs the
      // EditorContent's contentComponent, which is fragile across editors).
      const draw = (props) => {
        render(
          h(MentionList, {
            items: props.items,
            command: props.command,
            ref: inst => { listInstance = inst },
          }),
          holder,
        )
      }

      return {
        onStart: props => {
          holder = document.createElement('div')
          draw(props)

          if (!props.clientRect) {
            return
          }

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: holder,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'auto-start',
            maxWidth: 'none',
            zIndex: 99999,
            theme: 'mention',
            arrow: false,
          })
        },

        onUpdate(props) {
          if (holder) draw(props)

          if (!props.clientRect || !popup) {
            return
          }

          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          })
        },

        onKeyDown(props) {
          if (props.event.key === 'Escape') {
            popup?.[0].hide()

            return true
          }

          return listInstance?.onKeyDown(props) ?? false
        },

        onExit() {
          popup?.[0].destroy()
          if (holder) render(null, holder)
          popup = null
          holder = null
          listInstance = null
        },
      }
    },
  };

  return {
    plugin
  }
}
