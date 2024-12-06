<script setup>
  import SectionMain from '@/components/SectionMain.vue'
  import CardBox from '@/components/CardBox.vue'
  import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
  import { onMounted, ref, computed, watch } from 'vue'
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
    Checkbox
  } from 'primevue'
  import { getOrderSeverity } from '@/helpers/order'
  import { getStaffForDropDown } from '@/api/userApi'
  import { getServiceForDropDown } from '@/api/serviceApi'
  import { CreditPointType, OrderStatus, Role, sortDirection } from '@/helpers/constants'
  import { CreditPointType, OrderStatus, Role, sortDirection } from '@/helpers/constants'
  import {
    updateOrderInfo,
    getOrders,
    getOrderDetail,
    UpdateOrderStatus,
    CheckoutOrder,
    getPaymentDetail,
    autoAssignOrderForStaff
  } from '@/api/orderApi'
  import { useConfirm } from 'primevue/useconfirm'
  import { mdiInvoice } from '@mdi/js'
  import Drawer from 'primevue/drawer'
  import InputNumber from 'primevue/inputnumber'
  import { Form as VeeForm, useForm } from 'vee-validate'
  import * as yup from 'yup'
  import Bill from '@/types/Bill'
  import Tree from 'primevue/tree'
  import Dialog from 'primevue/dialog'
  import Chip from 'primevue/chip'
  import { updateBill } from '@/api/billApi'

  const confirm = useConfirm()
  const { showCommonErrorMessage, showSuccessUpdateOrder } = useToastMessage()
  const orders = ref([new Order({})])
  const pageSize = ref(10)
  const currentPage = ref(1)
  const sort = ref(sortDirection.Desc)
  const status = ref([OrderStatus.Open, OrderStatus.Processing])
  const totalRecords = ref(0)
  const newOrder = ref(new Order({}))
  const visibleEdit = ref(false)
  const selectedOrder = ref(null)
  const billInfo = ref(null)
  const services = ref([])
  const serviceOption = ref(null)
  const selectedService = ref(new Set())
  const staffs = ref(null)
  const selectedWorkerService = ref(null)
  const expandedKeys = ref({})
  const disabledCheckOut = computed(() => {
    return selectedOrder.value?.order?.status === OrderStatus.Payment
  })

  const isManager = computed(() => {
    return masterData.userInfo?.scope.some((x) => x === Role.Manager)
  })

  const isAllowEidt = (workerId) => {
    return isManager.value || workerId === masterData.userInfo?.accountId
  }

  const isDone = computed(() => {
    return selectedOrder.value?.order?.status === OrderStatus.Done || billInfo.value != null
  })

  const labelByOrderStatus = computed(() => {
    if (selectedOrder.value?.order?.status === OrderStatus.Open) {
      return 'Process'
    } else if (selectedOrder.value?.order?.status === OrderStatus.Processing) {
      return 'Pay'
    } else if (selectedOrder.value?.order?.status === OrderStatus.Payment) {
      return 'Check Out'
    }
    return ''
  })
  const isAllowUpdateOrderStatus = computed(
    () => {
      return (
        selectedOrder.value?.workerService?.length > 0 &&
        selectedOrder.value?.workerService?.some((x) => x.services.length > 0) &&
        selectedOrder.value?.workerService?.some((x) => x.worker.code != null)
      )
    },
    { deep: true, immediate: true }
  )

  const generateExpandedKeys = (nodes) => {
    const keys = {}
    nodes.forEach((node) => {
      keys[node.key] = true
      if (node.children) {
        Object.assign(keys, generateExpandedKeys(node.children))
      }
    })
    return keys
  }

  const rawPrice = computed(() => {
    let val = 0
    if (billInfo.value != null) {
      val = parseFloat(billInfo.value.price) + parseFloat(creditPointBillDiscount.value.discount)
    }
    if (selectedOrder.value != null) {
      val = selectedOrder.value.serviceWorker.reduce((acc, x) => acc + x.totalPrice, 0)
    }
    return val.toFixed(4)
  })

  const totalPrice = computed(() => {
    let val = 0
    if (billInfo.value != null) {
      val = billInfo.value.price
      return val
    }
    val = selectedOrder.value.serviceWorker.reduce((acc, x) => acc + x.totalPrice, 0)
    if (acceptDiscount.value) {
      return (parseFloat(val) - parseFloat(creditPoint.value.discount)).toFixed(4)
    }
    return val.toFixed(4)
  })

  const creditPoint = computed((previous) => {
    if (selectedOrder?.value?.order == null) {
      return
    }
    const availablePoint =
      selectedOrder?.value?.order?.owner?.creditPoints?.find(
        (point) => point.type === CreditPointType.Availabe
      )?.value ?? 0
    const requiredPoint = selectedOrder?.value?.order?.creditPointSetting?.requiredPoints ?? 1
    const price = selectedOrder?.value?.order?.creditPointSetting?.price ?? 0
    const usingPoint = Math.floor(parseInt(availablePoint) / parseInt(requiredPoint))
    return {
      availablePoint: availablePoint,
      usingPoint: usingPoint * requiredPoint,
      price: price,
      discount: (usingPoint * price).toFixed(4)
    }
  })

  const creditPointBillDiscount = computed(() => {
    return {
      usingPoint: billInfo.value.creditPoint,
      discount: billInfo.value.creditPointPrice.toFixed(4),
      isDiscount: billInfo.value.creditPoint > 0
    }
  })

  watch(
    selectedService,
    (newValue) => {
      if (newValue != null && !!services.value.length) {
        var existedServiceId = new Set()
        selectedWorkerService.value.services = services.value?.filter((x) => {
          if (newValue.has(x.code)) {
            existedServiceId.add(x.code)
            return true
          }
          return false
        })
        var newService = services.value.filter((x) => {
          return newValue.has(x.code) && !existedServiceId.has(x.code)
        })
        selectedWorkerService.value.services.push(...newService)
      }
    },
    { immediate: true, deep: true }
  )

  const acceptDiscount = ref(false)

  const masterData = useMasterDataStore()

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

  const isVisibleSelectService = ref(false)
  onMounted(async () => {
    masterData.setIsLoading(true)
    await getDefaultOrders()
    masterData.setIsLoading(false)
  })

  const getDefaultOrders = async (e) => {
    masterData.setComponentLoading(true)
    if (e != null) {
      sort.value = e.sortDirection
      status.value = e.status
    }
    return await getOrders({
      pageSize: pageSize.value,
      pageNumber: currentPage.value,
      sortDirection: sort.value,
      status: status.value
    })
      .then((response) => {
        totalRecords.value = response.data?.total
        pageSize.value = response.data?.pageSize
        currentPage.value = response.data?.pageNumber
        orders.value = response.data?.orders?.map((orderData) => new Order(orderData))
      })
      .catch(() => {
        showCommonErrorMessage('Error Message', 'Can not get orders')
      })
      .finally(() => {
        masterData.setComponentLoading(false)
      })
  }

  const refreshDetailInfor = async () => {
    if (
      ((!!selectedOrder.value || !!billInfo.value) &&
        selectedOrder.value != reflectSelectedOrder.value) ||
      billInfo.value != reflectBill.value
    ) {
      await getDefaultOrders()
    }
    newOrder.value = new Order({})
    billInfo.value = null
    selectedOrder.value = null
    newOrder.value.createdBy = masterData.userInfo?.id ?? ''
    reflectSelectedOrder.value = null
    reflectBill.value = null
  }

  const reflectSelectedOrder = ref(null)
  const reflectBill = ref(null)

  const editOrder = async (order) => {
    billInfo.value = null
    selectedOrder.value = null
    masterData.setIsLoading(true)
    if (order.status === OrderStatus.Done) {
      await getBillInformation(order.id)
        .then(() => {
          visibleEdit.value = true
        })
        .catch(() => {
          showCommonErrorMessage('Error Message', 'Can not get payment detail')
        })
      masterData.setIsLoading(false)
      return
    }
    await getOrderInformation(order.id)
    if (selectedOrder.value.order.status === OrderStatus.Payment) {
      visibleEdit.value = true
      masterData.setIsLoading(false)
      return
    }
    await getServiceForDropDown().then((resp) => {
      serviceOption.value = resp.data?.map((s) => ({
        key: s.id,
        label: s.label,
        checked: false,
        children: s.services
          ?.filter((x) => !!x)
          .map((x) => ({
            type: 'service',
            key: x.id,
            label: x.label,
            data: x.value,
            checked: false
          }))
      }))

      serviceOption.value.forEach((element) => {
        const currentServices =
          element?.children?.map((child) => ({
            code: child.key,
            name: child.label,
            price: child.data
          })) || []
        currentServices.forEach((item) => services.value.push(item))
      })
      services.value = services.value.filter(
        (service, index, self) => self.findIndex((s) => s.code === service.code) === index
      )
      expandedKeys.value = generateExpandedKeys(serviceOption.value)
    })
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
    await getStaffForDropDown(startOfDay.toISOString(), endOfDay.toISOString()).then((resp) => {
      staffs.value =
        resp.data.map((s) => ({
          code: s.id,
          value: s.numberOrder,
          name: s.fullName
        })) || []
      if (selectedOrder.value.workerService != null && selectedOrder.value.workerService?.length > 0)
        staffs.value.push(...selectedOrder.value.workerService?.map((x) => x.worker))
    })
    visibleEdit.value = true
    masterData.setIsLoading(false)
  }

  async function getOrderInformation(id) {
    await getOrderDetail(id)
      .then((resp) => {
        selectedOrder.value = {
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
              totalPrice: parseFloat(x.totalPrice)
            })) || [],
          serviceWorker:
            resp.data?.serviceWorker?.map((x) => ({
              service: {
                code: x.service.id,
                name: x.service.name,
                value: x.service.price
              },
              worker: {
                code: x.worker.id,
                name: x.worker.fullName
              },
              totalPrice: parseFloat(x.service.price)
            })) || [],
          note: resp.data?.order.note
        }
        reflectSelectedOrder.value = { ...selectedOrder.value }
      })
      .catch(() => {
        showCommonErrorMessage('Error Message', 'Can not get detail order')
      })
  }

  async function getBillInformation(id) {
    await getPaymentDetail(id)
      .then((response) => {
        billInfo.value = new Bill(response.data)
        reflectBill.value = { ...billInfo.value }
      })
      .catch(() => {
        visibleEdit.value = false
        showCommonErrorMessage('Error Message', 'Can not get payment detail')
      })
  }

  async function getPagingOrders(params) {
    masterData.setComponentLoading(true)
    await getOrders({
      pageSize: params.rows,
      pageNumber: params.page + 1,
      sortDirection: sort.value,
      status: status.value
    })
      .then((response) => {
        totalRecords.value = response.data?.total
        pageSize.value = response.data?.pageSize
        currentPage.value = response.data?.pageNumber
        pageSize.value = response.data?.pageSize
        currentPage.value = response.data?.pageNumber
        orders.value = response.data?.orders?.map((orderData) => new Order(orderData))
      })
      .catch(() => {
        showCommonErrorMessage('Error Message', 'Can not get orders')
      })
      .finally(() => {
        masterData.setComponentLoading(false)
      })
  }

  const addNewWorkerService = () => {
    selectedOrder.value.workerService.push({
      worker: {
        code: isManager.value ? null : masterData.userInfo.accountId,
        name: isManager.value ? null : masterData.userInfo.fullName
      },
      services: []
    })
  }

  const confirmDeleteProduct = (item) => {
    const index = selectedOrder.value.workerService.indexOf(item)
    if (index > -1) {
      selectedOrder.value.workerService.splice(index, 1)
    }
  }

  const disableEdit = computed(() => {
    return selectedOrder.value?.order?.status === OrderStatus.Payment
  })

  const isInvalidWorker = (worker) => {
    if (worker === null) {
      return true
    }
    return selectedOrder.value.workerService?.filter((x) => x.worker.code === worker.code).length > 1
  }

  async function UpdateOrderDetailStatus() {
    var status =
      selectedOrder.value.order.status === OrderStatus.Open
        ? OrderStatus.Processing
        : OrderStatus.Payment

    await saveOrderInformation(status)
      .then(async () => {
        if (status === OrderStatus.Payment) {
          await getOrderInformation(selectedOrder.value.order.id)
        } else if (status === OrderStatus.Done) {
          selectedOrder.value = null
          getBillInformation(selectedOrder.value.order.id)
        }
      })
      .catch(() => {})
  }

  async function saveOrderInformation(status) {
    return await updateOrderInfo(
      {
        id: selectedOrder.value.order.id,
        status: status ?? selectedOrder.value.order.status,
        note: selectedOrder.value.note
      },
      selectedOrder.value.workerService.map((x) => ({
        workerId: x.worker.code,
        services: x.services.map((s) => ({
          id: s.code,
          price: parseFloat(s.price)
        }))
      }))
    )
      .then(() => {
        selectedOrder.value.order.status = status ?? selectedOrder.value.order.status
        showSuccessUpdateOrder()
      })
      .catch(() => {
        showCommonErrorMessage('Error Message', 'Can not update order')
      })
  }

  async function updatePaymentOrder() {
    await updateOrderInfo(
      {
        id: selectedOrder.value.order.id,
        note: selectedOrder.value.note,
        status: selectedOrder.value.order.status
      },
      getPaymentServiceWorker()
    )
      .then(() => {
        showSuccessUpdateOrder()
      })
      .catch(() => {
        showCommonErrorMessage('Error Message', 'Can not update order')
      })
  }

  async function updateBillInfo() {
    await updateBill({
      id: billInfo.value.id,
      note: billInfo.value.note
    })
      .then(() => {
        showSuccessUpdateOrder()
      })
      .catch(() => {
        showCommonErrorMessage('Error Message', 'Can not update bills')
      })
  }

  function getPaymentServiceWorker() {
    return [...new Set(selectedOrder.value.serviceWorker.map((x) => x.worker.code))].map(
      (workerId) => ({
        workerId,
        services: selectedOrder.value.serviceWorker
          .filter((x) => x.worker.code === workerId)
          .map((x) => ({
            id: x.service.code,
            price: parseFloat(x.totalPrice)
          }))
      })
    )
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
      selectedOrder.value.order.id,
      parseFloat(totalPrice.value),
      creditPoint.value.usingPoint,
      creditPoint.value.discount,
      selectedOrder.value.note,
      selectedOrder.value.serviceWorker.map((x) => ({
        workerId: x.worker.code,
        serviceId: x.service.code,
        price: parseFloat(x.totalPrice)
      }))
    )
      .then(() => {
        showSuccessUpdateOrder()
        selectedOrder.value.order.status = OrderStatus.Done
        visibleEdit.value = false
      })
      .catch(() => {
        showCommonErrorMessage('Error Message', 'Can not check out order')
      })
  }

  function checkServiceOption(option, selectedServices) {
    if (option.children && option.children.length > 0) {
      option.children.forEach((child) => checkServiceOption(child, selectedServices))
    }
    option.checked = selectedServices.some((s) => s.code === option.key)
  }

  const selectService = (selectedItem) => {
    masterData.setIsLoading(true)
    selectedService.value = new Set(selectedItem.services.map((x) => x.code))
    selectedWorkerService.value = selectedItem
    serviceOption.value.forEach((option) => {
      checkServiceOption(option, selectedWorkerService.value.services || [])
    })

    masterData.setIsLoading(false)
    isVisibleSelectService.value = true
  }

  function checkItem(node) {
    if (node.type === 'service' && node.checked) {
      selectedService.value.add(node.key)
    }
    if (node.type === 'service' && !node.checked) {
      selectedService.value.delete(node.key)
    }
  }

  async function autoAssignTask() {
    await autoAssignOrderForStaff(masterData.userInfo.accountId)
      .then(async () => {
        await getDefaultOrders()
          .then(() => {
            showSuccessUpdateOrder()
          })
          .catch(() => {
            showCommonErrorMessage('Error Message', 'Please reload order')
          })
      })
      .catch(() => {
        showCommonErrorMessage('Error Message', 'Can not auto assign order')
      })
  }
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <CardBox class="mb-6" has-table>
        <OrderTable
          :orders="orders"
          :page-numer="pageSize"
          :page-size="pageSize"
          :sort-direction="sort"
          :status="status"
          :total-records="totalRecords"
          :is-loading="masterData.isComponentLoading"
          @reload-orders="(e) => getDefaultOrders(e)"
          @auto-assign="autoAssignTask"
          @change-paging="getPagingOrders"
          @edit-order="(order) => editOrder(order)"
        />
      </CardBox>
      <Drawer
        v-bind:block-scroll="true"
        v-model:visible="visibleEdit"
        position="top"
        style="height: 100%"
        @hide="refreshDetailInfor"
        :header="billInfo != null ? 'Payment Checkout' : 'Detail Order'"
      >
        <div v-if="billInfo != null || selectedOrder.order.status == OrderStatus.Done">
          <VeeForm :validation-schema="schema">
            <div class="flex flex-col sm:flex-row">
              <div class="sm:basis-4/6 w-full">
                <div>
                  <div class="flex flex-col h-screen">
                    <ScrollPanel style="height: 55%">
                      <DataView :value="billInfo.serviceWorker">
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
                                          <div class="flex flex-row">
                                            <a href="#" class="text-sky-500 align-middle">Staff:</a>
                                            <Tag
                                              class="ml-2"
                                              severity="secondary"
                                              :value="item.worker.fullName"
                                            ></Tag>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="flex flex-col sm:items-end gap-8">
                                        <div class="card flex justify-center">
                                          <InputNumber
                                            :minFractionDigits="2"
                                            @click.stop
                                            size="small"
                                            inputId="currency-germany"
                                            mode="currency"
                                            currency="EUR"
                                            disabled
                                            locale="de-DE"
                                            v-model="item.totalPrice"
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
                        <span class="text-lg font-semibold">€{{ rawPrice }}</span>
                      </div>
                      <div
                        class="flex justify-between items-center mb-3"
                        v-show="creditPointBillDiscount.discount > 0"
                      >
                        <span class="text-lg font-semibold">Discount:</span>
                        <span class="text-lg font-semibold"
                          >- €{{ creditPointBillDiscount.discount }}</span
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
                      <span class="text-gray-800 pt-0.5">{{ billInfo.ownerName }}</span>
                    </div>
                    <div class="flex flex-row w-full ml-4 gap-4">
                      <i class="pi pi-phone content-center font-thin" style="font-size: 1rem"></i>
                      <span class="text-gray-800 pb-0.5 font-thin">{{ billInfo.ownerPhone }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex mt-4">
                  <div class="flex flex-col w-full ml-4 gap-1">
                    <span>Gmail</span>
                    <span class="text-gray-800 font-thin">{{ billInfo.ownerEmail }}</span>
                  </div>
                  <div class="flex flex-col w-full ml-4 gap-1">
                    <span>Check in</span>
                    <span class="text-gray-800 font-thin">{{
                      new Date(billInfo.checkInTime).toLocaleString()
                    }}</span>
                  </div>
                </div>
                <div class="flex flex-col mt-4">
                  <label class="text-lg font-semibold dark:text-white w-24">Note</label>
                  <Textarea
                    v-model="billInfo.note"
                    class="flex-auto h-20 dark:bg-slate-800 rounded-md"
                    rows="4"
                    autocomplete="off"
                  />
                </div>
                <div class="flex flex-row justify-center items-center align-middle gap-2 mt-2">
                  <Button style="width: 50%" disabled>
                    <i class="pi pi-credit-card"></i>
                    <span>Credit Point {{ creditPointBillDiscount.discount > 0 ? 1 : 0 }}</span>
                  </Button>
                  <Button style="width: 50%">
                    <i class="pi pi-wallet"></i>
                    <span>Promotion 0</span>
                  </Button>
                </div>
                <div class="mt-4" v-if="creditPointBillDiscount.isDiscount > 0">
                  <Card class="flex flex-row h-full">
                    <template #content>
                      <Checkbox v-model="creditPointBillDiscount.isDiscount" binary />
                      <label class="dark:text-white ml-4 pt-1"
                        >Credit Point: {{ creditPointBillDiscount.usingPoint }}
                        to discount
                        {{ creditPointBillDiscount.discount }} €</label
                      >
                    </template>
                  </Card>
                </div>
                <div class="flex justify-center mt-5">
                  <Button
                    severity="info"
                    class="w-full"
                    :disabled="totalPrice == 0 && !disabledCheckOut"
                    @click="updateBillInfo"
                    style="border-width: 2px"
                  >
                    Update Bill
                  </Button>
                </div>
              </div>
            </div>
          </VeeForm>
        </div>
        <div v-else-if="selectedOrder.order.status === OrderStatus.Payment">
          <VeeForm :validation-schema="schema">
            <div class="flex flex-col sm:flex-row">
              <div class="sm:basis-4/6 w-full">
                <div>
                  <div class="flex flex-col h-screen">
                    <ScrollPanel style="height: 55%">
                      <DataView :value="selectedOrder.serviceWorker">
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
                                        <div class="flex flex-col gap-2">
                                          <span
                                            class="font-medium text-surface-500 dark:text-surface-400 text-sm"
                                            >{{ item.service.name }}</span
                                          >
                                          <Tag severity="secondary" :value="item.worker.name"></Tag>
                                        </div>
                                      </div>
                                      <div class="flex flex-col sm:items-end gap-8">
                                        <div class="card flex justify-center">
                                          <InputNumber
                                            v-model="item.totalPrice"
                                            :disabled="!isAllowEidt(item.worker.code)"
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
                        <span class="text-lg font-semibold">€{{ rawPrice }}</span>
                      </div>
                      <div class="flex justify-between items-center mb-3" v-show="acceptDiscount">
                        <span class="text-lg font-semibold">Discount:</span>
                        <span class="text-lg font-semibold">- €{{ creditPoint.discount }}</span>
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
                        selectedOrder.order.owner.fullName
                      }}</span>
                    </div>
                    <div class="flex flex-row w-full ml-4 gap-4">
                      <i class="pi pi-phone content-center font-thin" style="font-size: 1rem"></i>
                      <span class="text-gray-800 pb-0.5 font-thin">{{
                        selectedOrder.order.owner.phone
                      }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex mt-4">
                  <div class="flex flex-col w-full ml-4 gap-1">
                    <span>Gmail</span>
                    <span class="text-gray-800 font-thin">{{
                      selectedOrder.order.owner.email
                    }}</span>
                  </div>
                  <div class="flex flex-col w-full ml-4 gap-1">
                    <span>Check in</span>
                    <span class="text-gray-800 font-thin">{{
                      new Date(selectedOrder.order.createdTime).toLocaleString()
                    }}</span>
                  </div>
                </div>
                <div class="flex flex-col mt-4">
                  <label class="text-lg font-semibold dark:text-white w-24">Note</label>
                  <Textarea
                    v-model="selectedOrder.order.note"
                    class="flex-auto h-20 dark:bg-slate-800 rounded-md"
                    rows="4"
                    autocomplete="off"
                  />
                </div>
                <div class="flex flex-row justify-center items-center align-middle gap-2 mt-2">
                  <Button style="width: 50%" @click="OpenCreditDiscountTag">
                    <i class="pi pi-credit-card"></i>
                    <span>Credit Point {{ creditPoint.usingPoint > 0 ? 1 : 0 }}</span>
                  </Button>
                  <Button style="width: 50%">
                    <i class="pi pi-wallet"></i>
                    <span>Promotion 0</span>
                  </Button>
                </div>
                <div class="mt-4" v-if="openDiscountCreditTag">
                  <Card class="flex flex-row h-full">
                    <template #content>
                      <Checkbox v-model="acceptDiscount" binary />
                      <label class="dark:text-white ml-4 pt-1"
                        >Credit Point: {{ creditPoint.usingPoint }}
                        to discount
                        {{ creditPoint.discount }} €</label
                      >
                    </template>
                  </Card>
                </div>
                <div class="flex justify-center mt-5">
                  <Button
                    severity="info"
                    class="w-full"
                    :disabled="totalPrice == 0 && !disabledCheckOut"
                    @click="updatePaymentOrder"
                    style="border-width: 2px"
                  >
                    Update Order
                  </Button>
                </div>
                <div class="flex justify-center mt-5">
                  <Button
                    :disabled="totalPrice == 0 && !disabledCheckOut"
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
            <span class="text-lg font-semibold">Full Name:</span>
            <span class="ml-2 text-gray-800">{{ selectedOrder.order.owner.fullName }}</span>
          </div>
          <div class="mb-4">
            <span class="text-lg font-semibold">Phone:</span>
            <span class="ml-2 text-gray-800">{{ selectedOrder.order.owner.phone }}</span>
          </div>
          <div class="mb-4">
            <span class="text-lg font-semibold">E-Mail:</span>
            <span class="ml-2 text-gray-800">{{ selectedOrder.order.owner.email }}</span>
          </div>
          <div class="flex items-center mb-4">
            <span class="text-lg font-semibold">Trạng thái:</span>
            <Tag
              :severity="getOrderSeverity(selectedOrder.order.status)"
              :value="selectedOrder.order.status"
              class="ml-2 text-white py-1 px-3 rounded-full"
            />
          </div>
          <div class="flex flex-col mb-4">
            <label class="text-lg font-semibold dark:text-white w-24">Note</label>
            <Textarea
              :disabled="disableEdit"
              v-model="selectedOrder.note"
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
              style="border-width: 2px; width: 100%"
              icon="pi pi-plus"
            ></Button>
          </div>
          <DataTable :value="selectedOrder.workerService" class="custom-datatable">
            <Column field="status" header="Staff" class="sm:w-1/4">
              <template #body="slotProps">
                <FloatLabel class="w-full md:w-56 mt-3">
                  <Select
                    :invalid="isInvalidWorker(slotProps.data.worker.code)"
                    :disabled="!isManager"
                    id="over_label"
                    v-model="slotProps.data.worker"
                    :style="{
                      '--p-select-disabled-background':
                        slotProps.data.worker.code == masterData.userInfo?.accountId
                          ? 'white'
                          : '#e2e8f0'
                    }"
                    :options="staffs"
                    placeholder="Staff"
                    optionLabel="name"
                    class="w-full text-sm min-h-4"
                  >
                    <template #value="option">
                      <div
                        :style="{
                          color:
                            option.value.code == masterData.userInfo?.accountId ? 'black' : 'gray'
                        }"
                        class="flex flex-row justify-between"
                      >
                        <span class="font-light">{{ option.value.name ?? 'Staff' }}</span>
                        <span class="font-medium">{{ option.value.value }}</span>
                      </div>
                    </template>
                    <template #option="options">
                      <div class="w-full flex flex-row justify-between">
                        <span class="font-light">{{ options.option.name }}</span>
                        <span class="font-medium">{{ options.option.value }}</span>
                      </div>
                    </template>
                  </Select>
                  <label class="text-sm" for="over_label">Staff</label>
                </FloatLabel>
              </template>
            </Column>
            <Column field="type" header="Service" class="sm:w-4/5">
              <template #body="slotProps">
                <Dialog
                  v-model:visible="isVisibleSelectService"
                  modal
                  header="Services"
                  class="w-full h-full"
                >
                  <Tree
                    :value="serviceOption"
                    :filter="true"
                    filterMode="lenient"
                    selectionMode="single"
                    :expandedKeys="expandedKeys"
                    class="w-full md:w-30rem"
                  >
                    <template #default="slotProps">
                      <p class="font-medium">{{ slotProps.node.label }}</p>
                    </template>
                    <template #service="slotProps">
                      <div class="flex flex-row w-full">
                        <Checkbox
                          v-model:model-value="slotProps.node.checked"
                          @change="checkItem(slotProps.node)"
                          binary
                        />
                        <div class="w-full sm:w-4/5 flex flex-col sm:flex-row">
                          <div class="w-full sm:w-9/12 inline-block">
                            <article class="ml-1 text-wrap">
                              <p class="break-words font-light">{{ slotProps.node.label }}</p>
                            </article>
                          </div>
                          <p class="w-full sm:w-3/12 sm:ml-12 font-medium">
                            {{ slotProps.node.data }} €
                          </p>
                        </div>
                      </div>
                    </template>
                  </Tree>
                  <template #footer>
                    <Button label="Save" @click="isVisibleSelectService = false" autofocus />
                  </template>
                </Dialog>
                <div
                  class="bg-white flex min-h-6 flex-wrap w-full hover:cursor-pointer p-3 border rounded-lg border-gray-300"
                  @click="selectService(slotProps.data)"
                  data-text="Input ...."
                >
                  <Chip
                    v-for="service in slotProps.data.services"
                    :key="service.code"
                    class="py-0 pl-0 pr-4 m-1"
                  >
                    <span
                      class="w-1/2 bg-primary text-sm rounded-full flex items-center justify-center"
                      >{{ service.name }}</span
                    >
                    <div class="w-1/2">
                      <InputNumber
                        v-model="service.price"
                        :minFractionDigits="2"
                        @click.stop
                        :disabled="!isAllowEidt(slotProps.data.worker.code)"
                        size="small"
                        inputId="currency-germany"
                        mode="currency"
                        currency="EUR"
                        :min="0"
                        :max="10000"
                        locale="de-DE"
                      />
                    </div>
                  </Chip>
                </div>
              </template>
            </Column>
            <Column :exportable="false" class="justify-center">
              <template #body="slotProps">
                <Button
                  icon="pi pi-trash"
                  outlined
                  rounded
                  class="item-center"
                  :disabled="disableEdit || !isAllowEidt(slotProps.data.worker.code)"
                  :disabled="disableEdit || !isAllowEidt(slotProps.data.worker.code)"
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
              <Button
                icon="pi pi-save"
                label="Save"
                iconPos="right"
                class="align-middle"
                @click="confirmSaveInformation($event)"
                style="border-width: 2px"
              ></Button>
              <Button
                :label="labelByOrderStatus"
                :disabled="!isAllowUpdateOrderStatus"
                iconPos="right"
                class="align-middle"
                icon="pi pi-arrow-circle-right"
                @click="UpdateOrderDetailStatus"
                style="border-width: 2px"
              ></Button>
            </div>
          </div>
        </div>
      </Drawer>
    </SectionMain>
  </LayoutAuthenticated>
</template>

<style scoped>
  :deep(.p-tree-node-label) {
    width: 100%;
  }
  :deep(.p-tree-node-toggle-button) {
    display: none;
  }
  .thick-border {
    border-width: 1.5px;
    /* Adjust the value as needed */
  }
  :deep(.p-inputnumber-input) {
    width: 100%;
  }
  div:empty:not(:focus):before {
    content: attr(data-text);
    color: #999999;
  }
</style>
