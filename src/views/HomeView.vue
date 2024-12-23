<script setup>
  import { computed, ref, onMounted } from 'vue'
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
  import { getStaffForDropDown } from '@/api/userApi'
  import Select from 'primevue/select'
  import FloatLabel from 'primevue/floatlabel'
  import DatePicker from 'primevue/datepicker'
  const { userInfo, setIsLoading, isManager } = useMasterDataStore()
  const totalOrder = ref(0)
  const totalPrice = ref(0)
  const chartData = ref(null)
  const fillChartData = () => {
    chartData.value = chartConfig.sampleChartData()
  }
  const fromDate = ref(new Date())
  const toDate = ref(new Date())
  const startOfDay = computed(() => new Date(fromDate.value?.setHours(0, 0, 0, 0)))
  const endOfDay = computed(() => new Date(toDate.value?.setHours(23, 59, 59, 999)))
  const staffs = ref([])
  const selectedStaff = ref(null)
  onMounted(async () => {
    setIsLoading(true)
    await getStaffForDropDown(startOfDay.value.toISOString(), endOfDay.value.toISOString()).then(
      (resp) => {
        staffs.value =
          resp.data.map((s) => ({
            code: s.id,
            value: s.numberOrder,
            name: s.fullName
          })) || []
      }
    )
    await queryKpi()
  })

  async function queryKpi() {
    setIsLoading(true)
    await getKpiOfStaff(
      isManager ? selectedStaff.value : userInfo.accountId,
      startOfDay.value,
      endOfDay.value
    )
      .then((res) => {
        totalOrder.value = res.data.total0rder
        totalPrice.value = parseFloat(res.data.totalPrice ?? 0).toFixed(4)
      })
      .finally(() => {
        setIsLoading(false)
        fillChartData()
      })
  }

  const router = useRouter()

  const checkin = async () => {
    router.push('/checkin-customer')
  }
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiChartTimelineVariant" title="Overview" main>
      </SectionTitleLineWithButton>
      <div class="my-5 mt-5">
        <div
          v-if="isManager"
          class="w-full gap-5 flex flex-row"
          style="--p-floatlabel-font-weight: 400"
        >
          <div class="w-full sm:w-1/5">
            <FloatLabel>
              <Select
                v-model="selectedStaff"
                :options="staffs"
                showClear
                optionLabel="name"
                optionValue="code"
                @change="queryKpi"
                inputId="over_label_staff"
                class="w-full"
              />
              <label class="font-light" for="over_label_staff">Staff</label>
            </FloatLabel>
          </div>
          <FloatLabel>
            <DatePicker
              v-model="fromDate"
              inputId="toDate"
              showIcon
              @update:modelValue="queryKpi"
              iconDisplay="input"
              variant="filled"
            />
            <label class="font-light" for="toDate">From Date</label>
          </FloatLabel>
          <FloatLabel>
            <DatePicker
              v-model="toDate"
              inputId="toDate"
              showIcon
              @update:modelValue="queryKpi"
              iconDisplay="input"
              variant="filled"
            />
            <label class="font-light" for="toDate">To Date</label>
          </FloatLabel>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        <CardBoxWidget
          trend="12%"
          trend-type="up"
          color="text-emerald-500"
          :icon="mdiAccountMultiple"
          :number="totalOrder"
          label="Clients"
        />
        <CardBoxWidget
          trend="12%"
          trend-type="down"
          color="text-blue-500"
          :icon="mdiCartOutline"
          :number="totalPrice"
          prefix="€"
          label="Sales"
        />
        <CardBoxWidget
          trend="Overflow"
          trend-type="alert"
          color="text-red-500"
          :icon="mdiChartTimelineVariant"
          :number="256"
          suffix="%"
          label="Performance"
        />
      </div>
      <CardBox
        class="cursor-pointer md:w-8/12 lg:w-9/12 shadow-2xl container mx-auto"
        is-hoverable
        @click="
          () => {
            console.log('CardBox clicked')
          }
        "
      >
        <CardBoxComponentTitle class="justify-center" title="Please confirm action">
          <BaseButton :icon="mdiClose" color="whiteDark" small rounded-full />
        </CardBoxComponentTitle>
        <div class="space-y-3 text-center">
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
