/* eslint-disable class-methods-use-this */
import { Extension } from "@tiptap/vue-3";
import { Step } from "prosemirror-transform";
import {
    collab,
    getVersion,
    receiveTransaction,
    sendableSteps,
} from "prosemirror-collab";
import { useUserStore } from "../../../store/user.js";
import { debounce } from "lodash";

/**
 * Enhanced collaboration extension for TipTap editor
 * Provides real-time collaboration with proper version control, error handling, and cursor sync
 */
const Collaboration = Extension.create({
    name: "collaboration",

    // Default configuration options
    addOptions() {
        return {
            documentId: null,
            // How often to send updates (in ms)
            debounce: 150,
            // Maximum number of retries for sending steps
            maxRetries: 5,
            // Wait time between retries (ms)
            retryDelay: 300,
        };
    },

    // Internal storage
    addStorage() {
        oeturn {
            // Whether the connection is ready for sending updates
            isReady: false,
            // Current version of the document
            version: 0,
            // Queue of updates to be sent
            sendQueue: [],
            // Current retry count
            retryCount: 0,
            // User information
            user: useUserStore().user,
            // Users currently in the document
            users: [],
            // Track if we're currently sending an update
            isSending: false,
        };
    },

    // Handle transactions and send updates to server
    onTransaction: debounce(function ({ editor, transaction }) {
        // Skip if the connection is not ready yet
        if (!this.storage.isReady || this.storage.isSending) {
            return;
        }

        // Check if we have sendable steps
        const sendable = sendableSteps(editor.state);
        if (!sendable) {
            // No steps to send, but we might have selection changes
            //this.sendCursorPosition(editor);
            return;
        }

        // Store the current version
        this.storage.version = sendable.version;

        // Prepare request data
        const request = {
            sendable: {
                version: sendable.version,
                steps: sendable.steps.map((step) => JSON.stringify(step)),
                clientID: this.storage.user.id,
            },
            // Include current selection for cursor sync
            selection: {
                from: editor.state.selection.from,
                to: editor.state.selection.to,
                clientID: this.storage.user.id,
                user: {
                    id: this.storage.user.id,
                    name: this.storage.user.name,
                    color: this.getRandomColor(this.storage.user.id),
                },
            },
        };

        // Send the updates to the server
        this.sendSteps(request);
    }, function() { return this.options.debounce; }),

    // Setup editor and connection
    onCreate() {
        // Initialize collaboration plugin
        this.editor.registerPlugin(
            collab({
                // Start with version 0
                version: 0,
                // Use user ID as client ID
                clientID: this.storage.user.id,
            })
        );

        // Join the collaboration channel
        Echo.join(`collaboration.${this.options.documentId}`)
            .here((users) => {
                // Store connected users
                this.storage.users = users;
                // Mark as ready for sending updates
                this.storage.isReady = true;
            })
            .joining((user) => {
                // Add new user to the list
                this.storage.users.push(user);
            })
            .leaving((user) => {
                // Remove user from the list
                this.storage.users = this.storage.users.filter(u => u.id !== user.id);
            })
            .error((error) => {
                console.error('Collaboration connection error:', error);
                // Mark as not ready
                this.storage.isReady = false;
                // Try to reconnect after a delay
                setTimeout(() => {
                    Echo.join(`collaboration.${this.options.documentId}`);
                }, 2000);
            })
            .listen("EditorCollabEvent", (message) => {
                this.handleIncomingUpdate(message);
            });
    },

    // Handle selection changes for cursor sync
    onSelectionUpdate({ editor }) {
        if (!this.storage.isReady) {
            return;
        }

       // this.sendCursorPosition(editor);
    },

    // Methods
    addCommands() {
        return {
            // Force send current state to server
            forceSendUpdate: () => ({ editor }) => {
                this.onTransaction({ editor });
                return true;
            },
        };
    },

    // Helper methods
    methods: {
        // Send cursor position for syncing
        sendCursorPosition(editor) {
            // Don't send cursor if we're still setting up
            if (!this.storage.isReady) return;

            const selection = editor.state.selection;
            if (!selection) return;

            const request = {
                selection: {
                    from: selection.from,
                    to: selection.to,
                    clientID: this.storage.user.id,
                    user: {
                        id: this.storage.user.id,
                        name: this.storage.user.name,
                        color: this.getRandomColor(this.storage.user.id),
                    },
                },
            };

            // Debounced to reduce network traffic
            axios.post(
                `/api/collaboration/${this.options.documentId}`,
                request
            ).catch(error => {
                console.error('Error sending cursor position:', error);
            });
        },

        // Send document updates to server
        sendSteps(request) {
            this.storage.isSending = true;

            axios.post(
                `/api/collaboration/${this.options.documentId}`,
                request
            )
            .then(() => {
                this.storage.retryCount = 0;
                this.storage.isSending = false;

                // Process any queued updates
                if (this.storage.sendQueue.length > 0) {
                    const nextRequest = this.storage.sendQueue.shift();
                    this.sendSteps(nextRequest);
                }
            })
            .catch(error => {
                console.error('Error sending steps:', error);

                if (this.storage.retryCount < this.options.maxRetries) {
                    this.storage.retryCount++;

                    // Retry after delay
                    setTimeout(() => {
                        this.sendSteps(request);
                    }, this.options.retryDelay * this.storage.retryCount);
                } else {
                    // Reset after too many retries
                    this.storage.retryCount = 0;
                    this.storage.isSending = false;

                    // Notify user of sync issues
                    console.error('Failed to sync document changes after multiple attempts');
                }
            });
        },

        // Handle incoming updates from other users
        handleIncomingUpdate(message) {
            const { state, view, schema } = this.editor;
            const data = message.data;

            // Handle cursor updates
            if (data.selection && !data.sendable) {
                // Update cursor positions
                const selectionsData = [{
                    clientID: data.selection.clientID,
                    selection: {
                        from: data.selection.from,
                        to: data.selection.to,
                    },
                    user: data.selection.user,
                }];

                // Update cursor positions
                this.editor.commands.updateColabCursors(selectionsData);
                return;
            }

            // Skip if no sendable steps
            if (!data.sendable || !data.sendable.steps || !data.sendable.steps.length) {
                return;
            }

            try {
                // Parse steps from JSON
                const steps = data.sendable.steps.map(step =>
                    Step.fromJSON(schema, JSON.parse(step))
                );

                // Skip if we're ahead of this version
                const currentVersion = getVersion(state);
                if (currentVersion > data.sendable.version) {
                    return;
                }

                // Version mismatch - need to handle carefully
                if (currentVersion !== data.sendable.version - steps.length) {
                    console.warn('Version mismatch in collaboration', {
                        current: currentVersion,
                        incoming: data.sendable.version
                    });

                    // We can't apply these steps correctly now
                    // Consider reloading or requesting current version
                    return;
                }

                // Apply the transaction
                view.dispatch(
                    receiveTransaction(
                        state,
                        steps,
                        steps.map(() => data.sendable.clientID)
                    )
                );

                // Update cursor position if available
                if (data.selection) {
                    const selectionsData = [{
                        clientID: data.selection.clientID,
                        selection: {
                            from: data.selection.from,
                            to: data.selection.to,
                        },
                        user: data.selection.user,
                    }];

                    this.editor.commands.updateColabCursors(selectionsData);
                }
            } catch (error) {
                console.error('Error applying collaborative changes:', error);
            }
        },

        // Generate a deterministic color based on user ID
        getRandomColor(id) {
            // Use user ID to create a deterministic color
            const hash = String(id).split('').reduce((acc, char) => {
                return char.charCodeAt(0) + ((acc << 5) - acc);
            }, 0);

            const hue = hash % 360;
            return `hsl(${hue}, 70%, 60%)`;
        }
    }
});

export { Collaboration };
