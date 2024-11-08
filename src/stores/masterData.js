import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMasterDataStore = defineStore('masterData', () => {
    const categoryService = ref([]);
    const userInfo = ref(JSON.parse(localStorage.getItem('userInfo')) || {});

    function setCategoryService(payload = null) {
        categoryService.value = payload ?? [];
    }

    function setUserInfo(payload = null) {
        const userInfoString = JSON.stringify(payload);
        localStorage.setItem('userInfo', userInfoString);
        userInfo.value = payload ?? [];
    }
  
    return {
    categoryService,
    userInfo,
    setCategoryService,
    setUserInfo,
    }
  })
  