import { VueRenderer } from '@tiptap/vue-3'
import { tippy } from 'vue-tippy'

import MentionList from './MentionList.vue'
import { useUserStore } from "../../../store/user";

export default function useSuggestion() {

  const userState = useUserStore();
  const plugin = {
    items: async ({ query }) => {
      return await axios.get(`/api/v1/company/users/${userState.company.id}`, {
        params: {
          'user': query,
        }
      }).then(res => res.data.data);
    },

    render: () => {
      let component
      let popup

      return {
        onSelect(props) {
          console.log(props);

        },
        onStart: props => {
          component = new VueRenderer(MentionList, {
            props,
            editor: props.editor,
          })

          if (!props.clientRect) {
            return
          }

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          })
        },

        onUpdate(props) {
          component.updateProps(props)

          if (!props.clientRect) {
            return
          }

          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          })
        },

        onKeyDown(props) {
          if (props.event.key === 'Escape') {
            popup[0].hide()

            return true
          }

          return component.ref?.onKeyDown(props)
        },

        onExit() {
          popup[0].destroy()
          component.destroy()
        },
      }
    },
  };

  return {
    plugin
  }
}
