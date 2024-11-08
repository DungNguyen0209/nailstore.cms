<script setup>
import { mdiMonitorCellphone, mdiTableBorder, mdiTableOff, mdiGithub } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import TableSampleClients from '@/components/TableSampleClients.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'
import { onMounted, ref, defineProps } from 'vue'
import { createService } from '@/types/Service'
import ServiceTable from '@/components/Service/ServiceTable.vue'
import { getListService, createServiceByAdmin, getAllCategories } from '@/api/serviceApi'
import { Dialog, InputText, Button, Dropdown, InputGroup, InputNumber, InputGroupAddon, Textarea } from 'primevue'
import { useMasterDataStore } from '@/stores/masterData'
import { useToastMessage } from '@/composables/useToast';

const { showSuccessCreateService } = useToastMessage();
const masterData = useMasterDataStore()
const services = ref([createService()])
const currentPage = ref(1)
const numPages = ref(0)
const modalCreateActive = ref(false)
const newService = ref(createService())
const dropDown = ref(true)

onMounted(async () => {
  refreshNewService()
  await getListService({pageSize: 10, pageNumber: currentPage.value})
  .then((response) => {
      services.value = response.data?.Services?.map(serviceData => createService(serviceData))
      console.log(services.value)
      numPages.value = Math.ceil(response.data.Total / perPage.value)
    }).catch(() => {
      console.log("error")
    })
    });

const props = defineProps({
  label: {
    type: [String, Number],
    default: null
  },
})

const refreshNewService = () => {
  newService.value = createService()
  newService.value.createdBy = masterData.userInfo?.id ?? ''
}

const categories = ref([]);
const pageType = ref(1);

async function OpenCreateService(params) {
  if(pageType){
    await getAllCategories()
    .then((response) => {
      console.log(response)
      categories.value = response.data?.map(category => {
        return {
          name: category.label,
          code: category.value
        }
      })
      modalCreateActive.value = true;
    }).catch((exception) => {
      console.log("can not query categories", exception)
    })
  }
}
async function createNewService() {
  await createServiceByAdmin([{
    Name: newService.value.name,
    CategoryId: newService.value.type.code,
    Price: newService.value.price,
    Description: newService.value.description,
    CreatedBy: newService.value.createdBy
  }])
    .then(() => {
      showSuccessCreateService(newService.value);
      refreshNewService();
      modalCreateActive.value = false;
    }).catch(() => {})
}

async function name(params) {
  console.log(params)
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Tables" main>
        <Dialog class = "dark:bg-slate-900 dark:text-white" v-model:visible="modalCreateActive" modal header="Create new Sevice" :style="{ width: '40rem' }">
          <div class="flex flex-col gap-3 mb-4">
              <label for="name" class="font-semibold dark:text-white w-24">Name</label>
              <InputText id="name" class="flex-auto dark:bg-slate-800" autocomplete="off"  v-model="newService.name"/>
          </div>
          <div class="flex flex-col gap-3 mb-4">
              <label  for="category" class="font-semibold dark:text-white w-24">Category</label>
              <Dropdown v-model="newService.type" ref="dropDown" checkmark :options="categories" optionLabel="name" placeholder="Select Category" class="w-full md:w-14rem dark:bg-slate-800" >
                <template #dropdownicon>
                  <i v-if = "newService.type == null" :class="dropDown.clicked ? 'pi pi-angle-down' : 'pi pi-align-justify'"></i>
                  <i v-else :class="'pi pi pi-check'"  style="color: green"></i>
                </template>
                <!-- <template #dropdownicon>
                  <i :class="'pi pi-angle-down'">{{ dropDown }}</i>
                </template> -->
              </Dropdown>
          </div>
          <div class="flex flex-col gap-3 mb-4">
              <label for="category" class="font-semibold dark:text-white w-24">Price</label>
              <InputGroup class = "dark:bg-slate-800">
                <InputGroupAddon class = "dark:bg-slate-800 dark:text-white" >€</InputGroupAddon>
                <InputNumber v-model="newService.price" placeholder="Price" class="dark:bg-slate-800 dark:text-white" :minFractionDigits="2" :maxFractionDigits="4"  />
            </InputGroup>
          </div>
          <div class="flex flex-col gap-3 mb-4">
              <label for="category" class="font-semibold dark:text-white w-24">Note</label>
              <Textarea v-model="newService.description" id="category" class="flex-auto h-20 dark:bg-slate-800" rows="2" autocomplete="off" />
          </div>
          <div class="flex justify-end gap-2">
              <Button type="button" label="Cancel" severity="secondary" @click="() => modalCreateActive = !modalCreateActive"></Button>
              <Button type="button" label="Save" @click="createNewService"></Button>
          </div>

      </Dialog>
        <BaseButton target="_blank" :icon="mdiGithub" label="Create new service" color="bg-pink-400" rounded-full
          small @click = "OpenCreateService"/>
      </SectionTitleLineWithButton>
      <NotificationBar color="info" :icon="mdiMonitorCellphone">
        <b>Responsive table.</b> Collapses on mobile
      </NotificationBar>

      <CardBox class="mb-6" has-table>
        <ServiceTable checkable :services="services" :num-pages="numPages" :current-page="currentPage" />
      </CardBox>

      <!-- <SectionTitleLineWithButton :icon="mdiTableOff" title="Empty variation" /> -->

      <!-- <NotificationBar color="danger" :icon="mdiTableOff">
        <b>Empty table.</b> When there's nothing to show
      </NotificationBar>

      <CardBox>
        <CardBoxComponentEmpty />
      </CardBox> -->
    </SectionMain>
  </LayoutAuthenticated>
</template>
