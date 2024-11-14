<script setup>
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import { onMounted, ref, computed } from 'vue'
import { useMasterDataStore } from '@/stores/masterData'
import { useToastMessage } from '@/composables/useToast'
import OrderTable from '@/components/Order/OrderTable.vue'
import Order from '@/types/Order'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import {
  Sidebar,
  Tag,
  Button,
  DataTable,
  Column,
  Select,
  FloatLabel,
  MultiSelect,
  ConfirmPopup,
  Card,
  DataView,
  ScrollPanel,
  Checkbox
} from 'primevue'
import { getOrderSeverity } from '@/helpers/order'
import { getStaffForDropDown } from '@/api/userApi'
import { getServiceForDropDown } from '@/api/serviceApi'
import { OrderStatus } from '@/helpers/constants'
import {
  updateOrderInfo,
  getOrders,
  getOrderDetail,
  UpdateOrderStatus,
  CheckoutOrder
} from '@/api/orderApi'
import { useConfirm } from 'primevue/useconfirm'
import { AccountStatus } from '@/helpers/constants'
import { mdiInvoiceListOutline } from '@mdi/js'

const confirm = useConfirm()
const { showErrorCommonMessage, showSuccessUpdateOrder } = useToastMessage()
const orders = ref([new Order({})])
const pageSize = ref(10)
const currentPage = ref(1)
const totalRecords = ref(0)
const newOrder = ref(new Order({}))
const visibleEdit = ref(false)
const reflectSelectedOrder = ref(null)
const services = ref(null)
const staffs = ref(null)
const servicePrice = ref(null)
const totalPrice = computed((previous) => {
  if (acceptDiscount.value) {
    return (
      reflectSelectedOrder.value.order?.price - reflectSelectedOrder.value.order?.creditPointPrice
    ).toFixed(4)
  }

  return reflectSelectedOrder.value.order?.price
})
const acceptDiscount = ref(false)

const masterData = useMasterDataStore()

const paymentNote = ref('')
onMounted(async () => {
  masterData.setIsLoading(true)
  refreshNewService()
  await getOrders({ pageSize: pageSize.value, pageNumber: currentPage.value })
    .then((response) => {
      totalRecords.value = response.data?.total
      pageSize.value = response.data?.pageSize
      currentPage.value = response.data?.pageNumber
      orders.value = response.data?.orders?.map((orderData) => new Order(orderData))
      masterData.setIsLoading(false)
    })
    .catch(() => {
      masterData.setIsLoading(false)
      showErrorCommonMessage('Error Message', 'Can not get orders')
    })
})

const refreshNewService = () => {
  newOrder.value = new Order({})
  newOrder.value.createdBy = masterData.userInfo?.id ?? ''
}

const editOrder = async (order) => {
  await getOrderDetail(order.id)
    .then((resp) => {
      reflectSelectedOrder.value = {
        order: resp.data?.order,
        workerService:
          resp.data?.workerService?.map((x) => ({
            worker: {
              code: x.worker.id,
              name: x.worker.fullName
            },
            services: x.services.map((s) => ({
              code: s.id,
              name: s.name
            })),
            totalPrice: x.totalPrice
          })) || []
      }
    })
    .catch(() => {
      showErrorCommonMessage('Error Message', 'Can not get detail order')
    })

  await getServiceForDropDown().then((resp) => {
    servicePrice.value = resp.data?.map((s) => ({
      code: s.id,
      name: s.label,
      value: s.value
    }))
    services.value = resp.data?.map((s) => ({
      code: s.id,
      name: s.label
    }))
  })

  await getStaffForDropDown().then((resp) => {
    staffs.value =
      resp.data
        ?.filter((s) => s.value === AccountStatus.Free)
        .map((s) => ({
          code: s.id,
          name: s.label
        })) || []
    if (
      reflectSelectedOrder.value.workerService != null &&
      reflectSelectedOrder.value.workerService?.length > 0
    )
      staffs.value.push(...reflectSelectedOrder.value.workerService?.map((x) => x.worker))
  })
  visibleEdit.value = true
}

