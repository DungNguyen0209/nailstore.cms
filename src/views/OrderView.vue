<script setup>
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import { onMounted, ref, computed } from 'vue'
import { useMasterDataStore } from '@/stores/masterData'
import { useToastMessage } from '@/composables/useToast';
import OrderTable from '@/components/Order/OrderTable.vue'
import Order from '@/types/Order'
import { Sidebar, Tag, Button, DataTable, Column, Select, FloatLabel, MultiSelect, ConfirmPopup } from 'primevue'
import {getOrderSeverity} from "@/helpers/order";
import { getStaffForDropDown } from '@/api/userApi'
import { getServiceForDropDown } from '@/api/serviceApi'
import { OrderStatus } from '@/helpers/constants'
import { updateOrderInfo, getOrders, getOrderDetail, UpdateOrderStatus } from '@/api/orderApi'
import { useConfirm } from "primevue/useconfirm";
import {AccountStatus} from '@/helpers/constants'
const confirm = useConfirm();
const { showErrorCommonMessage, showSuccessUpdateOrder } = useToastMessage();
const masterData = useMasterDataStore()
const orders = ref([new Order({})])
const pageSize = ref(10)
const currentPage = ref(1)
const totalRecords = ref(0)
const newOrder = ref(new Order({}))
const visibleEdit = ref(false)
const reflectSelectedOrder = ref(null)
const services = ref(null)
const staffs = ref(null)
 
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

const refreshNewService = () => {
  newOrder.value = new Order({})
  newOrder.value.createdBy = masterData.userInfo?.id ?? ''
}

