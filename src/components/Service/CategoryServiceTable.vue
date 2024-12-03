<script setup>
  import { ref, defineProps } from 'vue'
  import { DataTable, InputIcon, IconField, Button, InputText, Column } from 'primevue'
  import { useConfirm } from 'primevue/useconfirm'
  import { useToastMessage } from '@/composables/useToast'
  import Skeleton from 'primevue/skeleton'

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
    scrollable
    :scrollHeight="'calc(48vh)'"
    :totalRecords="totalRecords"
    :rows="pageSize"
    class="w-full"
    @page="onPageChange"
    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
    :rowsPerPageOptions="[5, 10, 25]"
    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} services"
  >
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

    <Column
      header-class="sticky! top-0! z-10000"
      selectionMode="multiple"
      :exportable="false"
      class="w-0.5/6"
    ></Column>
    <Column
      header-class="sticky! top-0! z-10000"
      field="label"
      header="Name"
      class="w-full justify-start sm:w-2/6"
      style="word-break: break-word; white-space: normal"
    >
    </Column>
    <Column
      header-class="sticky! top-0! z-10000"
      field="value"
      header="Description"
      class="w-full justify-start sm:w-3/6"
      style="word-break: break-word; white-space: normal"
    >
      <template #body="slotProps">
        <template v-if="isloading">
          <Skeleton v-for="n in 10" :key="n" class="mb-2"></Skeleton>
        </template>
        <article v-else class="text-pretty">
          <p>{{ slotProps.data.value }}</p>
        </article>
      </template>
    </Column>
    <Column header-class="sticky! top-0! z-10000" :exportable="false" class="w-0.5/6">
      <template #body="slotProps">
        <template v-if="isloading">
          <Skeleton v-for="n in 10" :key="n" class="mb-2"></Skeleton>
        </template>
        <div v-else class="flex flex-row h-full gap-2 content-center align-middle">
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
