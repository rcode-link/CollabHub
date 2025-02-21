<template>
    <form
        @submit.prevent="submit"
        class="border-t border-amber-50 dark:border-gray-900 p-6"
    >
        <div
            class="flex mb-1 flex-nowrap overflow-auto p-4"
            v-if="chatMessageStore.files.length > 0"
        >
            <FilesComponent
                v-for="(file, index) in chatMessageStore.files"
                :file="file"
                :index="index"
                :key="index"
            />
        </div>

        <div class="relative flex">
            <div v-if="activeMessage" class="p-1 text-sm font-bold">
                <div class="flex-1">Reply to:</div>
                <Editor
                    class="h-4 overflow-hidden"
                    :editable="false"
                    :model="activeMessage.message"
                />
            </div>
            <Editor
                ref="editorRef"
                v-model="chatMessageStore.message"
                css-class="input"
                @submitted="submit"
            />
            <div class="flex gap-2 justify-center items-center ml-2">
                <Emoji @select="onSelectEmoji" />
                <input
                    type="file"
                    class="hidden"
                    id="addFile"
                    @change="
                        (value) => chatMessageStore.addFiles(value.target.files)
                    "
                    multiple
                />
                <label
                    for="addFile"
                    class="font-medium rounded-full cursor-pointer text-center text-sm p-2"
                >
                    <svg
                        class="w-4 h-4"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 16 20"
                    >
                        <path
                            stroke="currentColor"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 1v4a1 1 0 0 1-1 1H1m14-4v16a.97.97 0 0 1-.933 1H1.933A.97.97 0 0 1 1 18V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 5.828 1h8.239A.97.97 0 0 1 15 2Z"
                        />
                    </svg>
                </label>
                <div>
                    <fwb-button color="default" type="submit" pill square>
                        <svg
                            class="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                clip-rule="evenodd"
                                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                fill-rule="evenodd"
                            />
                        </svg>
                    </fwb-button>
                </div>
            </div>
        </div>
    </form>
</template>
<script setup>
import { FwbButton } from "flowbite-vue";
import FilesComponent from "./FilesComponent.vue";
import { chatDetails } from "../../../../../store/chatStore.js";
import { useRoute } from "vue-router";
import Editor from "../../../../shared/Editor.vue";
import { computed, ref } from "vue";

// import css
import "vue3-emoji-picker/css";
import Emoji from "../../../../shared/Emoji.vue";
import _ from "lodash";

const props = defineProps({
    chatId: null,
});
const chatMessageStore = chatDetails();
const route = useRoute();
const editorRef = ref();

const activeMessage = computed(() => {
    return _.find(chatMessageStore.messages, {
        id: chatMessageStore.reply_to_message_id,
    });
});
const submit = () => {
    const chatId = route.params.chatId ?? props.chatId;
    const form = new FormData();

    form.append("message", JSON.stringify(editorRef.value.editor.getJSON()));

    chatMessageStore.files.forEach((file, index) => {
        form.append(`files[${index}]`, file);
    });

    if (chatMessageStore.reply_to_message_id !== null) {
        form.append("parent_id", chatMessageStore.reply_to_message_id);
    }

    axios.post(`/api/v1/chats/${chatId}/message`, form);

    editorRef.value.editor.commands.setContent("");
    chatMessageStore.resetMessageForm();
    chatMessageStore.setReplyToMessageId(null);
    chatMessageStore.setChatOnTopOfTheList(route.params.chatId);
};

// event callback
function onSelectEmoji(emoji) {
    editorRef.value.editor.commands.insertContent(emoji.i);
}
</script>
