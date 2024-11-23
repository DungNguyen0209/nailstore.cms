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
  Textarea,
  IftaLabel,
  Checkbox,
  Chip
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
  CheckoutOrder,
  getPaymentDetail
} from '@/api/orderApi'
import { useConfirm } from 'primevue/useconfirm'
import { AccountStatus } from '@/helpers/constants'
import { mdiInvoice } from '@mdi/js'
import Drawer from 'primevue/drawer'
import InputNumber from 'primevue/inputnumber'
import { Field, Form as VeeForm, useForm } from 'vee-validate'
import * as yup from 'yup'

const confirm = useConfirm()
const { showErrorCommonMessage, showSuccessUpdateOrder } = useToastMessage()
const orders = ref([new Order({})])
const pageSize = ref(10)
const currentPage = ref(1)
const totalRecords = ref(0)
const newOrder = ref(new Order({}))
const visibleEdit = ref(false)
const reflectSelectedOrder = ref(null)
const paymentDetail = ref(null)
const services = ref(null)
const staffs = ref(null)
const totalPrice = computed((previous) => {
  let val = 0
  if (paymentDetail.value != null) {
    val = paymentDetail.value.serviceWorker.reduce((acc, x) => acc + x.totalPrice, 0)
  }
  if (acceptDiscount.value) {
    return (val - paymentDetail.value.order?.creditPointPrice).toFixed(4)
  }
  return val.toFixed(4)
})

const acceptDiscount = ref(false)

const masterData = useMasterDataStore()

const paymentNote = ref('')

/// Validation
const schema = yup.object({
  price: yup
    .number()
    .required()
    .required('Total price is required')
    .min(0, 'Price must be greater than 0')
})

const { defineField, handleSubmit, resetForm, errors, validate } = useForm({
  validationSchema: schema
})

const [price] = defineField('price')

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
  paymentDetail.value = null
  reflectSelectedOrder.value = null
  if (order.status === OrderStatus.Payment || order.status === OrderStatus.Done) {
    await getOrderPayment(order.id)
      .then(() => {
        visibleEdit.value = true
      })
      .catch(() => {
        showErrorCommonMessage('Error Message', 'Can not get payment detail')
      })
    return
  }
  await getServiceForDropDown().then((resp) => {
    services.value = resp.data?.map((s) => ({
      code: s.id,
      name: s.label,
      price: s.value
    }))
  })

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
            services:
              x.services.map((s) => ({
                code: s.id,
                name: s.name,
                price: s.price
              })) || [],
            totalPrice: x.totalPrice
          })) || []
      }
    })
    .catch(() => {
      showErrorCommonMessage('Error Message', 'Can not get detail order')
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

async function getOrderPayment(id) {
  const resp = await getPaymentDetail(id)
  paymentDetail.value = {
    order: resp.data?.order,
    serviceWorker:
      resp.data?.serviceWorker?.map((x) => ({
        service: {
          code: x.service.id,
          name: x.service.name
        },
        workers: x.workers.map((w) => ({
          code: w.id,
          name: w.fullName
        })),
        totalPrice: x.service.price
      })) || []
  }
}

async function getPagingOrders(params) {
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
  var status =
    reflectSelectedOrder.value.order.status === OrderStatus.Open
      ? OrderStatus.Processing
      : OrderStatus.Payment
  await UpdateOrderStatus(reflectSelectedOrder.value.order.id, status)
    .then(async () => {
      if (status === OrderStatus.Payment) {
        await getOrderPayment(reflectSelectedOrder.value.order.id)
          .then(() => {
            reflectSelectedOrder.value = null
          })
          .catch(() => {
            showErrorCommonMessage('Error Message', 'Can not get payment detail')
            visibleEdit.value = false
          })
      } else {
        reflectSelectedOrder.value.order.status = status
      }
      showSuccessUpdateOrder()
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
      services: x.services.map((s) => ({
        id: s.code,
        price: parseFloat(s.price)
      }))
    }))
  )
    .then(() => {
      showSuccessUpdateOrder()
    })
    .catch(() => {
      showErrorCommonMessage('Error Message', 'Can not update order')
    })
}

async function updateCheckOutOrder() {
  let workerService = getPaymentServiceWorker()
  await updateOrderInfo(
    {
      id: paymentDetail.value.order.id,
      note: paymentNote.value
    },
    workerService
  )
    .then(() => {
      showSuccessUpdateOrder()
    })
    .catch(() => {
      showErrorCommonMessage('Error Message', 'Can not update order')
    })
}

