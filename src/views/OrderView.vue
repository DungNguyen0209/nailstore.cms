<script setup>
import { mdiMonitorCellphone, mdiTableBorder, mdiTableOff, mdiGithub } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import { onMounted, ref, defineProps } from 'vue'
import { useMasterDataStore } from '@/stores/masterData'
import { useToastMessage } from '@/composables/useToast';
import OrderTable from '@/components/Order/OrderTable.vue'
import Order from '@/types/Order'
import { getOrders } from '@/api/orderApi'
const { showSuccessCreateService, showErrorCommonMessage } = useToastMessage();
const masterData = useMasterDataStore()
const orders = ref([new Order({})])
const pageSize = ref(10)
const currentPage = ref(1)
const totalRecords = ref(0)
const modalCreateActive = ref(false)
const newOrder = ref(new Order({}))

onMounted(async () => {
  refreshNewService()
  await getOrders({pageSize: pageSize.value, pageNumber: currentPage.value})
  .then((response) => {
    totalRecords.value = response.data?.total
    pageSize.value = response.data?.pageSize
    currentPage.value = response.data?.pageNumber
    orders.value = response.data?.orders?.map(orderData => new Order(orderData))
    }).catch(() => {
      showErrorCommonMessage("Error Message", "Can not get orders")
    })
    });

const props = defineProps({
  label: {
    type: [String, Number],
    default: null
  },
})

const refreshNewService = () => {
  newOrder.value = new Order({})
  newOrder.value.createdBy = masterData.userInfo?.id ?? ''
}

const categories = ref([]);
const pageType = ref(1);

async function OpenCreateService(params) {
  if(pageType){
    await getAllCategories()
    .then((response) => {
      console.log(response)
      categories.value = response.data?.map(category => {
        return {
          name: category.label,
          code: category.value
        }
      })
      modalCreateActive.value = true;
    }).catch((exception) => {
      console.log("can not query categories", exception)
    })
  }
}
async function createNewService() {
  await createServiceByAdmin([{
    Name: newService.value.name,
    CategoryId: newService.value.type.code,
    Price: newService.value.price,
    Description: newService.value.description,
    CreatedBy: newService.value.createdBy
  }])
    .then(() => {
      showSuccessCreateService(newService.value);
      refreshNewService();
      modalCreateActive.value = false;
    }).catch(() => {})
}

async function getPagingOrders(params) {
  console.log("getPagingOrders", params)
  await getOrders({pageSize: params.rows, pageNumber: params.page + 1})
  .then((response) => {
    totalRecords.value = response.data?.total
    orders.value = response.data?.orders?.map(orderData => new Order(orderData))
    }).catch(() => {
      showErrorCommonMessage("Error Message", "Can not get orders")
    })
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Orders" main>
      </SectionTitleLineWithButton>
      <NotificationBar color="info" :icon="mdiMonitorCellphone">
        <b>Responsive table.</b> Collapses on mobile
      </NotificationBar>

      <CardBox class="mb-6" has-table>
        <OrderTable :orders="orders" :page-numer="pageSize" :page-size="pageSize" :total-records="totalRecords" @change-paging="getPagingOrders"/>
      </CardBox>

      <!-- <SectionTitleLineWithButton :icon="mdiTableOff" title="Empty variation" /> -->

      <!-- <NotificationBar color="danger" :icon="mdiTableOff">
        <b>Empty table.</b> When there's nothing to show
      </NotificationBar>

      <CardBox>
        <CardBoxComponentEmpty />
      </CardBox> -->
    </SectionMain>
  </LayoutAuthenticated>
</template>
