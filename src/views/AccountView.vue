<script setup>
import SectionMain from '@/components/SectionMain.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import { onMounted, ref, watch } from 'vue'
import { useMasterDataStore } from '@/stores/masterData'
import { useToastMessage } from '@/composables/useToast'
import Card from 'primevue/card'
import ScrollPanel from 'primevue/scrollpanel'
import Paginator from 'primevue/paginator'
import { useConfirm } from 'primevue/useconfirm'
import { mdiAccountGroup } from '@mdi/js'
import { getAccountByFilter, updateAccount, deleteAccount } from '@/api/account'
import { updatePassword } from '@/api/userApi'
import { Role } from '@/helpers/constants'
import Account from '@/types/Account'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import InputText from 'primevue/inputtext'
import SelectButton from 'primevue/selectbutton'
import ConfirmPopup from 'primevue/confirmpopup'
import Bill from '@/types/Bill'
import { getBillOfAccount } from '@/api/billApi'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { getRoleSeverity } from '@/helpers/user'
import InputMask from 'primevue/inputmask'
import Dropdown from 'primevue/dropdown'
import Password from 'primevue/password'

const masterData = useMasterDataStore()
const accounts = ref([new Account()])
const pageSize = ref(10)
const pageNumber = ref(10)
const totalRecords = ref(0)
const keyWord = ref('')
const { showCommonErrorMessage, showCommonSuccessMessage } = useToastMessage()
const selectedAccount = ref(new Account())
const detailInformation = ref(false)
const password = ref('')
const confirmPassword = ref('')
const options = ref([
    { name: 'Information', value: 1 },
    { name: 'Change Password', value: 2 }
])
const selectedTab = ref(1)
const isEditVisible = ref(false)
const bills = ref({
    data: [],
    totalPrice: 0
})
const dropDown = ref(true)

const DropdownRole = ref([Role.Staff, Role.Manager, Role.Cashier])

onMounted(async () => {
    await queryAccounts()
})

async function saveDetailInformation() {
    masterData.setComponentLoading(true)
    if (selectedTab.value === 1) {
        await updateAccount(selectedAccount.value)
            .then((res) => {
                showCommonSuccessMessage('Success', 'Update account successfully')
            })
            .catch((error) => {
                showCommonErrorMessage('Error', 'Retry again')
            })
    } else if (selectedTab.value === 2) {
        await updatePassword({ accountId: selectedAccount.value.id, password: password.value })
            .then((res) => {
                password.value = ''
                confirmPassword.value = ''
                showCommonSuccessMessage('Success', 'Update password successfully')
            })
            .catch((error) => {
                showCommonErrorMessage('Error', 'Retry again')
            })
    }
    masterData.setComponentLoading()
}

function selectAccount(account) {
    selectedAccount.value = account
    detailInformation.value = true
}

