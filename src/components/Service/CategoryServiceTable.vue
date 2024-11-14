<script setup>
import { ref, defineProps } from 'vue'
import { DataTable, InputIcon, IconField, Button, InputText, Column } from 'primevue'
import { useConfirm } from 'primevue/useconfirm'
import { useToastMessage } from '@/composables/useToast'

const confirm = useConfirm()
const props = defineProps({
  checkable: Boolean,
  categories: {
    type: Array,
    default: []
  },
  totalRecords: Number,
  pageSize: Number,
  isloading: Boolean
})
const emit = defineEmits(['changePaging', 'editCategory', 'deleteCategory'])
const selectedService = ref(null)
const onPageChange = (event) => {
  emit('changePaging', event)
}

const editCategory = (category) => {
  emit('editCategory', category)
}

const confirmDeleteServie = (event, category) => {
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
      emit('deleteCategory', category.id)
    },
    reject: () => {}
  })
}
</script>

<template>
  <DataTable
    v-model:selection="selectedService"
    :value="categories"
    dataKey="id"
    :paginator="true"
    lazy
    frozen
    :totalRecords="totalRecords"
    :rows="pageSize"
    :loading="isloading"
    class="w-full"
    @page="onPageChange"
    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
    :rowsPerPageOptions="[5, 10, 25]"
    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} services"
  >
    <template #header>
      <div class="flex flex-wrap gap-2 items-center justify-between">
        <h4 class="m-1">Manage Category</h4>
        <IconField>
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText placeholder="Search..." />
        </IconField>
      </div>
    </template>

    <Column header-class = "sticky! top-0! z-10000" selectionMode="multiple" :exportable="false" class="w-0.5/6"></Column>
    <Column
      header-class = "sticky! top-0! z-10000"
      field="label"
      header="Name"
      class="w-2/6"
      style="word-break: break-word; white-space: normal"
    ></Column>
    <Column
      header-class = "sticky! top-0! z-10000"
      field="value"
      header="Description"
      class="w-3/6"
      style="word-break: break-word; white-space: normal"
    >
      <template #body="slotProps">
        <article class="text-pretty">
          <p>{{ slotProps.data.value }}</p>
        </article>
      </template>
    </Column>
    <Column header-class = "sticky! top-0! z-10000" :exportable="false" class="w-0.5/6">
      <template #body="slotProps">
        <div class="flex flex-row h-full gap-2 content-center align-middle">
          <Button
            icon="pi pi-pencil"
            outlined
            rounded
            class="mb-2"
            @click="editCategory(slotProps.data)"
          />
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
  </DataTable>
</template>
