import { useToast } from "primevue/usetoast";
export function useToastMessage() {
    const toast = useToast();
  
    const showSuccessCreateService = (item) => {
        toast.add({ severity: 'success', summary: 'Success Create Service', life: 3000 });
    };
  
    return {
        showSuccessCreateService,
    };
  }