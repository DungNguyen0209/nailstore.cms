<script setup>
import { computed, ref, onMounted } from 'vue'
import { useMainStore } from '@/stores/main'
import {
  mdiAccountMultiple,
  mdiCartOutline,
  mdiChartTimelineVariant,

} from '@mdi/js'
import * as chartConfig from '@/components/Charts/chart.config.js'
import SectionMain from '@/components/SectionMain.vue'
import CardBoxWidget from '@/components/CardBoxWidget.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import BaseButton from '@/components/BaseButton.vue'
import CardBoxComponentTitle from '@/components/CardBoxComponentTitle.vue'
import CardBox from '@/components/CardBox.vue'
import backgroundImageSrc from '@/assets/bgwithlogomonogram.jpg';
const chartData = ref(null)

const fillChartData = () => {
  chartData.value = chartConfig.sampleChartData()
}

onMounted(() => {
  fillChartData()
})

const mainStore = useMainStore()

const clientBarItems = computed(() => mainStore.clients.slice(0, 4))

const transactionBarItems = computed(() => mainStore.history)

const backgroundImage = ref(backgroundImageSrc);

</script>

<template>
  <LayoutAuthenticated>
    <SectionMain class="h-full w-full">
        <div class="bg-center bg-contain bg-repeat h-80 w-full" :style="{ backgroundImage: `url(${backgroundImage})` }">
        <!-- Your content here -->
        </div>
    </SectionMain>
  </LayoutAuthenticated>
</template>
