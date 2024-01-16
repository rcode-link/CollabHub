<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import Text from "../shared/Text.vue";
import { useErrorsStore } from "../../store/errors";
import Errors from "../shared/Errors.vue";
import { useRoute, useRouter } from "vue-router";
import Card from "../shared/Card.vue";
import Label from "../shared/Label.vue";
import Button from "../shared/Button.vue";
import DangerAlert from "../shared/DangerAlert.vue";
import { FwbCheckbox, FwbToggle } from "flowbite-vue";

const router = useRouter();
const route = useRoute();
const errorsStore = useErrorsStore();
const globalErrorMessage = ref("");
const form = reactive({
  email: null,
  password: null,
});

onMounted(() => {
  if (localStorage.getItem("token")) {
    router.push({
      name: "home",
    });
  }
});

const register = () => {
  errorsStore.setErrors({});
  axios
    .post("/api/v1/register", {
      ...form,
      id: route.query.id,
    })
    .then(() => {
      router.push("/login");
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
</script>

<template>
  <div class="flex h-screen justify-center items-center">
    <div class="w-full">
      <Card class="max-w-lg m-auto">
        <form @submit.prevent="register" class="w-full grid gap-6">
          <h2 class="text-3xl font-bold">Register</h2>
          <DangerAlert v-if="globalErrorMessage !== ''">
            {{ globalErrorMessage }}
          </DangerAlert>
          <div>
            <Label :forInput="'email'">Email</Label>
            <Text
              type="text"
              v-model="form.email"
              id="email"
              :name="'email'"
              form="'login'"
              placeholder="Email"
            />
            <Errors name="email" />
          </div>
          <div>
            <Label :forInput="'fullName'">Full Name</Label>
            <Text
              type="text"
              v-model="form.name"
              id="fullName"
              :name="'name'"
              form="'login'"
              placeholder="Full Name"
            />
            <Errors name="name" />
          </div>
          <div>
            <Label :forInput="'password'">Password</Label>
            <Text
              type="password"
              v-model="form.password"
              :name="'password'"
              id="password"
              form="'login'"
              placeholder="New Password"
            />
            <Errors name="password" />
            <ul class="mt-2">
              <li>
                <fwb-checkbox
                  label="Min 8. characters"
                  disabled
                  :model-value="form.password?.length >= 8"
                />
              </li>
              <li>
                <fwb-checkbox
                  label="At least one uppercase letter"
                  disabled
                  :model-value="/[A-Z]/.test(form.password)"
                />
              </li>
              <li>
                <fwb-checkbox
                  label="At least one numeric character"
                  disabled
                  :model-value="/[0-9]/.test(form.password)"
                />
              </li>
              <li>
                <fwb-checkbox
                  label="At least one special character (@$!%*#?_&)"
                  disabled
                  :model-value="/[@$!%*#?_&]/.test(form.password)"
                />
              </li>
            </ul>
          </div>
          <div>
            <Label :forInput="'password_confirmation'">Confirm Password</Label>
            <Text
              type="password"
              v-model="form.password_confirmation"
              id="password_confirmation"
              :name="'password_confirmation'"
              form="'login'"
              placeholder="Confirm Password"
            />
            <Errors name="password_confirmation" />
          </div>

          <div class="card-actions justify-end">
            <Button type="submit" class="btn btn-primary">Register</Button>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>

<style scoped>
</style>
