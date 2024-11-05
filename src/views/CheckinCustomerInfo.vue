<template>
    <div class="background-container">
        <CardBox
        bgColor ="bg-pink-100"
        class="cursor-pointer md:w-3/5 lg:w-5/12 md:h-h-3/5 lg:h-3/5 shadow-2xl md:mx-auto"
        is-hoverable>
        <header class="text-2xl font-bold tracking-wider text-gray-900 mb-12 flex justify-center items-center space-x-4">
            <span class="text-xl uppercase tracking-widest">Nails Mate</span>
            <span class="text-xl font-light text-gray-500">|</span>
            <span class="text-xl uppercase tracking-widest">LyLy Nails</span>
        </header>

        <!-- Input fields with border-b style -->   
        <div class="space-y-8 mb-8">
            <FormControl borderless class="bg-pink-100" type="tel" placeholder="Your phone number" />
            <FormControl borderless  class="tel" placeholder="Your name" />
            <BaseButtons class="bg-pink-100 justify-center">
              <BaseButton borderless class="focus:bg-pink-600 focus:ring-0 w-30 rounded-md" label="Check in" color="bg-slate-400" />
              <BaseButton borderless class="focus:bg-pink-600 focus:ring-0 w-30 rounded-md" label="Back" color="bg-slate-400" />
            </BaseButtons>
        </div>

        <!-- Back Button -->
        <div class="mt-6">
            <Button label="Zurück" class="back-button" />
        </div>

        <!-- Footer Text -->
        <footer class="mt-12 text-sm text-gray-500">
            LyLy Nails &copy;2024
        </footer>
        </CardBox>
    </div>
  </template>
  
  <script setup>
import BaseButton from '@/components/BaseButton.vue';
import CardBox from '@/components/CardBox.vue';
import FormControl from '@/components/FormControl.vue';
import BaseButtons from '@/components/BaseButtons.vue';
  // Script content will go here
  </script>
  
  <style scoped>
  .background-container {
    width: 100vw;
    height: 100vh;
    background-image: url('@/assets/bgL-lyly-store.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  </style>