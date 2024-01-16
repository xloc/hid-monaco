<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as monaco from "monaco-editor";

const editor = ref();
onMounted(() => {
  monaco.editor.create(editor.value, {
    value: 'function x() {\n\tconsole.log("Hello world!");\n}',
    language: "javascript",
    automaticLayout: true,
  });
});
</script>

<template>
  <div class="h-screen flex items-stretch w-full">
    <div class="w-14 bg-stone-300"></div>
    <div ref="editor" class="flex-1"></div>
  </div>
</template>