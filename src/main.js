import { createApp } from 'vue'
import './assets/style.css'
import App from './App.vue'
import PrimeVue from 'primevue/config';

const app = createApp(App).mount('#app')
app.use(PrimeVue, {
    theme: 'none'
});

