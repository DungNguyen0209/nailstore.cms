<script setup>
import { RouterView } from 'vue-router'
import { Toast, ConfirmDialog } from 'primevue';
import ProgressSpinner from 'primevue/progressspinner';
import { useMasterDataStore } from './stores/masterData';

const masterData = useMasterDataStore();
</script>

<template>
  <Toast group="Sccommon" />
  <div class="progress-spinner " v-if="masterData.isLoading" animationDuration=".5s">
    <ProgressSpinner strokeWidth="5" fill="transparent" aria-label="Custom ProgressSpinner" />
  </div>
  <ConfirmDialog></ConfirmDialog>
  <RouterView />
</template>

<style scoped>
.progress-spinner {
    position: fixed;
    z-index: 999;
    width: 50px;
    height: 50px;
    overflow: show;
    margin: auto;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
}

/* Transparent Overlay */
.progress-spinner:before {
  content: '';
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.40);
}
</style>
