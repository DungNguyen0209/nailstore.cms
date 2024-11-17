<script setup>
import SectionMain from '@/components/SectionMain.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import { onMounted, ref, watch } from 'vue'
import { useMasterDataStore } from '@/stores/masterData'
import { useToastMessage } from '@/composables/useToast'
import Card from 'primevue/card';
import ScrollPanel from 'primevue/scrollpanel';
import Paginator from 'primevue/paginator';
import { useConfirm } from 'primevue/useconfirm'
import { mdiAccountGroup } from '@mdi/js'
import { getAccountByFilter, updateAccount, deleteAccount } from '@/api/account'
import { Role } from '@/helpers/constants'
import Account from '@/types/Account'
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import InputText from 'primevue/inputtext';
import SelectButton from 'primevue/selectbutton';
import ConfirmPopup from 'primevue/confirmpopup';
import Bill from '@/types/Bill'
import { getBillOfAccount } from '@/api/billApi'
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

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



onMounted(async () => {
  masterData.setIsLoading(true)
  await queryCustomers()
})

async function updateAccountDetail() {
  masterData.setComponentLoading(true)
  await updateAccount(selectedCustomer.value)
    .then(res => {
      showCommonSuccessMessage('Success', 'Update account successfully')
    })
    .catch(error => {
      showCommonErrorMessage('Error', 'Retry again')
    }).finally(() => {
      masterData.setComponentLoading()
    })
}

function selectCustomer(customer) {
  selectedCustomer.value = customer
  detailInformation.value = true
}

const confirmDeleteAccount = async () => {
  await deleteAccount(selectedCustomer.value.id)
    .then(res => {
      customers.value = customers.value.filter((s) => s.id != selectedCustomer.value.id)
      refresh()
      showCommonSuccessMessage('Success', 'Delete account successfully')
      isEditVisible.value = false
    })
    .catch(error => {
      showCommonErrorMessage('Error', 'Retry again')
    })

}

