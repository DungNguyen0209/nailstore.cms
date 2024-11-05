<template>
    <div class="flex flex-col items-center justify-center h-screen bg-pink-100 p-4 md:p-8">
      <header class="text-2xl font-bold text-gray-700 mb-6 text-center">
        <span>NAILS MATE</span>
        <span class="mx-2">|</span>
        <span>LYLY NAILS</span>
      </header>
  
      <div class="flex flex-col md:flex-row items-center w-full gap-8 max-w-4xl">
        <!-- Points Badge -->
        <div class="bg-gray-800 text-white p-6 md:p-8 rounded-lg flex flex-col items-center shadow-lg transform transition duration-200 hover:-translate-y-1 w-full md:w-1/2">
          <h1 class="font-bold points">{{ points }}</h1>
          <p class="text-lg md:text-xl mt-2 opacity-80">Punkte</p>
          <p class="text-sm md:text-lg mt-1 opacity-80">Entsprechen {{ (points / 40).toFixed(2) }}€</p>
        </div>
  
        <!-- Number Pad -->
        <div class="flex flex-col items-center w-full md:w-1/2">
          <div class="flex">
            <h2 class="text-4xl text-gray-800 mb-4">{{ enteredValue }}</h2>
            <div>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <button
              v-for="num in numbers"
              :key="num"
              @click="addToEnteredValue(num)"
              class="w-16 h-16 text-2xl font-semibold rounded-full bg-pink-200 text-gray-700 shadow-md hover:bg-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition duration-150"
            >
              {{ num }}
            </button>
            <!-- Delete Button -->
            <button
              @click="deleteLast"
              class="w-16 h-16 text-2xl font-semibold rounded-full bg-pink-200 text-gray-700 shadow-md hover:bg-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition duration-150"
              style="grid-column: 1 / span 1; grid-row: 4;"
            >
              ←
            </button>

            <!-- Enter Button -->
            <button
              @click="nextAction"
              class="w-16 h-16 text-2xl font-semibold rounded-full bg-pink-200 text-gray-700 shadow-md hover:bg-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition duration-150"
              style="grid-column: 3 / span 1; grid-row: 4;"
            >
              ✓
            </button>
            <button
              @click="addToEnteredValue(0)"
              class="w-16 h-16 text-2xl font-semibold rounded-full bg-pink-200 text-gray-700 shadow-md hover:bg-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition duration-150"
            >
              0
            </button>
          </div>
        </div>
      </div>
  
      <!-- Footer with Checkbox -->
      <footer class="mt-6 text-sm text-gray-600 text-center max-w-xs">
        <label class="flex items-center space-x-2">
          <input
            type="checkbox"
            v-model="acceptedTerms"
            class="form-checkbox h-5 w-5 text-pink-500 border-gray-300 rounded transition duration-150 focus:ring-pink-400"
          />
          <span>Mit dem Check-in erklären Sie sich mit unserer Datenschutzrichtlinie und den Geschäftsbedingungen des Geschäfts einverstanden.</span>
        </label>
      </footer>
    </div>
  </template>
  
<script setup>
    import { ref } from "vue";
    import BaseIcon from "@/components/BaseIcon.vue";
    import { mdiClose, mdiBackspace as mdiBackspacePath } from "@mdi/js";
    import BaseButton from "@/components/BaseButton.vue";

    const points = ref(400);
    const enteredValue = ref("");
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const acceptedTerms = ref(false);

    const addToEnteredValue = (num) => {
        if (enteredValue.value.length < 15) {
            enteredValue.value += num;
        }
    };

    const deleteLast = () => {
        enteredValue.value = enteredValue.value.slice(0, -1);
    };

    const nextAction = () => {
        // Implement the "Next" action logic here
        alert("Proceeding to the next step!");
    };
</script>
  
  <style scoped>
  .points {
    font-size: calc(2vw + 2rem);
  }
  </style>