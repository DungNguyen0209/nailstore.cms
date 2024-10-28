<script setup lang="ts">
// Import required packages and hooks
import { ref } from 'vue';
//import { useRouter } from 'vue-router';
import { InputText } from 'primevue/inputtext';
import { Password } from 'primevue/password';
import { Checkbox } from 'primevue/checkbox';
import { Button } from 'primevue/button';

// Define reactive variables
const username = ref('');
const password = ref('');
const rememberAccount = ref(false);

// Router instance for navigation
//const router = useRouter();

// Login function (example functionality)
const login = () => {
  // Handle login logic here
};
</script>

<template>
  <div class="flex flex-col lg:flex-row h-screen">
    <!-- Left side with image and slogan -->
    <div class="bg-cover bg-center lg:w-1/2 h-1/3 lg:h-full login-left">
      <div class="flex items-center justify-center h-full text-white text-center px-8">
        <div>
          <h1 class="text-6xl font-bold">Hơn 25 Năm</h1>
          <p class="text-lg mt-4">Nỗ Lực Vì Tương Lai Của Bạn.</p>
        </div>
      </div>
    </div>

    <!-- Right side with login form -->
    <div class="flex flex-col items-center justify-center lg:w-1/2 h-full px-8">
      <h2 class="text-green-800 text-2xl font-semibold mb-6">DragonX Stonehub</h2>

      <div class="w-full max-w-xs">
        <!-- Username field -->
        <div class="mb-4">
          <label for="username" class="block text-gray-700 font-medium mb-2">Username</label>
          <InputText v-model="username" id="username" class="w-full" placeholder="Username" />
        </div>

        <!-- Password field -->
        <div class="mb-4">
          <label for="password" class="block text-gray-700 font-medium mb-2">Password</label>
          <Password v-model="password" id="password" class="w-full" placeholder="Password" toggleMask />
        </div>

        <!-- Remember account and forgot password -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <Checkbox v-model="rememberAccount" />
            <label for="remember" class="ml-2 text-gray-700">Remember account</label>
          </div>
          <a href="#" class="text-blue-500 text-sm hover:underline">Forgot password?</a>
        </div>

        <!-- Login button -->
        <Button label="Login" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold" @click="login" />
      </div>

      <!-- Footer text -->
      <p class="mt-8 text-gray-500 text-xs">
        Program information<br />
        DRAGON CAPITAL VIETFUND MANAGEMENT (DCVFM)
      </p>
    </div>
  </div>
</template>

<style src="../styles/login.css"></style>