async function getPaymentServiceWorker() {
  return [
    ...new Set(paymentDetail.value.serviceWorker.flatMap((x) => x.workers.map((w) => w.code)))
  ].map((workerId) => ({
    workerId,
    services: paymentDetail.value.serviceWorker
      .filter((x) => x.workers.some((w) => w.code === workerId))
      .map((x) => ({
        id: x.service.code,
        price: parseFloat(x.price)
      }))
  }))
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
  let workerService = getPaymentServiceWorker()
  await updateOrderInfo(
    {
      id: paymentDetail.value.order.id,
      note: paymentNote.value
    },
    workerService
  ).then(async () => {
    await CheckoutOrder(
      paymentDetail.value.order.id,
      parseFloat(totalPrice.value),
      paymentDetail.value.order.creditPoint,
      paymentDetail.value.order.creditPointPrice,
      paymentNote.value
    ).then(() => {
      paymentDetail.value.order.status = OrderStatus.Done
      showSuccessUpdateOrder()
    })
  })
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiInvoice" title="Order" main>
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
      <Drawer
        v-bind:block-scroll="true"
        v-model:visible="visibleEdit"
        position="top"
        style="height: 100%"
        :header="paymentDetail != null ? 'Payment Checkout' : 'Detail Order'"
      >
        <div v-if="paymentDetail != null">
          <VeeForm :validation-schema="schema">
            <div class="flex flex-col sm:flex-row">
              <div class="sm:basis-4/6 w-full">
                <div>
                  <div class="flex flex-col h-screen">
                    <ScrollPanel style="height: 55%">
                      <DataView :value="paymentDetail.serviceWorker">
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
                                            >{{ item.service.name }}</span
                                          >
                                          <div class="grid lg:grid-cols-5 grid-cols-2 gap-4">
                                            <div v-for="worker in item.workers" :key="worker.code">
                                              <Tag severity="secondary" :value="worker.name"></Tag>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="flex flex-col sm:items-end gap-8">
                                        <div class="card flex justify-center">
                                          <InputNumber
                                            v-model="item.totalPrice"
                                            inputId="price_input"
                                            mode="currency"
                                            currency="EUR"
                                            locale="en-US"
                                            variant="filled"
                                            type="price"
                                            :class="{ 'p-invalid': errors.price }"
                                          />
                                          <small id="email-help" class="p-error">{{
                                            errors.email
                                          }}</small>
                                        </div>
                                        <!-- <span class="text-xl font-semibold">€{{ item.totalPrice }}</span> -->
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
                        <span class="text-lg font-semibold">€{{ paymentDetail.order.price }}</span>
                      </div>
                      <div class="flex justify-between items-center mb-3">
                        <span class="text-lg font-semibold">Discount:</span>
                        <span class="text-lg font-semibold"
                          >- €{{ paymentDetail.order.creditPointPrice }}</span
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
                      <span class="text-gray-800 pt-0.5">{{ paymentDetail.order.ownerName }}</span>
                    </div>
                    <div class="flex flex-row w-full ml-4 gap-4">
                      <i class="pi pi-phone content-center font-thin" style="font-size: 1rem"></i>
                      <span class="text-gray-800 pb-0.5 font-thin">{{
                        paymentDetail.order.ownerPhone
                      }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex mt-4">
                  <div class="flex flex-col w-full ml-4 gap-1">
                    <span>Credit point</span>
                    <span class="text-gray-800 font-thin">{{
                      paymentDetail.order.ownerEmail
                    }}</span>
                  </div>
                  <div class="flex flex-col w-full ml-4 gap-1">
                    <span>Check in</span>
                    <span class="text-gray-800 font-thin">{{
                      new Date(paymentDetail.order.createdTime).toLocaleString()
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
                    <span>Credit Point {{ paymentDetail.order.creditPoint > 0 ? 1 : 0 }}</span>
                  </Button>
                  <Button style="width: 50%">
                    <i class="pi pi-wallet"></i>
                    <span>Promotion 0</span>
                  </Button>
                </div>
                <div
                  class="mt-4"
                  v-if="openDiscountCreditTag && paymentDetail.order.creditPoint > 0"
                >
                  <Card class="flex flex-row h-full">
                    <template #content>
                      <Checkbox v-model="acceptDiscount" binary />
                      <label class="dark:text-white ml-4 pt-1"
                        >Credit Point: {{ paymentDetail.order.creditPoint }}
                        € to discount
                        {{ paymentDetail.order.creditPointPrice }}</label
                      >
                    </template>
                  </Card>
                </div>
                <div class="flex justify-center mt-5">
                  <Button
                    severity="info"
                    class="w-full"
                    @click="updateCheckOutOrder"
                    style="border-width: 2px"
                  >
                    Update Order
                  </Button>
                </div>
                <div class="flex justify-center mt-5">
                  <Button
                    :disabled="totalPrice == 0 || paymentDetail.order.status === OrderStatus.Done"
                    severity="info"
                    class="w-full"
                    @click="CheckOut"
                    style="border-width: 2px"
                  >
                    Payment
                  </Button>
                </div>
              </div>
            </div>
          </VeeForm>
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
            <Column field="status" header="Staff" class="w-full sm:w-1/4">
              <template #body="slotProps">
                <FloatLabel class="w-full md:w-56 mt-3">
                  <Select
                    :invalid="isInvalidWorker(slotProps.data.worker.code)"
                    :disabled="disableEdit"
                    id="over_label"
                    v-model="slotProps.data.worker"
                    :options="staffs"
                    optionLabel="name"
                    class="w-full text-sm"
                  />
                  <label class="text-sm" for="over_label">Staff</label>
                </FloatLabel>
              </template>
            </Column>
            <Column field="type" header="Service" class="w-full sm:w-3/4">
              <template #body="slotProps">
                <FloatLabel class="w-full md:w-56 mt-3">
                  <MultiSelect
                    :disabled="disableEdit"
                    v-model="slotProps.data.services"
                    display="chip"
                    :options="services"
                    dataKey="code"
                    id="over_label_service"
                    optionLabel="name"
                    class="w-full"
                  >
                  </MultiSelect>
                  <label class="text-sm" for="over_label_service">Service</label>
                </FloatLabel>
              </template>
            </Column>
            <Column :exportable="false" class="justify-start">
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
      </Drawer>
    </SectionMain>
  </LayoutAuthenticated>
</template>

<style scoped>
.thick-border {
  border-width: 1.5px;
  /* Adjust the value as needed */
}
</style>
