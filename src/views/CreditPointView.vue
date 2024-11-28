<script setup>
import SectionMain from '@/components/SectionMain.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useMasterDataStore } from '@/stores/masterData'
import { useToastMessage } from '@/composables/useToast'
import { useConfirm } from 'primevue/useconfirm'
import { mdiCreditCardCheck } from '@mdi/js'
import { SettingKey } from '@/helpers/constants'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import Card from 'primevue/card'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import BaseMasterData from '@/types/BaseMasterData'
import { getSettingByName, updateSetting } from '@/api/settingApi'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import { getTierSetting } from '@/api/creditPoint'

const masterData = useMasterDataStore()
const confirm = useConfirm()
const { showCommonErrorMessage, showCommonSuccessMessage } = useToastMessage()

const isEditInVisible = computed(() => {
  return currentCreditPoint.value === creditPoint.value.value
})

onMounted(async () => {
  await queryCreditPoint()
})
async function queryCreditPoint() {
  await getTierSetting()
    .then((res) => {
      creditPoint.value.value = res.data?.value
    })
    .catch((error) => {
      showCommonErrorMessage('Error', 'Retry again')
    })
}

const confirmSaveInformation = () => {
  confirm.require({
    message: `Are you sure you want to save new CreditPoint = ${creditPoint.value.value}?`,
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined',
    rejectLabel: 'Cancel',
    acceptLabel: 'Save',
    accept: async () => {
      await updateCreditPoint()
    },
    reject: () => {
      toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 })
    }
  })
}

async function updateCreditPoint() {
  masterData.setIsLoading(true)
  await updateSetting({
    value: creditPoint.value.value,
    name: SettingKey.CreditPoint
  })
    .then((res) => {
      showCommonSuccessMessage('Success', 'Update credit point successfully')
    })
    .catch((error) => {
      showCommonErrorMessage('Error', 'Retry again')
    })
    .finally(() => {
      masterData.setIsLoading(false)
    })
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain class="h-full flex flex-col relative">
      <SectionTitleLineWithButton :icon="mdiCreditCardCheck" title="Credit Point" main>
      </SectionTitleLineWithButton>
      <div class="flex justify-center items-center h-full">
        <div class="w-1/2">
          <Card style="overflow: hidden" class="w-full content-center">
            <template #content>
              
            </template>
          </Card>
        </div>
      </div>
    </SectionMain>
  </LayoutAuthenticated>
</template>

<style scoped></style>
