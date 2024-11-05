import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMasterDataStore = defineStore('masterData', () => {
    const categoryService = ref([]);
    const userInfo = ref(null);

    function setCategoryService(payload = null) {
        categoryService.value = payload ?? [];
    }

    function setUserInfo(payload = null) {
        userInfo.value = payload ?? [];
    }
  
    return {
    categoryService,
    userInfo,
    setCategoryService,
    setUserInfo,
    }
  })
  