import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Role } from '@/helpers/constants';
export const useMasterDataStore = defineStore('masterData', () => {
    const categoryService = ref([]);
    const userInfo = ref(JSON.parse(localStorage.getItem('userInfo')) || {});
    const isLoading = ref(false);
    const isComponentLoading = ref(false);
    const isManager = computed(() => {
        return userInfo.value?.scope.some((x) => x === Role.Manager)
      })
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
    isManager,
    setCategoryService,
    setUserInfo,
    setIsLoading,
    setComponentLoading,
    setScopeUserInfo
    }
  })
  