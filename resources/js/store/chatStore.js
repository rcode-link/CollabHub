import { defineStore } from "pinia";
import _ from "lodash";

const NOT_FOUND_IN_ARRAY = -1;
export const chatDetails = defineStore("chatDetails", {
  state: () => ({
    message: "",
    files: [],
    messages: [],
    videoCallToken: "",
    previousDate: null,
    reply_to_message_id: null,
    activeChat: {},
    selectedMessage: null,
    chatList: [],
  }),
  actions: {
    setSelectedMessage(index) {
     this.selectedMessage = index;
    },
    setChatList(list) {
      this.chatList = list;
    },
    setChatOnTopOfTheList(id) {
      const chat = _.find(this.chatList, (obj) => {
        return obj.id === Number(id);
      });

      if (!chat) {
        return;
      }

      this.chatList = this.chatList.filter((obj) => {
        return obj.id !== Number(id);
      });
      this.chatList.unshift(chat);
    },
    updateChatListMessage(data) {
      const index = _.findIndex(this.chatList, {
        id: _.toNumber(data.chatId),
      });

      if (index === NOT_FOUND_IN_ARRAY) {
        return;
      }

      const item = this.chatList[index];

      item.message = data.message;
      item.unreadMessages = data.unreadMessages;
      this.chatList.splice(index, 1, item);
    },
    updateUnreadMessages(data) {
      const index = _.findIndex(this.chatList, {
        id: _.toNumber(data.id),
      });
      if (index === NOT_FOUND_IN_ARRAY) {
        return;
      }
      const item = this.chatList[index];

      item.unreadMessages = data.number_of_unread_messages_count;
      this.chatList.splice(index, 1, item);
    },
    setReplyToMessageId(id) {
      this.reply_to_message_id = id;
    },
    setPreviousDate(date) {
      this.previousDate = date;
    },
    addFiles(value) {
      this.files.push(...value);
    },
    setVideoCallToken(token) {
      this.videoCallToken = token;
    },
    removeFile(index) {
      this.files.splice(index, 1);
    },
    addMessage(messages) {
      this.messages.push(messages);
    },
    addMessages(messages) {
      const reversed = _.reverse(messages);
      if (this.messages.length === 0) {
        this.messages = reversed;
      } else {
        this.messages.unshift(...messages);
      }
    },
    updateMessage(message) {
      const index = _.findIndex(this.messages, {
        id: _.toNumber(message.id),
      });
      if (index === NOT_FOUND_IN_ARRAY) {
        return;
      }
      this.messages.splice(index, 1, message);
    },
    deleteMessage(message) {
      const index = _.findIndex(this.messages, {
        id: _.toNumber(message.id),
      });
      if (index === NOT_FOUND_IN_ARRAY) {
        return;
      }
      this.messages.splice(index, 1);
      this.messages = this.messages.filter(
        (obj) => obj.id !== message.id
      );
    },
    resetMessages() {
      this.messages = [];
    },
    setActiveChat(chatData) {
      this.activeChat = chatData;
    },
    resetMessageForm() {
      this.message = "";
      this.files = [];
    },
  },
});
