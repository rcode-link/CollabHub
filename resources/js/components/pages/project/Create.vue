<script setup>
import Text from "../../shared/Text.vue";
import Label from "../../shared/Label.vue";
import Errors from "../../shared/Errors.vue";
import { reactive, ref, watch } from "vue";
import Editor from "../../shared/Editor.vue";
import { FwbButton } from "flowbite-vue";
import { useErrorsStore } from "../../../store/errors";
import { useRouter } from "vue-router";

const globalErrorMessage = ref("");
const errorsStore = useErrorsStore();
const router = useRouter();
const form = reactive({
  name: "",
  key: "",
  image: "",
  description: "",
});

errorsStore.setErrors({}, "");
const submit = () => {
  window.axios
    .post("/api/v1/projects", form)
    .then((response) => {
      router.push({
        name: "project-details",
        params: { project: response.data.id },
      });
    })
    .catch((error) => {
      if (error.response.status === 422) {
        globalErrorMessage.value = error.response.data.message;
        errorsStore.setErrors(error.response.data.errors, "login");
        return;
      }

      globalErrorMessage.value = error.response.data.data;
    });
};

watch(
  () => form.name,
  () => {
    if (form.name === "") {
      form.key = "";
      return;
    }
    if (form.name != null) {
      const name = form.name.match(/\b(\w)/g);
      if (name == null) {
        return;
      }
      form.key = name.join("").toUpperCase();
    }
  },
  {
    deep: true,
  }
);

defineExpose({
  submit,
});
</script>

<template>
  <form @submit.prevent="submit">
    <div>
      <Label :forInput="'name'">Name</Label>
      <Text
        type="text"
        v-model="form.name"
        :name="'name'"
        form="'login'"
        placeholder="Project name"
      />
      <Errors name="name" />
    </div>
    <div>
      <Label :forInput="'key'">Key</Label>
      <Text
        type="text"
        v-model="form.key"
        :name="'key'"
        form="'login'"
        placeholder="Project key"
      />
      <Errors name="key" />
    </div>
    <div>
      <Label :forInput="'key'">Description</Label>
      <Editor v-model="form.description" css-class="input big-input" />
      <Errors name="key" />
    </div>
    <fwb-button hidden="true"></fwb-button>
  </form>
</template>

<style scoped>
</style>
