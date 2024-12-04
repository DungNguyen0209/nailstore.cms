import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useMainStore } from '@/stores/main.js'
import PrimeVue from 'primevue/config';
import './css/main.css'
import Aura from '@primevue/themes/aura';
import { updatePreset } from '@primevue/themes'
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import Vue3Lottie from "vue3-lottie";
import 'primeicons/primeicons.css';

// Init Pinia
const pinia = createPinia()

const changePrimaryColor = () => {
  updatePreset({
      semantic: {
          primary: {
              50: '{pink.50}',
              100: '{pink.100}',
              200: '{pink.200}',
              300: '{pink.300}',
              400: '{pink.400}',
              500: '{pink.500}',
              600: '{pink.600}',
              700: '{pink.700}',
              800: '{pink.800}',
              900: '{pink.900}',
              950: '{pink.950}'
          }
      }
  })
}
// Create Vue app
const app = createApp(App)
app.use(Vue3Lottie);
app.use(ConfirmationService);
app.use(PrimeVue, {
  theme: {
      preset: Aura,
      options: {
        darkModeSelector: false || 'none',
    }
  }
})
changePrimaryColor();
app.use(ToastService);
app.use(router).use(pinia).mount('#app')

// Init main store
const mainStore = useMainStore(pinia)

// Fetch sample data
mainStore.fetchSampleClients()
mainStore.fetchSampleHistory()

// Dark mode
// Uncomment, if you'd like to restore persisted darkMode setting, or use `prefers-color-scheme: dark`. Make sure to uncomment localStorage block in src/stores/darkMode.js
// import { useDarkModeStore } from './stores/darkMode'

// const darkModeStore = useDarkModeStore(pinia)

// if (
//   (!localStorage['darkMode'] && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
//   localStorage['darkMode'] === '1'
// ) {
//   darkModeStore.set(true)
// }

// Default title tag
const defaultDocumentTitle = 'Admin One Vue 3 Tailwind'

// Set document title from route meta
router.afterEach((to) => {
  document.title = to.meta?.title
    ? `${to.meta.title} — ${defaultDocumentTitle}`
    : defaultDocumentTitle
})
