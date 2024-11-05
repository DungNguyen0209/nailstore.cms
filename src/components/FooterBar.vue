<script setup>
import { containerMaxW } from '@/config.js'
import BaseLevel from '@/components/BaseLevel.vue'
import JustboilLogo from '@/components/JustboilLogo.vue'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="py-2 px-6" :class="containerMaxW">
    <BaseLevel>
      <div class="text-center md:text-left">
        <b>&copy;{{ year }}, <a href="https://justboil.me/" target="_blank"><Lyly class="com"></Lyly></a>.</b>
        <slot />
      </div>
      <div class="md:py-2">
        <a href="https://yourwebsite.com">
          <img src="@/assets/lyly-logo-circle.png" alt="Your Icon" class="w-auto h-10 md:h-6" />
        </a>
      </div>
    </BaseLevel>
  </footer>
</template>
