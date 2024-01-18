<script setup lang="ts">
import { reactive, watch } from "vue";
import { LocalParticipantModel } from "../../../../functions/liveKit";
import { DateTime } from "luxon";
import { toast } from "vue3-toastify";
import { useUserStore } from "../../../../store/user";
import { useRoute } from "vue-router";
//@ts-ignore
import Label from "../../../shared/Label.vue";
//@ts-ignore
import Text from "../../../shared/Text.vue";
//@ts-ignore
import { FwbToggle, FwbButton } from "flowbite-vue";

const model = reactive<LocalParticipantModel>({
  name: null,
  enableMicrophone: true,
  shareScreen: false,
  enableCamera: true,
  token: null,
});

const route = useRoute();
const userState = useUserStore();

const emits = defineEmits<{
  (e: "update", value: LocalParticipantModel): void;
}>();

const load = () => {
  window.axios
    .put(`/api/v1/video-call/${route.params.slug}/join`, {
      name: model.name,
      currentTime: DateTime.now().toISO(),
    })
    .then((token) => {
      model.token = token.data.token;
      emits("update", model);
    })
    .catch((error) => {
      toast.error(error.response.data.message, {
        onClick: () => {
          window.location.href = "/";
        },
      });
    });
};

watch(
  () => userState.user,
  () => {
    model.name = userState.user.name;
  },
  {
    immediate: true,
    deep: true,
  }
);
</script>
<template>
  <div class="z-[60] flex h-screen w-screen justify-center items-center">
    <div class="flex flex-col gap-4 w-72">
      <div>
        <Label> Name </Label>
        <Text v-model="model.name" :disabled="userState.user.id" />
      </div>
      <fwb-toggle v-model="model.enableCamera" label="Enable camera" />
      <fwb-toggle v-model="model.enableMicrophone" label="Enable microphone" />

      <fwb-button @click="load">Start call</fwb-button>
    </div>
  </div>
</template>
