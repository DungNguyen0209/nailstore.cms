<template>
  <div class="card">
    <DataView
      :value="orders"
      :layout="layout"
      paginator
      lazy
      :totalRecords="totalRecords"
      :rows="pageNumer"
      @page="onPageChange"
    >
      <template #header>
        <div class="flex gap-2 flex-col sm:flex-row">
          <!-- <SelectButton v-model="layout" :options="options" :allowEmpty="false">
                        <template #option="{ option }">
                            <i :class="[option === 'list' ? 'pi pi-bars' : 'pi pi-table']" />
                        </template>
                    </SelectButton> -->
          <div class="border-gray-400 w-full flex flex-col sm:flex-row">
            <Button
              icon="pi pi-filter-fill"
              text
              rounded
              severity="secondary"
              @click="() => changeDirection()"
            />
            <Transition>
              <div v-show="enableFilter" class="flex flex-col sm:flex-row gap-2">
                <MultiSelect
                  v-model="selectedStatus"
                  :options="statusOptions"
                  @update:modelValue="emitReload"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full sm:w-48"
                  placeholder="Status"
                />
                <div
                  @click="
                    () => {
                      isSortDesc = !isSortDesc
                      emitReload()
                    }
                  "
                  class="flex hover: cursor-pointer bg-slate-200 hover:bg-slate-500 active:bg-slate-500 focus:outline-none focus:ring focus:ring-slate-300 flex-row rounded-lg items-center justify-center p-1 border-zinc-300 border"
                >
                  <span class="text-sm font-semibold">Time</span>
                  <i
                    v-if="isSortDesc"
                    class="pi pi-sort-amount-down-alt ml-3"
                    style="color: black; font-size: 1rem"
                  ></i>
                  <i
                    v-else
                    class="pi pi-sort-amount-up-alt ml-3"
                    style="color: black; font-size: 1rem"
                  ></i>
                </div>
              </div>
            </Transition>
          </div>
          <div class="w-full flex gap-2 justify-end">
            <Button
              icon="pi pi-download"
              label="Auto Asign"
              aria-label="Filter"
              class="p-button-sm justify-end"
              @click="emit('autoAssign')"
              :disabled="disableAutoAsssign"
            ></Button>
            <Button
              icon="pi pi-refresh"
              aria-label="Filter"
              class="p-button-sm justify-end"
              @click="emitReload"
            />
          </div>
        </div>
      </template>
      <template #grid="slotProps">
        <div v-if="isLoading" class="grid grid-cols-12 gap-4">
          <div v-for="i in 6" :key="i" class="col-span-12 sm:col-span-6 xl:col-span-4 p-2">
            <div
              class="p-6 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <Skeleton width="6rem" height="2rem" />
                <Skeleton width="3rem" height="1rem" />
              </div>
              <div class="flex flex-col items-center gap-4 py-8">
                <Skeleton width="75%" height="10rem" />
                <Skeleton width="8rem" height="2rem" />
                <Skeleton width="6rem" height="1rem" />
              </div>
              <div class="flex items-center justify-between">
                <Skeleton width="4rem" height="2rem" />
                <Skeleton width="6rem" height="1rem" shape="circle" size="3rem" />
              </div>
            </div>
          </div>
        </div>
        <div v-else class="grid grid-cols-12 gap-4">
          <div
            v-for="(item, index) in slotProps.items"
            :key="index"
            class="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-4 p-2"
          >
            <div
              class="relative overflow-hidden p-6 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded flex flex-col hover:cursor-pointer"
              @click="editOrder(item)"
            >
              <div class="w-1/5 bg-surface-100 p-1" style="border-radius: 30px">
                <div
                  class="bg-surface-0 flex items-center gap-2 justify-center py-1 px-2"
                  style="
                    border-radius: 30px;
                    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04),
                      0px 1px 2px 0px rgba(0, 0, 0, 0.06);
                  "
                >
                  <i
                    v-if="item.status == OrderStatus.Open"
                    class="pi pi-star-fill text-yellow-500"
                  ></i>
                </div>
              </div>
              <Tag
                :value="item?.owner?.tier?.label"
                :style="{
                  '--tag-bg-color': `#${item?.owner?.tier?.value}`,
                  '--p-tag-font-weight': 400
                }"
                class="absolute transform rotate-45 custom-tag text-center font-light !important py-1 right-[-36px] top-[32px] w-[170px]"
              >
              </Tag>
              <div class="pt-3">
                <div class="flex flex-row">
                  <div class="w-full">
                    <div class="flex flex-row w-full h-fit">
                      <h class="w-3/4 font-bold text-2xl text-lime-600 dark:text-surface-400">{{
                        item.owner?.fullName
                      }}</h>
                    </div>
                    <div class="flex flex-row">
                      <i class="pi pi-phone content-center"></i>
                      <div class="ml-2 spac text-lg mt-1">{{ item.owner?.phone }}</div>
                    </div>
                    <div class="flex flex-row mt-3 gap-2">
                      <span class="text-sm font-semibold">Check In:</span>
                      <span class="text-sm">{{ item.createdTime }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col gap-6 mt-6">
                  <span class="text-2xl font-semibold">{{ getPrice(item.price) }}</span>
                  <div class="flex gap-2">
                    <div class="bg-surface-50 flex justify-center rounded w-4/5">
                      <Tag
                        :value="item.status"
                        :severity="getOrderSeverity(item.status)"
                        class="w-full"
                      ></Tag>
                    </div>
                    <Button class="w-1/5" icon="pi pi-heart" outlined></Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </DataView>
  </div>
</template>

<script setup>
  import { OrderStatus, sortDirection } from '@/helpers/constants'
  import { ref, computed, defineProps } from 'vue'
  import { Button, Tag, SelectButton, DataView } from 'primevue'
  import Order from '@/types/Order'
  import { getOrderSeverity } from '@/helpers/order'
  import Skeleton from 'primevue/skeleton'
  import Menubar from 'primevue/menubar'
  import MultiSelect from 'primevue/multiselect'

  const props = defineProps({
    orders: {
      type: Array,
      default: [new Order({})]
    },
    sortDirection: {
      type: String,
      default: sortDirection.Desc
    },
    status: {
      type: Array,
      default: [OrderStatus.Open, OrderStatus.Processing]
    },
    pageSize: {
      type: Number,
      default: 10
    },
    pageNumer: {
      type: Number,
      default: 1
    },
    totalRecords: {
      type: Number,
      default: 1
    },
    currentPage: {
      type: Number,
      default: 1
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  })

  const enableFilter = ref(false)
  const isSortDesc = ref(true)
  const changeDirection = () => {
    enableFilter.value = !enableFilter.value
  }

  const statusOptions = [
    { label: OrderStatus.Open, value: OrderStatus.Open },
    { label: OrderStatus.Processing, value: OrderStatus.Processing },
    { label: OrderStatus.Payment, value: OrderStatus.Payment },
    { label: OrderStatus.Done, value: OrderStatus.Done }
  ]

  const selectedStatus = ref(props.status)

  const disableAutoAsssign = computed(() => {
    return props.orders.filter((order) => order.status == OrderStatus.Open).length > 0
  })
  const emit = defineEmits(['changePaging', 'editOrder', 'reloadOrders', 'autoAssign'])

  const layout = ref('grid')

  const getPrice = (order) => {
    if (order != null && order.bill != null) {
      return '€ ' + order.bill.price
    }
    return ''
  }

  const onPageChange = (event) => {
    emit('changePaging', event)
  }
  const editOrder = (slotProps) => {
    emit('editOrder', slotProps)
  }
  const emitReload = () => {
    console.log('emitReload', {
      status: selectedStatus.value,
      sortDirection: isSortDesc.value ? sortDirection.Desc : sortDirection.Asc
    })
    emit('reloadOrders', {
      status: selectedStatus.value,
      sortDirection: isSortDesc.value ? sortDirection.Desc : sortDirection.Asc
    })
  }
</script>

<style scoped>
  :deep(.custom-tag) {
    background: var(--tag-bg-color) !important;
    color: white !important;
  }
  .v-enter-active,
  .v-leave-active {
    transition: opacity 0.5s ease;
  }

  .v-enter-from,
  .v-leave-to {
    opacity: 0;
  }
</style>
