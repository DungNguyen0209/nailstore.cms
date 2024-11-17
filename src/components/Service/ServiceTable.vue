<script setup>
import { ref, defineProps } from 'vue'
import { DataTable, InputIcon, IconField, Button, InputText, Column, ConfirmPopup } from 'primevue'
import { useToastMessage } from '@/composables/useToast'
import { useConfirm } from 'primevue/useconfirm'

const confirm = useConfirm()
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

const emit = defineEmits(['changePaging', 'editService', 'deleteService'])

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
    reject: () => { }
  })
}
</script>

<template>
  <DataTable v-model:selection="selectedService" :value="services" dataKey="id" lazy :paginator="true" :rows="pageSize"
    v-bind:total-records="totalRecords" :loading="isloading" @page="onPageChange" frozen scrollable
    :scrollHeight="'calc(48vh)'"
    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
    :rowsPerPageOptions="[5, 10, 25]" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} services">
    <template #header>
      <div class="flex flex-wrap gap-2 items-center justify-between">
        <IconField>
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText placeholder="Search..." />
        </IconField>
      </div>
    </template>
    <Column selectionMode="multiple" :exportable="false"></Column>
    <Column field="name" header="Name"></Column>
    <Column field="price" header="Price">
      <template #body="slotProps">
        {{ formatCurrency(slotProps.data.price) }}
      </template>
    </Column>
    <Column field="categoryName" header="Category"></Column>
    <Column field="description" header="Description"></Column>
    <Column :exportable="false">
      <template #body="slotProps">
        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editProduct(slotProps.data)" />
        <ConfirmPopup group="deleteCategory"></ConfirmPopup>
        <Button icon="pi pi-trash" outlined rounded severity="danger"
          @click="confirmDeleteServie($event, slotProps.data)" />
      </template>
    </Column>
  </DataTable>
</template>