async function getPagingOrders(params) {
  console.log('getPagingOrders', params)
  await getOrders({ pageSize: params.rows, pageNumber: params.page + 1 })
    .then((response) => {
      totalRecords.value = response.data?.total
      orders.value = response.data?.orders?.map((orderData) => new Order(orderData))
    })
    .catch(() => {
      showErrorCommonMessage('Error Message', 'Can not get orders')
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
  const index = reflectSelectedOrder.value.workerService.indexOf(item)
  if (index > -1) {
    reflectSelectedOrder.value.workerService.splice(index, 1)
  }
}

const disableEdit = computed(() => {
  return reflectSelectedOrder.value?.order?.status === OrderStatus.Payment
})

const isInvalidWorker = (worker) => {
  if (worker === null) {
    return true
  }
  return (
    reflectSelectedOrder.value.workerService?.filter((x) => x.worker.code === worker.code).length >
    1
  )
}

async function UpdateOrderDetailStatus() {
  var status
  if (reflectSelectedOrder.value.order.status === OrderStatus.Open) {
    status = OrderStatus.Processing
  } else if (reflectSelectedOrder.value.order.status === OrderStatus.Processing) {
    status = OrderStatus.Payment
  }
  await UpdateOrderStatus(reflectSelectedOrder.value.order.id, status)
    .then(() => {
      showSuccessUpdateOrder()
      reflectSelectedOrder.value.order.status = status
    })
    .catch(() => {
      showErrorCommonMessage('Error Message', 'Can not update order')
    })
}

async function saveOrderInformation() {
  await updateOrderInfo(
    {
      id: reflectSelectedOrder.value.order.id,
      note: reflectSelectedOrder.value.note
    },
    reflectSelectedOrder.value.workerService.map((x) => ({
      workerId: x.worker.code,
      serviceId: x.services.map((s) => s.code)
    }))
  )
    .then(() => {
      showSuccessUpdateOrder()
      visibleEdit.value = false
    })
    .catch(() => {
      showErrorCommonMessage('Error Message', 'Can not update order')
    })
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
    reject: () => {}
  })
}

const openDiscountCreditTag = ref(false)

const OpenCreditDiscountTag = () => {
  openDiscountCreditTag.value = !openDiscountCreditTag.value
}

const CheckOut = async () => {
  await CheckoutOrder(
    reflectSelectedOrder.value.order.id,
    totalPrice.value,
    reflectSelectedOrder.value.order.creditPoint,
    reflectSelectedOrder.value.order.creditPointPrice,
    paymentNote.value
  ).then(() => {
    showSuccessUpdateOrder()
  })
}

