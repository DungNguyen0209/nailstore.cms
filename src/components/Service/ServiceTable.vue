<script setup>
import { watch, ref, defineProps, onMounted } from 'vue'
import { DataTable, InputIcon, IconField, Button, InputText, Column } from 'primevue'

const props = defineProps({
  checkable: Boolean,
  services: {
    type: Array,
    default: []
  },
  currentPage: Number,
  numPages: Number
})

const formatCurrency = (value) => {
    if(value)
        return "€" + value 
    return;
};

const selectedService = ref(null)
</script>

<template>
  <DataTable
      v-model:selection="selectedService"
      :value="services"
      dataKey="id"
      :paginator="true"
      :rows="10"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 25]"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} services"
  >
      <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
              <h4 class="m-1">Manage Service</h4>
              <IconField>
                  <InputIcon>
                      <i class="pi pi-search" />
                  </InputIcon>
                  <InputText placeholder="Search..." />
              </IconField>
          </div>
      </template>

      <Column selectionMode="multiple" :exportable="false"></Column>
      <Column field="name" header="Name" ></Column>
      <Column field="price" header="Price">
          <template #body="slotProps">
              {{ formatCurrency(slotProps.data.price) }}
          </template>
      </Column>
      <Column field="categoryName" header="Category" ></Column>
      <Column field="description" header="Description"></Column>
      <Column :exportable="false">
          <template #body="slotProps">
              <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editProduct(slotProps.data)" />
              <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
          </template>
      </Column>
  </DataTable>
</template>