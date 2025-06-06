import { Table } from "@tiptap/extension-table";
import { v4 } from 'uuid';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { findParentNode } from '@tiptap/core';

// Create a plugin key for our table extension
const tablePluginKey = new PluginKey('improved-table');

export default Table.extend({
    name: 'improvedTable',

    addOptions() {
        return {
            ...this.parent?.(),
            resizable: true,
            handleWidth: 5,
            cellMinWidth: 50,
            lastColumnResizable: true,
            allowTableNodeSelection: true,
            HTMLAttributes: {
                class: 'tiptap-table',
            },
        };
    },

    addAttributes() {
        return {
            id: {
                default: () => v4(),
            },
            width: {
                default: '100%',
                parseHTML: element => element.style.width || '100%',
                renderHTML: attributes => {
                    return {
                        style: `width: ${attributes.width}`,
                    };
                },
            },
            backgroundColor: {
                default: null,
                parseHTML: element => element.getAttribute('data-background-color') || null,
                renderHTML: attributes => {
                    if (!attributes.backgroundColor) {
                        return {};
                    }

                    return {
                        'data-background-color': attributes.backgroundColor,
                        style: `background-color: ${attributes.backgroundColor}`,
                    };
                },
            },
            borderCollapse: {
                default: 'collapse',
                parseHTML: element => element.style.borderCollapse || 'collapse',
                renderHTML: attributes => {
                    return {
                        style: `border-collapse: ${attributes.borderCollapse}`,
                    };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'table',
                getAttrs: (el) => {
                    const element = el as HTMLTableElement;
                    return {
                        width: element.style.width,
                        backgroundColor: element.getAttribute('data-background-color'),
                        borderCollapse: element.style.borderCollapse,
                    };
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['table', HTMLAttributes, ['tbody', 0]];
    },

    addCommands() {
        return {
            ...this.parent?.(),

            // Add command to set table width
            setTableWidth: (width) => ({ tr, state, dispatch }) => {
                const { selection } = state;
                const tableNode = findParentNode(node => node.type.name === 'table')(selection);

                if (!tableNode) {
                    return false;
                }

                if (dispatch) {
                    tr.setNodeMarkup(tableNode.pos, undefined, {
                        ...tableNode.node.attrs,
                        width,
                    });
                    dispatch(tr);
                }

                return true;
            },

            // Add command to set table background color
            setTableBackgroundColor: (color) => ({ tr, state, dispatch }) => {
                const { selection } = state;
                const tableNode = findParentNode(node => node.type.name === 'table')(selection);

                if (!tableNode) {
                    return false;
                }

                if (dispatch) {
                    tr.setNodeMarkup(tableNode.pos, undefined, {
                        ...tableNode.node.attrs,
                        backgroundColor: color,
                    });
                    dispatch(tr);
                }

                return true;
            }
        };
    },

    addProseMirrorPlugins() {
        const plugins = this.parent?.() || [];

        // Plugin to highlight the current table row and column
        const highlightPlugin = new Plugin({
            key: tablePluginKey,
            props: {
                decorations: (state) => {
                    const { doc, selection } = state;

                    if (!selection || !doc) {
                        return DecorationSet.empty;
                    }

                    const decorations = [];
                    const tableNode = findParentNode(node => node.type.name === 'table')(selection);

                    if (!tableNode) {
                        return DecorationSet.empty;
                    }

                    // Find the current cell
                    const cellNode = findParentNode(node =>
                        node.type.name === 'tableCell' || node.type.name === 'tableHeader'
                    )(selection);

                    if (!cellNode) {
                        return DecorationSet.empty;
                    }

                    // Find the current row
                    const rowNode = findParentNode(node => node.type.name === 'tableRow')(selection);

                    if (rowNode) {
                        // Add decoration for the current row
                        decorations.push(
                            Decoration.node(rowNode.pos, rowNode.pos + rowNode.node.nodeSize, {
                                class: 'selected-table-row',
                            })
                        );
                    }

                    // Add decoration for the current cell
                    decorations.push(
                        Decoration.node(cellNode.pos, cellNode.pos + cellNode.node.nodeSize, {
                            class: 'selected-table-cell',
                        })
                    );

                    return DecorationSet.create(doc, decorations);
                },
            },
        });

        // Add the resizing cursor plugin
        if (this.options.resizable) {
            const resizeCursorPlugin = new Plugin({
                key: new PluginKey('table-resize-cursor'),
                props: {
                    handleDOMEvents: {
                        mousemove: (view, event) => {
                            const target = event.target;
                            const editorElem = view.dom;

                            // Check if we're near a table cell border
                            if (target instanceof HTMLElement &&
                                (target.nodeName === 'TD' || target.nodeName === 'TH')) {

                                const rect = target.getBoundingClientRect();
                                const mouseX = event.clientX;

                                // Check if mouse is near the right border of the cell
                                const isNearRightBorder = Math.abs(rect.right - mouseX) <= this.options.handleWidth;

                                // Don't allow resizing the last column if the option is disabled
                                if (isNearRightBorder) {
                                    if (!this.options.lastColumnResizable) {
                                        // Check if this is the last cell in the row
                                        const isLastCell = !target.nextElementSibling;
                                        if (isLastCell) {
                                            editorElem.classList.remove('resize-cursor');
                                            return false;
                                        }
                                    }

                                    // Add the resize cursor class to the editor
                                    editorElem.classList.add('resize-cursor');
                                    return false;
                                }
                            }

                            // Remove the resize cursor class if not near a border
                            editorElem.classList.remove('resize-cursor');
                            return false;
                        },
                        mouseleave: (view) => {
                            // Remove the resize cursor class when mouse leaves the editor
                            view.dom.classList.remove('resize-cursor');
                            return false;
                        }
                    }
                }
            });

            return [...plugins, highlightPlugin, resizeCursorPlugin];
        }

        return [...plugins, highlightPlugin];
    },
});
