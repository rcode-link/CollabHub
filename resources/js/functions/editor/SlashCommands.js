// SlashCommands.js - New file for Notion-like slash commands
// Place this file in resources/js/functions/editor/SlashCommands.js

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import Suggestion from '@tiptap/suggestion';

export default Extension.create({
  name: 'slashCommands',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
        items: ({ query }) => {
          const items = [
            {
              title: 'Text',
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setParagraph()
                  .run();
              },
            },
            {
              title: 'Heading 1',
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setHeading({ level: 1 })
                  .run();
              },
            },
            {
              title: 'Heading 2',
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setHeading({ level: 2 })
                  .run();
              },
            },
            {
              title: 'Heading 3',
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setHeading({ level: 3 })
                  .run();
              },
            },
            {
              title: 'To-do List',
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .toggleTaskList()
                  .run();
              },
            },
            {
              title: 'Bulleted List',
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .toggleBulletList()
                  .run();
              },
            },
            {
              title: 'Numbered List',
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .toggleOrderedList()
                  .run();
              },
            },
            {
              title: 'Quote',
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .toggleBlockquote()
                  .run();
              },
            },
            {
              title: 'Code Block',
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .toggleCodeBlock()
                  .run();
              },
            },
            {
              title: 'Table',
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run();
              },
            },
            {
              title: 'Divider',
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setHorizontalRule()
                  .run();
              },
            },
            {
              title: 'Page Link',
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .insertContent('[Page Title]()')
                  .run();
              },
            },
          ];

          return items.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase())
          );
        },
        render: () => {
          let popup = null;
          let component = null;

          return {
            onStart: props => {
              // Create the popup container
              component = document.createElement('div');
              component.classList.add('notion-slash-menu');

              const items = props.items;

              // Clear existing children
              while (component.firstChild) {
                component.removeChild(component.firstChild);
              }

              // Add title
              const title = document.createElement('div');
              title.classList.add('notion-slash-menu-title');
              title.textContent = 'BASIC BLOCKS';
              component.appendChild(title);

              // Add items
              items.forEach((item, index) => {
                const button = document.createElement('button');
                button.classList.add('notion-slash-menu-item');
                if (index === props.selectedIndex) {
                  button.classList.add('is-selected');
                }

                button.addEventListener('click', () => {
                  props.command(item);
                  popup.hide();
                });

                const text = document.createElement('div');
                text.classList.add('notion-slash-menu-item-text');
                text.textContent = item.title;

                button.appendChild(text);
                component.appendChild(button);
              });

              // Create and show the popup
              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },

            onUpdate: props => {
              // Update the popup content
              const items = props.items;

              // Clear existing children
              while (component.firstChild) {
                component.removeChild(component.firstChild);
              }

              // Add title
              const title = document.createElement('div');
              title.classList.add('notion-slash-menu-title');
              title.textContent = 'BASIC BLOCKS';
              component.appendChild(title);

              // Add items
              items.forEach((item, index) => {
                const button = document.createElement('button');
                button.classList.add('notion-slash-menu-item');
                if (index === props.selectedIndex) {
                  button.classList.add('is-selected');
                }

                button.addEventListener('click', () => {
                  props.command(item);
                  popup.hide();
                });

                const text = document.createElement('div');
                text.classList.add('notion-slash-menu-item-text');
                text.textContent = item.title;

                button.appendChild(text);
                component.appendChild(button);
              });

              // Update popup position
              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              });
            },

            onKeyDown: props => {
              if (props.event.key === 'Escape') {
                popup.hide();
                return true;
              }

              // Use up/down arrows to navigate
              if (props.event.key === 'ArrowUp') {
                const prevIndex = props.selectedIndex === 0
                  ? props.items.length - 1
                  : props.selectedIndex - 1;

                component.querySelectorAll('.notion-slash-menu-item').forEach((el, i) => {
                  if (i === prevIndex) el.classList.add('is-selected');
                  else el.classList.remove('is-selected');
                });

                return true;
              }

              if (props.event.key === 'ArrowDown') {
                const nextIndex = props.selectedIndex === props.items.length - 1
                  ? 0
                  : props.selectedIndex + 1;

                component.querySelectorAll('.notion-slash-menu-item').forEach((el, i) => {
                  if (i === nextIndex) el.classList.add('is-selected');
                  else el.classList.remove('is-selected');
                });

                return true;
              }

              if (props.event.key === 'Enter') {
                props.command(props.items[props.selectedIndex]);
                popup.hide();
                return true;
              }

              return false;
            },

            onExit: () => {
              if (popup) {
                popup.destroy();
                popup = null;
              }
            },
          };
        },
      }),
    ];
  },
});
