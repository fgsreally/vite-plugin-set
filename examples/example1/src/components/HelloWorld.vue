<!-- <script test="aaa" setup>
return 22334;
</script> -->

<!-- <docs>

这谁知道啊
</docs> -->
<script setup>
import { ref } from "vue";

defineProps({
  msg: String,
});
function clickExec(params) {
  console.log(import("./a.js"));
}

const count = ref(2);
</script>

<template>
  <h1>
    {{ msg }}
    <div class="card">
      <button type="button" @click="clickExec">count is {{ count }}</button>
      <p>
        Edit
        <code>components/HelloWorld.vue</code> to test HMR
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
  </h1>
</template>

<style>
.read-the-docs {
  color: red;
}
</style>
