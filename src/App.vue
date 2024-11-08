<script setup>
import { RouterView } from 'vue-router'
import { Toast, ConfirmDialog } from 'primevue';
</script>

<template>
  <Toast group="Sccommon" />
  <ConfirmDialog></ConfirmDialog>
  <RouterView />
</template>
