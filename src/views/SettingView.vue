<script setup>
import SectionMain from '@/components/SectionMain.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import { onMounted, ref, watch } from 'vue'
import { useMasterDataStore } from '@/stores/masterData'
import { useToastMessage } from '@/composables/useToast'
import { useConfirm } from 'primevue/useconfirm'
import { mdiCogOffOutline } from '@mdi/js'
import { getAccountByFilter, updateAccount, deleteAccount } from '@/api/account'
import { Role } from '@/helpers/constants'
import Account from '@/types/Account'
import Bill from '@/types/Bill'
import { getBillOfAccount } from '@/api/billApi'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'

const masterData = useMasterDataStore()
const confirm = useConfirm()
const customers = ref([new Account()])
const pageSize = ref(10)
const pageNumber = ref(10)
const totalRecords = ref(0)
const keyWord = ref('')
const { showCommonErrorMessage, showCommonSuccessMessage } = useToastMessage()
const selectedCustomer = ref(new Account())
const detailInformation = ref(false)
const options = ref([
  { name: 'Information', value: 1 },
  { name: 'History', value: 2 },
  { name: 'Group', value: 3 }
])
const selectedTab = ref(1)
const isEditVisible = ref(false)
const bills = ref({
  data: [],
  totalPrice: 0
})

const expandedRows = ref(null)
onMounted(async () => {
  masterData.setIsLoading(true)
  await queryCustomers()
})

async function updateAccountDetail() {
  masterData.setComponentLoading(true)
  await updateAccount(selectedCustomer.value)
    .then((res) => {
      showCommonSuccessMessage('Success', 'Update account successfully')
    })
    .catch((error) => {
      showCommonErrorMessage('Error', 'Retry again')
    })
    .finally(() => {
      masterData.setComponentLoading()
    })
}

function selectCustomer(customer) {
  selectedCustomer.value = customer
  detailInformation.value = true
}

const confirmDeleteAccount = async () => {
  await deleteAccount(selectedCustomer.value.id)
    .then((res) => {
      customers.value = customers.value.filter((s) => s.id != selectedCustomer.value.id)
      refresh()
      showCommonSuccessMessage('Success', 'Delete account successfully')
      isEditVisible.value = false
    })
    .catch((error) => {
      showCommonErrorMessage('Error', 'Retry again')
    })
}

function refresh() {
  selectedTab.value = 1
  bills.value = {
    data: [],
    historyDetail: [],
    totalPrice: 0
  }
  selectedCustomer.value = new Account()
}

const openDeleteConfirm = (customer) => {
  selectedCustomer.value = customer
  isEditVisible.value = true
}

const onPageChange = async (event) => {
  pageNumber.value = event.page + 1
  await queryCustomers()
}

async function queryCustomers() {
  masterData.setIsLoading(true)
  customers.value = await getAccountByFilter({
    role: [Role.Guest],
    pageSize: pageSize.value,
    pageNumber: pageNumber.value,
    keyWord: keyWord.value
  })
    .then((res) => {
      totalRecords.value = res.data.total
      customers.value = res.data.data
      return res.data.data
    })
    .catch((error) => {
      console.log(error)
      showCommonErrorMessage('Error', 'Retry again')
    })
    .finally(() => {
      masterData.setIsLoading()
    })
}

async function ChangeTab() {
  if (selectedTab.value === 2 && bills.value.data.length === 0) {
    masterData.setIsLoading(true)
    await getBillOfAccount(selectedCustomer.value.id)
      .then((res) => {
        bills.value.totalPrice = res.data.totalPrice
        bills.value.data = res.data.data.map((b) => new Bill(b))
        expandedRows.value = bills.value.data.reduce((acc, p) => (acc[p.id] = false) && acc, {})
      })
      .catch((error) => {
        showCommonErrorMessage('Error', 'Retry again')
      })
      .finally(() => {
        masterData.setIsLoading()
      })
  }
}

// Event handlers for row expand and collapse
const onRowExpand = (event) => {
  expandedRows.value[event.data.id] = true
}

const onRowCollapse = (event) => {
  delete expandedRows.value[event.data.id]
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain class="h-full flex flex-col relative">
      <SectionTitleLineWithButton :icon="mdiCogOffOutline" title="Setting" main>
      </SectionTitleLineWithButton>
      <div class="h-full">asdasdasd</div>
    </SectionMain>
  </LayoutAuthenticated>
</template>

<style scoped></style>
