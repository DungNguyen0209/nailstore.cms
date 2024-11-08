<template>
    <ConfettiExplosion :particleCount="200" :shouldDestroyAfterDone="true" />
    <div class="js-container container w-full" style="top:0px !important;">
      <div class="flex flex-col items-center justify-center w-screen h-screen bg-pink-100 p-4 md:p-8">
        <header class="text-4xl font-bold text-gray-700 mb-6 text-center">
          <span>NAILS MATE</span>
          <span class="mx-2">|</span>
          <span>LYLY NAILS</span>
          <Vue3Lottie 
            :animationData="successAnimation"
            :autoplay="true"
            :loop="true"
            :speed="1"
            :width="200"
            :height="200"
            ref="anim" />
          <span>{{ account?.fullName }}</span>
          <span>{{ account?.fullName }}</span>
          <span>{{ account?.fullName }}</span>
          <Button @click="backCheckin" icon="pi pi-home" label="Come Back" />
        </header>
      </div>
    </div>
  </template>
  
  <script setup>
  import successAnimation from '@/assets/SuccessAnimation.json';
  import { Vue3Lottie } from 'vue3-lottie'
  import ConfettiExplosion from "vue-confetti-explosion";
  import Account from '@/types/Account';
  import { defineProps } from 'vue';
  import { Button } from 'primevue';
  import { useRouter } from 'vue-router';
  const router = useRouter();
  const props = defineProps({
    account: {
      type: Account,
      required: true
    }
  })
  const backCheckin = () => {
    router.push('/checkin-customer');
  }
  </script>
  
  <style scoped>
  </style>