function refresh() {
  selectedTab.value = 1
  bills.value = {
    data: [],
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
  customers.value = await getAccountByFilter(
    {
      role: [Role.Guest],
      pageSize: pageSize.value,
      pageNumber: pageNumber.value,
      keyWord: keyWord.value
    })
    .then(res => {
      totalRecords.value = res.data.total
      customers.value = res.data.data
      return res.data.data
    })
    .catch(error => {
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
      .then(res => {
        bills.value.totalPrice = res.data.totalPrice
        bills.value.data = res.data.data.map(b => new Bill(b))
      })
      .catch(error => {
        showCommonErrorMessage('Error', 'Retry again')
      })
      .finally(() => {
        masterData.setIsLoading()
      })
  }
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <Dialog @hide="refresh" v-model:visible="detailInformation" modal header="Edit Profile"
        :style="{ width: '45rem' }">
        <template #header>
          <div class="flex flex-col gap-2">
            <div class="inline-flex items-center  gap-2">
              <span class="pi pi-user" style="font-size: 3rem;"></span>
              <span class="font-bold whitespace-nowrap">{{ selectedCustomer.fullName }}</span>
            </div>
            <SelectButton class="border-gray-500" v-model="selectedTab" :options="options" aria-labelledby="basic"
              optionLabel="name" optionValue="value" @change="ChangeTab" :invalid="value === null" size="large" />
          </div>
        </template>
        <div v-if="selectedTab === 1">
          <span class="text-surface-500 dark:text-surface-400 block mb-8">Update your information.</span>
          <div class="flex items-center gap-4 mb-4">
            <label for="username" class="font-semibold w-24">FullName</label>
            <InputText v-model="selectedCustomer.fullName" id="username" class="flex-auto" autocomplete="off" />
          </div>
          <div class="flex items-center gap-4 mb-2">
            <label for="email" class="font-semibold w-24">Email</label>
            <InputText v-model="selectedCustomer.email" id="email" class="flex-auto" autocomplete="off" />
          </div>
          <div class="flex items-center gap-4 mb-2">
            <label for="email" class="font-semibold w-24">Address</label>
            <Textarea v-model="selectedCustomer.address" id="category" class="flex-auto h-20 dark:bg-slate-800" rows="2"
              autocomplete="off" />
          </div>
          <div class="flex items-center gap-4 mb-2">
            <label for="email" class="font-semibold w-24">Note</label>
            <Textarea v-model="selectedCustomer.note" id="category" class="flex-auto h-20 dark:bg-slate-800" rows="2"
              autocomplete="off" />
          </div>
          <div class="flex items-center gap-4 mb-2">
            <label for="email" class="font-semibold w-24">Credit Point</label>
            <span class="flex-auto" style="font-size: 2rem;">{{ selectedCustomer.creditPoint }}</span>
          </div>
        </div>
        <div v-if="selectedTab === 2">
          <DataTable :value="bills.data" :loading="masterData.isComponentLoading" scrollable>
            <template #header>
              <div class="flex flex-wrap gap-2 items-center justify-between">
                <IconField>
                  <InputIcon>
                    <i class="pi pi-euro" />
                  </InputIcon>
                  <span class="ml-4"> {{ bills.totalPrice }}</span>
                </IconField>
              </div>
            </template>
            <Column field="CreatedTime" header="Check in ">
              <template #body="slotProps">
                {{ new Date(slotProps.data.createdTime).toLocaleString() }}
              </template>
            </Column>
            <Column field="price" header="Price">
            </Column>
            <Column field="discount" header="Discount"></Column>
            <Column field="creditPoint" header="CreditPoint"></Column>
          </DataTable>
        </div>
        <template #footer>
          <Button label="Cancel" text severity="secondary" @click="detailInformation = false" autofocus />
          <Button label="Save" :loading="masterData.isComponentLoading" outlined severity="secondary"
            @click="updateAccountDetail" autofocus />
        </template>
      </Dialog>
      <Dialog v-model:visible="isEditVisible" modal header="Confirm Delete" :style="{ width: '20vw' }">
        <p class="m-0">
          Do you want to proceed?
        </p>
        <template #footer>
          <Button label="Confirm" icon="pi pi-check" @click="confirmDeleteAccount" />
        </template>
      </Dialog>
      <SectionTitleLineWithButton :icon="mdiAccountGroup" title="Customer" main>
      </SectionTitleLineWithButton>
      <div class="h-full">
        <div class=" h-14
          sticky top-16
          flex flex-row 
          mt-5 font-semibold 
          bg-gray-300 dark:bg-slate-800 
          z-10
           dark:text-slate-100 rounded-md ">
          <span class="w-2/6 ml-2 content-center">Name</span>
          <span class="w-1/6 text-center content-center">Credit Point</span>
          <span class="w-2/6 text-center content-center">Address</span>
        </div>
        <ScrollPanel v-if="customers.length > 0" style="width: 100%; height: 60vh" class="overflow-hidden">
          <div v-for="customer in customers" v-bind:key="customer.id">
            <Card class="h-full mb-3 hover:shadow-lg hover:transition-all duration-500 cursor-pointer"
              @click="() => selectCustomer(customer)">
              <template #title>{{ customer.fullName }}</template>
              <template #content>
                <div class="flex sm:flex-row flex-col text-center">
                  <div class="flex flex-col w-2/6">
                    <div class="flex flex-row gap-2">
                      <i class="pi pi-envelope content-center"></i>
                      <span>{{ customer.email }}</span>
                    </div>
                    <div class="flex flex-row gap-2">
                      <i class="pi pi-phone content-center"></i>
                      <a href="#" class="no-underline hover:underline text-blue-500">{{ customer.phone }}</a>
                    </div>
                  </div>
                  <span class="w-1/6 text-center content-center font-bold text-lg">{{ customer.creditPoint }}</span>
                  <span style="word-break: break-word; white-space: normal"
                    class="text-wrap w-2/6 text-center content-center">{{ customer.address }}</span>
                  <div class="w-1/6 content-center text-center align-middle ">
                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="border-3"
                      @click.stop="openDeleteConfirm(customer)" />
                  </div>
                </div>
              </template>
            </Card>
          </div>

        </ScrollPanel>
        <Paginator @page="onPageChange" :rows="pageNumber" :totalRecords="totalRecords"
          :rowsPerPageOptions="[10, 50, 100]">
        </Paginator>
      </div>
    </SectionMain>
  </LayoutAuthenticated>
</template>

<style scoped>
.thick-border {
  border-width: 1.5px;
  /* Adjust the value as needed */
}
</style>