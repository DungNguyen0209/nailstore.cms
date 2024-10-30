<template>
  <SideBar />
  <Menubar >
    <template #start>
        <svg width="35" height="40" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-8">
          <path
            d="M17.5 0C7.835 0 0 7.835 0 17.5C0 27.165 7.835 35 17.5 35C27.165 35 35 27.165 35 17.5C35 7.835 27.165 0 17.5 0ZM17.5 32.5C9.2825 32.5 2.5 25.7175 2.5 17.5C2.5 9.2825 9.2825 2.5 17.5 2.5C25.7175 2.5 32.5 9.2825 32.5 17.5C32.5 25.7175 25.7175 32.5 17.5 32.5ZM17.5 7.5C16.395 7.5 15.5 8.395 15.5 9.5C15.5 10.605 16.395 11.5 17.5 11.5C18.605 11.5 19.5 10.605 19.5 9.5C19.5 8.395 18.605 7.5 17.5 7.5ZM17.5 14C16.395 14 15.5 14.895 15.5 16V26C15.5 27.105 16.395 28 17.5 28C18.605 28 19.5 27.105 19.5 26V16C19.5 14.895 18.605 14 17.5 14Z"
            fill="var(--p-primary-color)"
          />
        </svg>
      </template>
        <template #button>
          <Button icon="pi pi-bars" @click="visible = true" />
        </template>
        <template #end>
          <div class="flex items-center gap-2">
            <InputText placeholder="Search" type="text" class="w-32 sm:w-auto" />
            <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" shape="circle" />
          </div>
        </template>
      </Menubar>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import SideBar from './components/SideBar.vue';
import InputText from 'primevue/inputtext';
import Menubar from 'primevue/menubar';
const visible = ref(false);
const items = ref([
    {
        label: 'Home',
        icon: 'pi pi-home'
    },
    {
        label: 'Projects',
        icon: 'pi pi-search',
        badge: 3,
        items: [
            {
                label: 'Core',
                icon: 'pi pi-bolt',
                shortcut: '⌘+S'
            },
            {
                label: 'Blocks',
                icon: 'pi pi-server',
                shortcut: '⌘+B'
            },
            {
                separator: true
            },
            {
                label: 'UI Kit',
                icon: 'pi pi-pencil',
                shortcut: '⌘+U'
            }
        ]
    }
]);
// No need for the visible ref since the sidebar is always visible
</script>

<style scoped>
/* Add any custom styles here */
</style>