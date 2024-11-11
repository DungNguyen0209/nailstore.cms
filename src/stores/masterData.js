import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMasterDataStore = defineStore('masterData', () => {
    const categoryService = ref([]);
    const userInfo = ref(JSON.parse(localStorage.getItem('userInfo')) || {});
    const isLoading = ref(false);

    function setCategoryService(payload = null) {
        categoryService.value = payload ?? [];
    }

    function setIsLoading(payload = false) {
        isLoading.value = payload;
    }

    function setUserInfo(payload = null) {
        const userInfoString = JSON.stringify(payload);
        localStorage.setItem('userInfo', userInfoString);
        userInfo.value = payload ?? [];
    }
  
    return {
    categoryService,
    userInfo,
    isLoading,
    setCategoryService,
    setUserInfo,
    setIsLoading,
    }
  })
  