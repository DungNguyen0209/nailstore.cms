import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
export function useToastMessage() {
  const toast = useToast()
  const confirm = useConfirm()

  const showSuccessCreateService = (item) => {
    toast.add({
      severity: 'success',
      summary: 'Success Create Service',
      group: 'Sccommon',
      life: 3000
    })
  }

  const ShowSuccessMessage = (item) => {
    toast.add({
      severity: 'success',
      summary: 'Success Create Service',
      group: 'Sccommon',
      life: 3000
    })
  }

  const showSuccessUpdateOrder = () => {
    toast.add({
      severity: 'success',
      summary: 'Success Update Order',
      group: 'Sccommon',
      life: 3000
    })
  }

  const showCommonSuccessMessage = (title, description) => {
    toast.add({
      severity: 'success',
      summary: title,
      summary: description,
      group: 'Sccommon',
      life: 3000
    })
  }

  const showFailLogin = (item) => {
    toast.add({ severity: 'warn', summary: 'Login Fail', group: 'bc', life: 3000 })
  }
  const showCommonErrorMessage = (title, description) => {
    toast.add({
      severity: 'error',
      summary: title,
      detail: description,
      group: 'Sccommon',
      life: 3000
    })
  }
  const confirmCreateCheckInCustomer = (accept, reject) => {
    confirm.require({
      message:
        'You do not have any check-in customer. Do you want to create a new check-in customer?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      rejectProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      acceptProps: {
        label: 'Save'
      },
      accept: () => {
        accept()
      },
      reject: () => {
        reject()
      }
    })
  }

  const confirmCreateCheckInFrequentCustomer = (accept, reject) => {
    confirm.require({
      message:
        'Do you want to create order for frequent use ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      rejectProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      acceptProps: {
        label: 'Save'
      },
      accept: () => {
        accept()
      },
      reject: () => {
        reject()
      }
    })
  }

  return {
    showSuccessCreateService,
    showSuccessUpdateOrder,
    showFailLogin,
    confirmCreateCheckInCustomer,
    showCommonErrorMessage,
    showCommonSuccessMessage,
    confirmCreateCheckInFrequentCustomer
  }
}
