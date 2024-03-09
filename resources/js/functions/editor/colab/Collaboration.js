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
const user = useUserStore();

const Collaboration = Extension.create({
    name: "collaboration",
    defaultOptions: {},
    addOptions() {
        return {
            documentId: null,
        };
    },
    addStorage() {
        return {
            isReady: false,
            version: 1,
            sendableUpdates: null,
            steps: [],
            debounced: null,
        };
    },

    onTransaction: debounce(function ({ editor }) {
        console.log("is it debounced");
        if (!this.storage.isReady) {
            return;
        }
        const request = {
            sendable: null,
            selection: null,
        };
        // //debounce missing
        const sendable = sendableSteps(editor.state);
        if (sendable) {
            console.log(sendable.version);
            this.storage.version = sendable.version;
            request.sendable = {
                version: sendable.version,
                steps: sendable.steps.map((obj) => JSON.stringify(obj)),
                clientID: sendable.clientID,
            };
            axios.post(
                `/api/v1/collaboration/${this.options.documentId}`,
                request
            );
        }
    }, 300),
    onCreate(editor) {
        this.editor.registerPlugin(
            collab({
                version: 1,
                clientID: user.user.id,
            })
        );

        Echo.join(`collaboration.${this.options.documentId}`)
            .here((users) => {
                console.log("here", users);
                this.storage.isReady = true;
            })
            .joining((user) => {})
            .leaving((user) => {})
            .error((error) => {
                // this.options.onConnectionRefused(error);
            })
            .listen("EditorCollabEvent", (message) => {
                const { state, view, schema } = this.editor;
                const data = message.data;
                // if (data.selection) {
                //     this.editor.commands.updateColabCursors(data.selection);
                //     return;
                // }

                console.log(
                    data.sendable.steps.map((obj) =>
                        Step.fromJSON(schema, JSON.parse(obj))
                    )
                );
                if (getVersion(state) > data.sendable.version) {
                    return;
                }
                view.dispatch(
                    receiveTransaction(
                        state,
                        data.sendable.steps.map((obj) =>
                            Step.fromJSON(schema, JSON.parse(obj))
                        ),
                        data.sendable.steps.map(() => data.sendable.clientID)
                    )
                );
            });
    },
    onSelectionUpdate(cursors) {
        this.editor.commands.updateColabCursors(cursors);
    },
});

export { Collaboration };
