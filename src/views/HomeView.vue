<script setup>
import { computed, ref, onMounted } from 'vue'
import { useMainStore } from '@/stores/main'
import {
  mdiAccountMultiple,
  mdiCartOutline,
  mdiChartTimelineVariant,

} from '@mdi/js'
import { getKpiOfStaff } from '@/api/orderApi'
import * as chartConfig from '@/components/Charts/chart.config.js'
import SectionMain from '@/components/SectionMain.vue'
import CardBoxWidget from '@/components/CardBoxWidget.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import BaseButton from '@/components/BaseButton.vue'
import CardBoxComponentTitle from '@/components/CardBoxComponentTitle.vue'
import CardBox from '@/components/CardBox.vue'
import { useRouter } from 'vue-router'
import { Card } from 'primevue'
import { useMasterDataStore } from '@/stores/masterData'

const {userInfo, setIsLoading} = useMasterDataStore()
const totalOrder = ref(0)
const totalPrice = ref(0)
const chartData = ref(null)
const fillChartData = () => {
  chartData.value = chartConfig.sampleChartData()
}

onMounted(async() => {
  setIsLoading(true)
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  await getKpiOfStaff(userInfo.accountId,startOfDay, endOfDay).then((res) => {
    totalOrder.value = res.data.total0rder
    totalPrice.value = res.data.totalPrice.ToFixed(4)
  })
  setIsLoading(false)
  fillChartData()
})


const router = useRouter()


const checkin = async () => {
  router.push('/checkin-customer');
};
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiChartTimelineVariant" title="Overview" main>

      </SectionTitleLineWithButton>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        <CardBoxWidget trend="12%" trend-type="up" color="text-emerald-500" :icon="mdiAccountMultiple" :number="totalOrder"
          label="Clients" />
        <CardBoxWidget trend="12%" trend-type="down" color="text-blue-500" :icon="mdiCartOutline" :number="totalPrice"
          prefix="€" label="Sales" />
        <CardBoxWidget trend="Overflow" trend-type="alert" color="text-red-500" :icon="mdiChartTimelineVariant"
          :number="256" suffix="%" label="Performance" />
      </div>
      <CardBox class="cursor-pointer md:w-8/12 lg:w-9/12 shadow-2xl container mx-auto" is-hoverable
        @click="() => { console.log('CardBox clicked') }">
        <CardBoxComponentTitle class="justify-center" title="Please confirm action">
          <BaseButton :icon="mdiClose" color="whiteDark" small rounded-full />
        </CardBoxComponentTitle>
        <div class="space-y-3 text-center ">
          <p>Click to see in action</p>
        </div>

        <template #footer>
          <BaseButtons class="justify-center">
            <BaseButton label="Check in" color="info" @click="checkin" />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
