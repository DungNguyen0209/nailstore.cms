<template>
  <DataTable
    :expandedRows="expandedRows"
    @update:expandedRows="(val) => (expandedRows = val)"
    @row-expand="onRowExpand"
    @row-collapse="onRowCollapse"
    :value="bills?.data"
    dataKey="id"
    :loading="isLoading"
    scrollable
    tableStyle="min-width: 30rem"
    class="custom-datatable"
  >
    <template #header>
      <div class="flex flex-wrap gap-2 items-center justify-between">
        <IconField>
          <InputIcon>
            <i class="pi pi-euro ml-6" />
          </InputIcon>
          <span> {{ bills?.totalPrice }}</span>
        </IconField>
      </div>
    </template>
    <Column expander style="width: 5rem" />
    <Column field="CreatedTime" header="Check in ">
      <template #body="slotProps">
        {{ new Date(slotProps.data.createdTime).toLocaleString() }}
      </template>
    </Column>
    <Column field="price" header="Price"> </Column>
    <Column field="discount" header="Discount"></Column>
    <Column field="creditPoint" header="CreditPoint"></Column>
    <template #expansion="slotProps">
      <div class="p-4">
        <DataTable :value="slotProps.data.serviceWorker" headerClass="bg-primary">
          <Column field="service" header="Service">
            <template #body="slotProps">
              <div class="inline-block">
                <article class="ml-1 text-wrap">
                  <p class="break-words font-light">
                    {{ slotProps.data.service?.name }}
                  </p>
                </article>
              </div>
            </template>
          </Column>
          <Column field="workers" header="Worker" class="w-2/5">
            <template #body="slotProps">
              <div class="flex flex-wrap gap-1">
                <Tag severity="success" :value="slotProps.data.worker?.fullName" />
              </div>
            </template>
          </Column>
          <Column field="amount" header="Amount" class="w-1/5">
            <template #body="slotProps">
              <IconField>
                <InputIcon>
                  <i class="pi pi-euro ml-2" />
                </InputIcon>
                <span> {{ slotProps.data.totalPrice }}</span>
              </IconField>
            </template>
          </Column>
        </DataTable>
      </div>
      <div class="flex flex-row w-full">
        <Textarea
          v-model="slotProps.data.note"
          class="flex-auto h-20 dark:bg-slate-800 rounded-md w-4/5"
          rows="4"
          autocomplete="off"
        />
        <div class="w-1/5 flex items-center justify-center">
          <Button
            @click="() => updateBillInfo(slotProps.data.id, slotProps.data.note)"
            icon="pi pi-save"
            aria-label="Filter"
          />
        </div>
      </div>
    </template>
  </DataTable>
</template>

<script setup>
  import { ref, computed, defineProps, defineEmits } from 'vue'
  import { useMasterDataStore } from '@/stores/masterData'
  import DataTable from 'primevue/datatable'
  import Column from 'primevue/column'
  import IconField from 'primevue/iconfield'
  import InputIcon from 'primevue/inputicon'
  import Textarea from 'primevue/textarea'
  import Button from 'primevue/button'

  const masterData = useMasterDataStore()
  const props = defineProps({
    bills: {
      type: Object,
      default: {
        data: [],
        totalPrice: 0
      }
    },
    expandedRows: {
      type: Array,
      default: []
    }
  })
  const isLoading = computed(() => masterData.isComponentLoading)
  const emit = defineEmits(['updateNote'])

  const onRowExpand = (event) => {
    props.expandedRows.value[event.data.id] = true
  }

  const onRowCollapse = (event) => {
    delete expandedRows.value[event.data.id]
  }
  const updateBillInfo = (id, note) => {
    emit('updateNote', { id, note })
  }
</script>

<style scoped>
  :deep(.custom-tag) {
    background: var(--tag-bg-color) !important;
    color: white !important;
  }

  .thick-border {
    border-width: 1.5px;
    /* Adjust the value as needed */
  }

  :deep(.custom-datatable > .p-datatable-table-container > .p-datatable-table > .p-datatable-thead),
  :deep(
      .custom-datatable
        > .p-datatable-table-container
        > .p-virtualscroller
        > .p-datatable-table
        > .p-datatable-thead
    ) {
    display: table-header-group !important;
    background: var(--p-datatable-header-cell-background) !important;
  }

  :deep(
      .custom-datatable
        .p-datatable-scrollable
        > .p-datatable-table-container
        > .p-datatable-table
        > .p-datatable-tbody
    ) {
    display: table-row-group !important;
  }

  :deep(
      .custom-datatable
        .p-datatable-table-container
        table.p-datatable-table.p-datatable-scrollable-table
        thead.p-datatable-thead
        tr
    ),
  :deep(
      .custom-datatable
        .p-datatable-table-container
        table.p-datatable-table.p-datatable-scrollable-table
        tbody.p-datatable-tbody
        tr
    ) {
    display: table-row !important;
    border-bottom-width: 1px !important;
    /* Adjust as needed */
  }

  :deep(
      .custom-datatable
        .p-datatable-table-container
        table.p-datatable-table.p-datatable-scrollable-table
        tbody.p-datatable-tbody
        tr
        td
    ) {
    display: table-cell !important;
  }

  .custom-datatable .p-datatable-tbody > tr > td,
  .custom-datatable .p-datatable-thead > tr > th {
    display: table-cell !important;
    width: auto !important;
  }
</style>