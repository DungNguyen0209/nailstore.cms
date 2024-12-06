import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMasterDataStore = defineStore('masterData', () => {
    const categoryService = ref([]);
    const userInfo = ref(JSON.parse(localStorage.getItem('userInfo')) || {});
    const isLoading = ref(false);
    const isComponentLoading = ref(false);

    function setCategoryService(payload = null) {
        categoryService.value = payload ?? [];
    }

    function setIsLoading(payload = false) {
        isLoading.value = payload;
    }

    function setComponentLoading(payload = false) {
        isComponentLoading.value = payload;
    }

    function setUserInfo(payload = null) {
        const userInfoString = JSON.stringify(payload);
        localStorage.setItem('userInfo', userInfoString);
        userInfo.value = payload ?? [];
    }

    function setScopeUserInfo(scope = null) {
        const userInfoWithScope = { ...userInfo.value, scope };
        console.log(JSON.parse(JSON.stringify(userInfoWithScope)));
        const userInfoString = JSON.stringify(userInfoWithScope);
        localStorage.setItem('userInfo', userInfoString);
        userInfo.value = userInfoWithScope;
    }
        
  
    return {
    categoryService,
    userInfo,
    isLoading,
    isComponentLoading,
    setCategoryService,
    setUserInfo,
    setIsLoading,
    setComponentLoading,
    setScopeUserInfo
    }
  })
  