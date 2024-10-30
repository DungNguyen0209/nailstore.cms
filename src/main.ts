import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import './styles/index.css'
import router from './router'
import 'primeicons/primeicons.css';
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'
import Ripple from 'primevue/ripple';
import StyleClass from 'primevue/styleclass';

const app = createApp(App);
app.directive('ripple', Ripple);
app.directive('styleclass', StyleClass); // Register the StyleClass directive
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            cssLayer: {
                name: 'primevue',
                order: 'tailwind-base, primevue, tailwind-utilities'
            }
        }
    }
 });

app.mount('#app')
