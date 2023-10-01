<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { sleep } from "../utilities";
import { useExclusiveOperation } from "../composables/useExclusiveOperation";

defineProps<{ msg: string }>();

const processing = ref(false);
const count = ref(0);

const { doOperation } = useExclusiveOperation(5000, "count");

async function countImmediately() {
  doOperation(
    "count",
    () => {
      count.value = count.value + 1;
    },
    () => console.log("immediate count canceled"),
  );
}

async function countSlowly() {
  processing.value = true;
  await nextTick();
  await doOperation(
    "count",
    async () => {
      await sleep(3000);
      count.value = count.value + 1;
      await sleep(3000);
      processing.value = false;
    },
    () => console.log("slow count canceled"),
  );
  await nextTick();
}
</script>

<template>
  <div>
    <h1>{{ msg }}</h1>
    <button type="button" @click="countImmediately">Immediate Count</button>
    <button type="button" @click="countSlowly">Slow Count</button>

    <div class="card">
      <p>
        {{ (processing ? "Processing " : "Done ") + count }}
      </p>
    </div>

    <p>
      Check out
      <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
        >create-vue</a
      >, the official Vue + Vite starter
    </p>
    <p>
      Install
      <a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>
      in your IDE for a better DX
    </p>
    <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
