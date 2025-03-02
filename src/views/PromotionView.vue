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
  import VirtualScroller from 'primevue/virtualscroller'
  import Skeleton from 'primevue/skeleton'
  import Promotion from '@/types/Promotion'
  import { getPromotions } from '@/api/promotion'

  const masterData = useMasterDataStore()
  const confirm = useConfirm()
  const { showCommonErrorMessage, showCommonSuccessMessage } = useToastMessage()
  const promotions = ref([new Promotion()])
  const pageSize = ref(10)
  const pageNumber = ref(1)
  onMounted(async () => {
    await getPromotions({
      pageSize: pageSize.value,
      pageNumber: pageNumber.value - 1
    })
      .then((res) => {
        promotions.value = res.data?.map((s) => new Promotion(s)) || []
      })
      .catch((err) => {
        showCommonErrorMessage(err)
      })
  })
  
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain class="h-full flex flex-col relative">
      <SectionTitleLineWithButton
        :icon="mdiCreditCardCheck"
        title="Promotion"
        :buttonIcon="mdiPlus"
        main
      >
      </SectionTitleLineWithButton>
      <div id="main" class="h-full w-full"></div>
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
