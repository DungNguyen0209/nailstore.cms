<script setup>
  import { ref, defineProps } from 'vue'
  import { DataTable, InputIcon, IconField, Button, InputText, Column, ConfirmPopup } from 'primevue'
  import { useToastMessage } from '@/composables/useToast'
  import { useConfirm } from 'primevue/useconfirm'
  import Skeleton from 'primevue/skeleton'

  const confirm = useConfirm()
  const keyWord = ref('')
  const props = defineProps({
    checkable: Boolean,
    services: {
      type: Array,
      default: []
    },
    totalRecords: Number,
    pageSize: Number,
    isloading: Boolean
  })

  const emit = defineEmits(['changePaging', 'editService', 'deleteService', 'onInputChange'])

  const formatCurrency = (value) => {
    if (value) return '€' + value
    return
  }

  const onPageChange = (event) => {
    emit('changePaging', event)
  }

  const editProduct = (service) => {
    emit('editService', service)
  }

  const inputKeyWord = (value) => {
    emit('onInputChange', value)
  }

  const selectedService = ref(null)

  const confirmDeleteServie = (event, service) => {
    confirm.require({
      target: event.currentTarget,
      message: 'Are you sure you want to delete?',
      icon: 'pi pi-exclamation-triangle',
      group: 'deleteCategory',
      rejectProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      acceptProps: {
        label: 'Save'
      },
      accept: async () => {
        emit('deleteService', service.id)
      },
      reject: () => {}
    })
  }
</script>

<template>
  <DataTable
    v-model:selection="selectedService"
    :value="services"
    dataKey="id"
    lazy
    :paginator="true"
    :rows="pageSize"
    v-bind:total-records="totalRecords"
    @page="onPageChange"
    scrollable
    :scrollHeight="'calc(50vh)'"
    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
    :rowsPerPageOptions="[5, 10, 25]"
    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} services"
  >
    <template #header>
      <div class="flex flex-wrap gap-2 items-center justify-between">
        <IconField class="w-1/2">
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText @value-change="inputKeyWord" v-model="keyWord" placeholder="Search..." />
        </IconField>
      </div>
    </template>
    <Column selectionMode="multiple" :exportable="false"> </Column>
    <Column class="justify-center" field="name" header="Name">
      <template #body="slotProps">
        <template v-if="isloading">
          <Skeleton v-for="n in 10" :key="n" class="mb-2"></Skeleton>
        </template>
        <div v-else class="flex w-full">
          <div class="inline sm:hidden w-1/3">
            <span class="font-bold">Name: </span>
          </div>
          <div class="w-3/4 sm:w-full">
            <span class="w-2/3"> {{ slotProps.data.name }}</span>
          </div>
        </div>
      </template>
    </Column>
    <Column class="justify-center" field="price" header="Price">
      <template #body="slotProps">
        <template v-if="isloading">
          <Skeleton v-for="n in 10" :key="n" class="mb-2"></Skeleton>
        </template>
        <div v-else class="flex w-full">
          <div class="inline sm:hidden w-1/3">
            <span class="font-bold">Price: </span>
          </div>
          <div class="w-3/4 sm:w-full">
            <span class="w-2/3"> {{ formatCurrency(slotProps.data.price) }}</span>
          </div>
        </div>
      </template>
    </Column>
    <Column class="justify-center" field="categoryName" header="Category">
      <template #body="slotProps">
        <template v-if="isloading">
          <Skeleton v-for="n in 10" :key="n" class="mb-2"></Skeleton>
        </template>
        <div v-else class="flex w-full">
          <div class="inline sm:hidden w-1/3">
            <span class="font-bold">Category: </span>
          </div>
          <div class="w-2/3 sm:w-full">
            <span> {{ slotProps.data.categoryName }}</span>
          </div>
        </div>
      </template>
    </Column>
    <Column class="justify-center" field="description" header="Description">
      <template #body="slotProps">
        <template v-if="isloading">
          <Skeleton v-for="n in 10" :key="n" class="mb-2"></Skeleton>
        </template>
        <div v-else class="flex w-full">
          <div class="inline sm:hidden w-1/3">
            <span class="font-bold">Description: </span>
          </div>
          <div class="w-2/3 sm:w-full">
            <span> {{ slotProps.data.description }}</span>
          </div>
        </div>
      </template>
    </Column>
    <Column class="justify-center" :exportable="false">
      <template #body="slotProps">
        <template v-if="isloading">
          <Skeleton v-for="n in 10" :key="n" class="mb-2"></Skeleton>
        </template>
        <div v-else>
          <Button
            icon="pi pi-pencil"
            outlined
            rounded
            class="mr-2"
            @click="editProduct(slotProps.data)"
          />
          <ConfirmPopup group="deleteCategory"></ConfirmPopup>
          <Button
            icon="pi pi-trash"
            outlined
            rounded
            severity="danger"
            @click="confirmDeleteServie($event, slotProps.data)"
          />
        </div>
      </template>
    </Column>
    <template
      #paginatorcontainer="{
        first,
        last,
        page,
        pageCount,
        prevPageCallback,
        nextPageCallback,
        totalRecords
      }"
    >
      <div
        class="flex items-center gap-4 border border-primary bg-transparent rounded-full w-full py-1 px-2 justify-between"
      >
        <Button
          icon="pi pi-chevron-left"
          rounded
          text
          @click="prevPageCallback"
          :disabled="page === 0"
        />
        <div class="text-color font-medium">
          <span class="hidden sm:block"
            >Showing {{ first }} to {{ last }} of {{ totalRecords }}</span
          >
          <span class="block sm:hidden">Page {{ page + 1 }} of {{ pageCount }}</span>
        </div>
        <Button
          icon="pi pi-chevron-right"
          rounded
          text
          @click="nextPageCallback"
          :disabled="page === pageCount - 1"
        />
      </div>
    </template>
  </DataTable>
</template>