const confirmDeleteAccount = async () => {
    await deleteAccount(selectedAccount.value.id)
        .then((res) => {
            accounts.value = accounts.value.filter((s) => s.id != selectedAccount.value.id)
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
    password.value = ''
    confirmPassword.value = ''
    bills.value = {
        data: [],
        totalPrice: 0
    }
    selectedAccount.value = new Account()
}

const openDeleteConfirm = (account) => {
    selectedAccount.value = account
    isEditVisible.value = true
}

const onPageChange = async (event) => {
    pageNumber.value = event.page + 1
    await queryAccounts()
}

async function queryAccounts() {
    masterData.setIsLoading(true)
    accounts.value = await getAccountByFilter({
        role: [Role.Staff, Role.Manager, Role.Cashier],
        pageSize: pageSize.value,
        pageNumber: pageNumber.value,
        keyWord: keyWord.value
    })
        .then((res) => {
            totalRecords.value = res.data.total
            accounts.value = res.data.data
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
        await getBillOfAccount(selectedAccount.value.id)
            .then((res) => {
                bills.value.totalPrice = res.data.totalPrice
                bills.value.data = res.data.data.map((b) => new Bill(b))
            })
            .catch((error) => {
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
                        <div class="inline-flex items-center gap-2">
                            <span class="pi pi-user" style="font-size: 3rem"></span>
                            <span class="font-bold whitespace-nowrap">{{ selectedAccount.fullName }}</span>
                        </div>
                        <SelectButton class="border-gray-500" v-model="selectedTab" :options="options"
                            aria-labelledby="basic" optionLabel="name" optionValue="value" @change="ChangeTab"
                            :invalid="value === null" size="large" />
                    </div>
                </template>
                <div v-if="selectedTab === 1">
                    <span class="text-surface-500 dark:text-surface-400 block mb-8">Update your information.</span>
                    <div class="flex items-center gap-4 mb-4">
                        <label for="username" class="font-semibold w-24">FullName</label>
                        <InputText v-model="selectedAccount.fullName" id="username" class="flex-auto"
                            autocomplete="off" />
                    </div>
                    <div class="flex items-center gap-4 mb-2">
                        <label for="email" class="font-semibold w-24">Email</label>
                        <InputText v-model="selectedAccount.email" id="email" class="flex-auto" autocomplete="off" />
                    </div>
                    <div class="flex items-center gap-4 mb-2">
                        <label for="phone" class="font-semibold w-24">Phone</label>
                        <InputMask class="flex-auto" id="phone" v-model="selectedAccount.phone" mask="(999) 999-9999"
                            placeholder="(999) 999-9999" />
                    </div>
                    <div class="flex items-center gap-4 mb-2">
                        <label for="role" class="font-semibold w-24">Role</label>
                        <Dropdown v-model="selectedAccount.role" ref="dropDown" checkmark :options="DropdownRole"
                            placeholder="Select Role" class="flex-auto dark:bg-slate-800">
                            <template #dropdownicon>
                                <i v-if="Boolean(!selectAccount.role)"
                                    :class="dropDown?.clicked ? 'pi pi-angle-down' : 'pi pi-align-justify'"></i>
                                <i v-else :class="'pi pi-check font-extrabold	'"
                                    style="color: green; font-weight: 800"></i>
                            </template>
                        </Dropdown>
                    </div>
                    <div class="flex items-center gap-4 mb-2">
                        <label for="email" class="font-semibold w-24">Address</label>
                        <Textarea v-model="selectedAccount.address" id="category"
                            class="flex-auto h-20 dark:bg-slate-800" rows="2" autocomplete="off" />
                    </div>
                    <div class="flex items-center gap-4 mb-2">
                        <label for="email" class="font-semibold w-24">Note</label>
                        <Textarea v-model="selectedAccount.note" id="category" class="flex-auto h-20 dark:bg-slate-800"
                            rows="2" autocomplete="off" />
                    </div>
                </div>
                <div v-if="selectedTab === 2">
                    <div class="flex items-center gap-4 mb-8">
                        <label for="username" class="font-semibold w-1/3">New Password</label>
                        <div class="w-2/3">
                            <Password fluid toggleMask v-model="password" />
                        </div>
                    </div>
                    <div class="flex items-center gap-4 mb-4">
                        <label for="username" class="font-semibold w-1/3">Confirm Password</label>
                        <div class="w-2/3">
                            <Password fluid v-model="confirmPassword" :feedback="false" />
                        </div>
                    </div>
                    <div class="flex items-center gap-4 mb-4 h-2">
                        <label v-if="password.length > 0 && password != confirmPassword" class="w-full text-sm">You must
                            enter a correct
                            confirm password.</label>
                    </div>
                </div>
                <template #footer>
                    <Button label="Cancel" text severity="secondary" @click="detailInformation = false" autofocus />
                    <Button label="Save" :disabled="password.length > 0 && password != confirmPassword"
                        :loading="masterData.isComponentLoading" outlined severity="secondary"
                        @click="saveDetailInformation" autofocus />
                </template>
            </Dialog>
            <Dialog v-model:visible="isEditVisible" modal header="Confirm Delete" :style="{ width: '20vw' }">
                <p class="m-0">Do you want to proceed?</p>
                <template #footer>
                    <Button label="Confirm" icon="pi pi-check" @click="confirmDeleteAccount" />
                </template>
            </Dialog>
            <SectionTitleLineWithButton :icon="mdiAccountGroup" title="Account" main>
            </SectionTitleLineWithButton>
            <div class="h-full">
                <div class="hidden sm:inline">
                    <div
                        class="h-14 sticky top-16 flex flex-row mt-5 font-semibold bg-gray-300 dark:bg-slate-800 z-10 dark:text-slate-100 rounded-md">
                        <span class="w-2/6 ml-2 content-center">Name</span>
                        <span class="w-1/6 text-center content-center">Role</span>
                        <span class="w-2/6 text-center content-center">Address</span>
                    </div>
                </div>
                <ScrollPanel v-if="accounts.length > 0" style="width: 100%; height: 60vh" class="overflow-hidden">
                    <div v-for="account in accounts" v-bind:key="account.id">
                        <Card class="h-full mb-3 hover:shadow-lg hover:transition-all duration-500 cursor-pointer"
                            @click="() => selectAccount(account)">
                            <template #title>{{ account.fullName }}</template>
                            <template #content>
                                <div class="flex sm:flex-row flex-col text-center gap-2">
                                    <div class="flex flex-col w-full gap-2 sm:w-2/6">
                                        <div class="flex flex-row gap-2">
                                            <i class="pi pi-envelope content-center"></i>
                                            <span>{{ account.email }}</span>
                                        </div>
                                        <div class="flex flex-row gap-2">
                                            <i class="pi pi-phone content-center"></i>
                                            <a href="#" cl ass="no-underline hover:underline text-blue-500">{{
                                                account.phone
                                                }}</a>
                                        </div>
                                    </div>
                                    <div class="sm:w-1/6 w-full text-center content-center">
                                        <Tag class="sm:w-24 w-full h-9" :severity="getRoleSeverity(account.role)">{{
                                            account.role
                                            }}
                                        </Tag>
                                    </div>
                                    <div class="sm:w-2/6 w-full flex flex-row gap-2">
                                        <div class="inline sm:hidden">
                                            <i class="pi pi-address-book mt-1" style="color: green"></i>
                                        </div>
                                        <span style="word-break: break-word; white-space: normal"
                                            class="text-wrap text-center content-center">{{ account.address
                                            }}</span>
                                    </div>
                                    <div class="sm:w-1/6 w-full content-center text-center align-middle">
                                        <Button icon="pi pi-trash" outlined rounded severity="danger" class="border-3"
                                            @click.stop="openDeleteConfirm(account)" />
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
