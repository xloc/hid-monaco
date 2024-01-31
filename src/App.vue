<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as monaco from "monaco-editor";
import { HIDDescriptorProvider } from "./hid-parser/provider";
import example from "./example.txt?raw";
import { hidDescriptorMonarchSyntax } from './hid-parser/monarch-syntax';


const editor = ref();

let dispose = () => { };
onMounted(() => {
  const provider = new HIDDescriptorProvider();
  monaco.languages.register({ id: "hid-descriptor" });
  const disposers = [
    monaco.languages.registerDocumentFormattingEditProvider("hid-descriptor", provider),
    monaco.languages.registerHoverProvider("hid-descriptor", provider),
    monaco.languages.setMonarchTokensProvider("hid-descriptor", hidDescriptorMonarchSyntax),
  ]
  dispose = () => disposers.forEach((d) => d.dispose());

  monaco.editor.create(editor.value, {
    value: example,
    language: "hid-descriptor",
    automaticLayout: true,
  });

  format();
});

onUnmounted(() => {
  dispose();
  dispose = () => { };
});

const format = () => {
  const editor = monaco.editor.getEditors()[0];
  editor.trigger('userButton', 'editor.action.formatDocument', {});
};
</script>

<template>
  <div class="h-screen flex items-stretch w-full">
    <div class="w-14 bg-stone-300 flex-none flex flex-col gap-1">
      <button class="aspect-square text-xs bg-white bg-opacity-60 hover:bg-opacity-80"
        @click="format()">Format</button>
    </div>
    <div ref="editor" class="flex-1"></div>
  </div>
</template>