const editOrder = async (order) => {

  await getOrderDetail(order.id)
  .then((resp) =>{
    reflectSelectedOrder.value = {
      order: resp.data?.order,
      workerService: resp.data?.workerService?.map(x => ({
        worker: {
          code: x.worker.id,
          name: x.worker.fullName
        },
        services: x.services.map(s => ({
          code: s.id,
          name: s.name
        }))
      })) || []
    }
  })
  .catch(() => {
      showErrorCommonMessage("Error Message", "Can not get detail order")
    })

    await getServiceForDropDown()
    .then((resp) =>{
      services.value = resp.data?.map(s =>({
        code : s.value, 
        name: s.label
      }))
    })

    await getStaffForDropDown()
    .then((resp) => {
      staffs.value = resp.data?.filter(s => s.value === AccountStatus.Free).map(s => ({
      code: s.id,
      name: s.label
      }))
      if (reflectSelectedOrder.value.workerService != null && reflectSelectedOrder.value.workerService?.length > 0)
      staffs.value.push(...reflectSelectedOrder.value.workerService?.map(x => x.worker))
    })
  visibleEdit.value = true

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
  
const addNewWorkerService = () => {
  reflectSelectedOrder.value.workerService.push({
    worker: {
      code: null,
      name: null
    },
    services: []
  })
}

const confirmDeleteProduct = (item) => {
  const index = reflectSelectedOrder.value.workerService.indexOf(item);
  if (index > -1) {
    reflectSelectedOrder.value.workerService.splice(index, 1);
  }
};

const disableEdit = computed(() => {
  return reflectSelectedOrder.value?.order?.status === OrderStatus.Payment
})

const isInvalidWorker = (worker) => {
  if (worker === null) {
    return true
  }
  return reflectSelectedOrder.value.workerService?.filter(x => x.worker.code === worker.code).length > 1
}


async function UpdateOrderDetailStatus(){
  var status;
  if(reflectSelectedOrder.value.order.status === OrderStatus.Open){
    status = OrderStatus.Processing
  }
  else if(reflectSelectedOrder.value.order.status === OrderStatus.Processing){
    status = OrderStatus.Payment
  }
  await UpdateOrderStatus(reflectSelectedOrder.value.order.id, status)
  .then(() => {
    showSuccessUpdateOrder()
    reflectSelectedOrder.value.order.status = status
  })
  .catch(() => {
    showErrorCommonMessage("Error Message", "Can not update order")
  });
}

async function saveOrderInformation() {
  console.log(reflectSelectedOrder.value.note)
  await updateOrderInfo({

      id: reflectSelectedOrder.value.order.id,
      note: reflectSelectedOrder.value.note,
    },
    reflectSelectedOrder.value.workerService.map(x => ({
      workerId: x.worker.code,
      serviceId: x.services.map(s => s.code)
    }))
  )
  .then(() => {
    showSuccessUpdateOrder( )
    visibleEdit.value = false
  })
  .catch(() => {
    showErrorCommonMessage("Error Message", "Can not update order")
  });
}

const confirmSaveInformation = (event) => {
    confirm.require({
        target: event.currentTarget,
        message: 'Are you sure you want to proceed?',
        icon: 'pi pi-exclamation-triangle',
        group: 'saveOrderDetail',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Save'
        },
        accept: async () => {
          await saveOrderInformation()
        },
        reject: () => {
        }
    });
};
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>     
      <CardBox class="mb-6" has-table>
        <OrderTable :orders="orders" :page-numer="pageSize" :page-size="pageSize" :total-records="totalRecords" @change-paging="getPagingOrders" @edit-order="(order) => editOrder(order)" />
      </CardBox>
      <Sidebar v-model:visible="visibleEdit" header="Detail Order" position="top" style="height: 100%;">
        <div class="gap-4">
          <div class="mb-4">
              <span class="text-lg font-semibold">Họ và tên:</span>
              <span class="ml-2 text-gray-800">{{ reflectSelectedOrder.order.ownerName }}</span>
            </div>
            <div class="mb-4">
              <span class="text-lg font-semibold">Số điện thoại:</span>
              <span class="ml-2 text-gray-800">{{ reflectSelectedOrder.order.ownerPhone }}</span>
            </div>
            <div class="mb-4">
              <span class="text-lg font-semibold">E-Mail:</span>
              <span class="ml-2 text-gray-800">{{ reflectSelectedOrder.order.ownerEmail }}</span>
            </div>
            <div class="flex items-center mb-4">
              <span class="text-lg font-semibold">Trạng thái:</span>
              <Tag :severity="getOrderSeverity(reflectSelectedOrder.order.status)" :value="reflectSelectedOrder.order.status" class="ml-2 text-white py-1 px-3 rounded-full" />
            </div>
            <div class="flex flex-col mb-4">
                <label  class="text-lg font-semibold dark:text-white w-24">Note</label>
                <Textarea :disabled="disableEdit" v-model="reflectSelectedOrder.note" class="flex-auto h-20 dark:bg-slate-800 rounded-md" rows="4" autocomplete="off" />
            </div>
            <div class="flex items-center mb-4 ">
                <Button :disabled="disableEdit" @click="addNewWorkerService" variant="outlined" class="!border-dashed w-full" style="border-width: 2px;">Add new Service</Button>
            </div>
        </div>
        <DataTable 
        :value="reflectSelectedOrder.workerService" class="custom-datatable">
          <Column field="status" header="Staff" style="width: 30%;" class="sm:w-full">
            <template #body="slotProps">
              <FloatLabel class="w-full md:w-56 mt-3">
                <Select :invalid = "isInvalidWorker(slotProps.data.worker.code)" :disabled="disableEdit" inputId="over_label" v-model="slotProps.data.worker" :options="staffs" optionLabel="name" class="w-full text-sm"/>
                <label class="text-sm" for="over_label">Staff</label>
              </FloatLabel>
            </template>
          </Column>
          <Column field="type" header="Service" style="width: 70%;" class="sm:w-full">
            <template #body="slotProps">
              <div class="card flex content-center">
                <MultiSelect :disabled="disableEdit" v-model="slotProps.data.services" display="chip" :options="services" optionLabel="name" placeholder="Select Service"
                    :maxSelectedLabels="3" class="w-full md:w-20rem" />
              </div>
            </template>
          </Column>
          <Column :exportable="false">
          <template #body="slotProps">
              <Button 
              icon="pi pi-trash" 
              outlined 
              rounded 
              :disabled="disableEdit"
              severity="danger" 
              @click="confirmDeleteProduct(slotProps.data)" />
          </template>
        </Column>
        </DataTable>
        <div class="flex justify-start gap-4 mt-4 sticky bottom-0 end-0 w-full p-4 border border-slate-400 bg-white">
          <div class="flex gap-4">
            <ConfirmPopup group="saveOrderDetail"></ConfirmPopup>
            <Button 
            v-if = "reflectSelectedOrder.order.status !== OrderStatus.Payment"
            @click="confirmSaveInformation($event)" style="border-width: 2px;">Save Information</Button>
            <Button 
            v-if = "reflectSelectedOrder.order.status === OrderStatus.Payment" 
            @click="visibleEdit = false" 
            style="border-width: 2px;">CheckOut</Button>
            <Button v-else 
            @click="UpdateOrderDetailStatus" 
            style="border-width: 2px;" >Update Status</Button>
            </div>
        </div>
        </Sidebar>  
    </SectionMain>
  </LayoutAuthenticated>
</template>

<style scoped>
.custom-datatable {
  @apply w-full table-fixed;
}

@media (max-width: 768px) {
  .custom-datatable {
    @apply block overflow-x-auto;
  }

  .custom-datatable .p-datatable-thead > tr > th,
  .custom-datatable .p-datatable-tbody > tr > td {
    @apply align-middle;
  }
}
</style>