const isPayment = computed(() => {
  return (
    reflectSelectedOrder.value?.order?.status === OrderStatus.Payment ||
    reflectSelectedOrder.value?.order?.status === OrderStatus.Done
  )
})
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Order" main>
      </SectionTitleLineWithButton>
      <CardBox class="mb-6" has-table>
        <OrderTable
          :orders="orders"
          :page-numer="pageSize"
          :page-size="pageSize"
          :total-records="totalRecords"
          @change-paging="getPagingOrders"
          @edit-order="(order) => editOrder(order)"
        />
      </CardBox>
      <Sidebar
        v-bind:block-scroll="true"
        v-model:visible="visibleEdit"
        position="top"
        style="height: 100%"
        :header="isPayment ? 'Payment Checkout' : 'Detail Order'"
      >
        <div v-if="isPayment">
          <div class="flex flex-col sm:flex-row">
            <div class="sm:basis-4/6 w-full">
              <div>
                <div class="flex flex-col h-screen">
                  <ScrollPanel style="height: 55%">
                    <DataView :value="reflectSelectedOrder.workerService">
                      <template #list="slotProps">
                        <div class="flex flex-col">
                          <div
                            v-for="(item, index) in slotProps.items"
                            :key="index"
                            class="gap-4 mb-2"
                          >
                            <Card class="contrast-15 thick-border">
                              <template #content>
                                <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                                  <div
                                    class="flex flex-col sm:flex-row justify-between sm:items-center flex-1 gap-6"
                                  >
                                    <div
                                      class="flex flex-row sm:flex-col justify-between items-start gap-2"
                                    >
                                      <div>
                                        <span
                                          class="font-medium text-surface-500 dark:text-surface-400 text-sm"
                                          >{{ item.worker.name }}</span
                                        >
                                        <div class="grid lg:grid-cols-5 grid-cols-2 gap-4">
                                          <div v-for="service in item.services" :key="service.code">
                                            <Tag severity="secondary" :value="service.name"></Tag>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div class="flex flex-col sm:items-end gap-8">
                                      <span class="text-xl font-semibold"
                                        >€{{ item.totalPrice }}</span
                                      >
                                    </div>
                                  </div>
                                </div>
                              </template>
                            </Card>
                          </div>
                        </div>
                      </template>
                    </DataView>
                  </ScrollPanel>
                  <div
                    class="flex flex-col p-4 border-t border-surface-200 rounded-md bg-slate-100"
                    style="height: 35%"
                  >
                    <div class="flex justify-between items-center mb-3">
                      <span class="text-lg font-semibold">Price:</span>
                      <span class="text-lg font-semibold"
                        >€{{ reflectSelectedOrder.order.price }}</span
                      >
                    </div>
                    <div class="flex justify-between items-center mb-3">
                      <span class="text-lg font-semibold">Discount:</span>
                      <span class="text-lg font-semibold"
                        >- €{{ reflectSelectedOrder.order.creditPointPrice }}</span
                      >
                    </div>
                    <div class="flex mt-auto justify-between items-center">
                      <span class="text-lg font-semibold">Total Price:</span>
                      <span class="text-lg font-semibold">€{{ totalPrice }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-col sm:basis-2/6 w-full sm:ml-4">
              <div class="flex flex-row">
                <i class="pi pi-user" style="font-size: 3.5rem"></i>
                <div class="flex flex-col">
                  <div class="flex flex-row w-full ml-4 gap-4">
                    <span class="text-lg font-semibold">Full name:</span>
                    <span class="text-gray-800 pt-0.5">{{
                      reflectSelectedOrder.order.ownerName
                    }}</span>
                  </div>
                  <div class="flex flex-row w-full ml-4 gap-4">
                    <i class="pi pi-phone content-center font-thin" style="font-size: 1rem"></i>
                    <span class="text-gray-800 pb-0.5 font-thin">{{
                      reflectSelectedOrder.order.ownerPhone
                    }}</span>
                  </div>
                </div>
              </div>
              <div class="flex mt-4">
                <div class="flex flex-col w-full ml-4 gap-1">
                  <span>Credit point</span>
                  <span class="text-gray-800 font-thin">{{
                    reflectSelectedOrder.order.ownerEmail
                  }}</span>
                </div>
                <div class="flex flex-col w-full ml-4 gap-1">
                  <span>Check in</span>
                  <span class="text-gray-800 font-thin">{{
                    new Date(reflectSelectedOrder.order.createdTime).toLocaleString()
                  }}</span>
                </div>
              </div>
              <div class="flex flex-col mt-4">
                <label class="text-lg font-semibold dark:text-white w-24">Note</label>
                <Textarea
                  v-model="paymentNote"
                  class="flex-auto h-20 dark:bg-slate-800 rounded-md"
                  rows="4"
                  autocomplete="off"
                />
              </div>
              <div class="flex flex-row justify-center items-center align-middle gap-2 mt-2">
                <Button style="width: 50%" @click="OpenCreditDiscountTag">
                  <i class="pi pi-credit-card"></i>
                  <span>Credit Point {{ reflectSelectedOrder.order.creditPoint > 0 ? 1 : 0 }}</span>
                </Button>
                <Button style="width: 50%">
                  <i class="pi pi-wallet"></i>
                  <span>Promotion 0</span>
                </Button>
              </div>
              <div
                class="mt-4"
                v-if="openDiscountCreditTag && reflectSelectedOrder.order.creditPoint > 0"
              >
                <Card class="flex flex-row h-full">
                  <template #content>
                    <Checkbox v-model="acceptDiscount" binary />
                    <label class="dark:text-white ml-4 pt-1"
                      >Credit Point: {{ reflectSelectedOrder.order.creditPoint }} € to discount
                      {{ reflectSelectedOrder.order.creditPointPrice }}</label
                    >
                  </template>
                </Card>
              </div>
              <div class="flex justify-center mt-5">
                <Button
                  :disabled="
                    totalPrice == 0 || reflectSelectedOrder.order.status === OrderStatus.Done
                  "
                  severity="info"
                  class="w-full"
                  @click="CheckOut"
                  style="border-width: 2px"
                  >Payment</Button
                >
              </div>
            </div>
          </div>
        </div>
        <div class="gap-4" v-else>
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
            <Tag
              :severity="getOrderSeverity(reflectSelectedOrder.order.status)"
              :value="reflectSelectedOrder.order.status"
              class="ml-2 text-white py-1 px-3 rounded-full"
            />
          </div>
          <div class="flex flex-col mb-4">
            <label class="text-lg font-semibold dark:text-white w-24">Note</label>
            <Textarea
              :disabled="disableEdit"
              v-model="reflectSelectedOrder.note"
              class="flex-auto h-20 dark:bg-slate-800 rounded-md"
              rows="4"
              autocomplete="off"
            />
          </div>
          <div class="flex items-center mb-4">
            <Button
              :disabled="disableEdit"
              @click="addNewWorkerService"
              variant="outlined"
              class="!border-dashed w-full"
              style="border-width: 2px"
              >Add new Service</Button
            >
          </div>
          <DataTable :value="reflectSelectedOrder.workerService" class="custom-datatable">
            <Column field="status" header="Staff" style="width: 30%" class="sm:w-full">
              <template #body="slotProps">
                <FloatLabel class="w-full md:w-56 mt-3">
                  <Select
                    :invalid="isInvalidWorker(slotProps.data.worker.code)"
                    :disabled="disableEdit"
                    inputId="over_label"
                    v-model="slotProps.data.worker"
                    :options="staffs"
                    optionLabel="name"
                    class="w-full text-sm"
                  />
                  <label class="text-sm" for="over_label">Staff</label>
                </FloatLabel>
              </template>
            </Column>
            <Column field="type" header="Service" style="width: 70%" class="sm:w-full">
              <template #body="slotProps">
                <div class="card flex content-center">
                  <MultiSelect
                    :disabled="disableEdit"
                    v-model="slotProps.data.services"
                    display="chip"
                    :options="services"
                    optionLabel="name"
                    placeholder="Select Service"
                    :maxSelectedLabels="3"
                    class="w-full md:w-20rem"
                  />
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
                  @click="confirmDeleteProduct(slotProps.data)"
                />
              </template>
            </Column>
          </DataTable>
          <div
            class="flex justify-start gap-4 mt-4 sticky bottom-0 end-0 w-full p-4 border border-slate-400 bg-white"
          >
            <div class="flex gap-4">
              <ConfirmPopup group="saveOrderDetail"></ConfirmPopup>
              <Button @click="confirmSaveInformation($event)" style="border-width: 2px"
                >Save Information</Button
              >
              <Button @click="UpdateOrderDetailStatus" style="border-width: 2px"
                >Update Status</Button
              >
            </div>
          </div>
        </div>
      </Sidebar>
    </SectionMain>
  </LayoutAuthenticated>
</template>

<style scoped>
.thick-border {
  border-width: 1.5px;
  /* Adjust the value as needed */
}
</style>
