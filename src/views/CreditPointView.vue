<script setup>
  import SectionMain from '@/components/SectionMain.vue'
  import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
  import { computed, onMounted, ref, watch } from 'vue'
  import { useMasterDataStore } from '@/stores/masterData'
  import { useToastMessage } from '@/composables/useToast'
  import { useConfirm } from 'primevue/useconfirm'
  import { mdiCreditCardCheck } from '@mdi/js'
  import { defaultTier, SettingKey } from '@/helpers/constants'
  import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
  import Card from 'primevue/card'
  import InputGroup from 'primevue/inputgroup'
  import InputGroupAddon from 'primevue/inputgroupaddon'
  import BaseMasterData from '@/types/BaseMasterData'
  import { getSettingByName, updateSetting } from '@/api/settingApi'
  import InputNumber from 'primevue/inputnumber'
  import Button from 'primevue/button'
  import { getTierSetting } from '@/api/creditPoint'
  import Tier from '@/types/Tier'
  import InputText from 'primevue/inputtext'
  import IftaLabel from 'primevue/iftalabel'
  import { mdiPlus } from '@mdi/js'
  import { createTier, updateTier } from '@/api/tier'
  import ColorPicker from 'primevue/colorpicker'

  const masterData = useMasterDataStore()
  const confirm = useConfirm()
  const { showCommonErrorMessage, showCommonSuccessMessage } = useToastMessage()
  const tiers = ref([])
  const rawtiers = ref(new Set())
  onMounted(async () => {
    await queryTier()
  })
  async function queryTier() {
    await getTierSetting()
      .then((res) => {
        tiers.value = res.data?.map((item) => new Tier(item))
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

  const addNewTier = () => {
    tiers.value.push(new Tier({}))
  }

  const removeTier = (tier) => {
    if (tier.id == null) {
      const index = tiers.value.indexOf(tier)
      if (index > -1) {
        tiers.value.splice(index, 1)
      }
      return
    }
  }

  const saveTier = async (tier) => {
    if (tier.id == null || tier.id == undefined) {
      await createTier(tier)
        .then(() => {
          console.log('Create tier successfully')
          showCommonSuccessMessage('Success', 'Create tier successfully')
        })
        .catch(() => {
          showCommonErrorMessage('Error', 'Retry again')
        })
    } else {
      await updateTier(tier)
        .then(() => {
          showCommonSuccessMessage('Success', 'Update tier successfully')
        })
        .catch(() => {
          showCommonErrorMessage('Error', 'Retry again')
        })
    }
  }
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain class="h-full flex flex-col relative">
      <SectionTitleLineWithButton
        :icon="mdiCreditCardCheck"
        title="Credit Point"
        :buttonIcon="mdiPlus"
        main
      >
      </SectionTitleLineWithButton>
      <div id="main" class="h-full w-full">
        <div v-for="tier in tiers" :key="tier.id" class="w-full">
          <div class="mb-4 w-full flex flex-col sm:flex-row">
            <Card
              style="overflow: hidden"
              class="w-full sm:w-4/5 content-center hover:shadow-lg hover:transition-all duration-500 cursor-pointer"
            >
              <template #header>
                <IftaLabel class="mt-2">
                  <InputText
                    :disabled="tier.name === defaultTier.New"
                    v-model="tier.name"
                    variant="filled"
                    id="tier"
                    class="input-border-bottom ml-2"
                  />
                  <label for="tier" class="text-primary !important">Tier Name</label>
                </IftaLabel>
              </template>
              <template #content>
                <div v-if="tier.name !== defaultTier.New" class="flex flex-col items-center">
                  <div class="w-full flex flex-col gap-2 sm:flex-row">
                    <div class="flex flex-col w-full sm:w-1/2 sm:justify-center sm:ml-2">
                      <label for="visittime" class="font-semibold w-24">Visit Time</label>
                      <InputText
                        id="visittime"
                        v-model="tier.requiredVisit"
                        class="w-2/3"
                        autocomplete="off"
                      />
                    </div>

                    <div class="flex flex-col w-full sm:w-1/2 sm:justify-center sm:ml-2">
                      <label for="visittime" class="font-semibold">Total Spent</label>
                      <div class="w-2/3">
                        <InputGroup>
                          <InputGroupAddon>$</InputGroupAddon>
                          <InputNumber v-model="tier.requiredTotalSpent" placeholder="Price" />
                          <InputGroupAddon>.00</InputGroupAddon>
                        </InputGroup>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <template #footer>
                <div class="w-full flex flex-row">
                  <div class="w-1/4 flex flex-col">
                    <label for="color" class="font-semibold">Color</label>
                    <ColorPicker v-model="tier.color" id="color" />
                  </div>
                  <div class="w-3/4 flex flex-col items-center gap-2">
                    <div class="w-full flex flex-row justify-between">
                      <div class="w-4/12 flex flex-col h-full">
                        <label for="credit" class="font-semibold h-full item align-bottom mr-2"
                          >Point</label
                        >
                        <InputNumber
                          fluid
                          v-model="tier.creditPointSetting.requiredPoints"
                          id="credit"
                        />
                      </div>
                      <Button class="w-1/12 h-1/2 top-8 font-extrabold" icon="pi pi-equals" text />
                      <div class="w-5/12 flex flex-col h-full">
                        <label for="credit" class="font-semibold h-full item align-bottom mr-2"
                          >Discount</label
                        >
                        <InputGroup>
                          <InputGroupAddon>$</InputGroupAddon>
                          <InputNumber
                            v-model="tier.creditPointSetting.price"
                            placeholder="Price"
                          />
                          <InputGroupAddon>.00</InputGroupAddon>
                        </InputGroup>
                      </div>
                    </div>
                    <IftaLabel class="w-1/2">
                      <InputNumber
                        id="Limit Point"
                        v-model="tier.creditPointSetting.limitPoints"
                        :invalid="
                          tier.creditPointSetting.requiredPoints >
                          tier.creditPointSetting.limitPoints
                        "
                      />
                      <label for="Limit Point">Limit Point</label>
                    </IftaLabel>
                  </div>
                </div>
              </template>
            </Card>
            <div class="flex flex-row gap-3 mt-2 w-full sm:w-1/5 items-center justify-center">
              <Button icon="pi pi-save" @click="() => saveTier(tier)" aria-label="Filter" />
              <Button
                v-if="tier.name !== defaultTier.New"
                @click="() => removeTier(tier)"
                icon="pi pi-trash"
                aria-label="Filter"
              />
            </div>
          </div>
        </div>
        <div class="mt-2">
          <Button label="Add" icon="pi pi-plus" aria-label="Filter" @click="addNewTier" />
        </div>
      </div>
    </SectionMain>
  </LayoutAuthenticated>
</template>

<style scoped>
  ::v-deep .input-border-bottom {
    border-bottom: 2px solid #ccc;
    border-top: none;
    border-left: none;
    border-right: none;
  }
</style>
