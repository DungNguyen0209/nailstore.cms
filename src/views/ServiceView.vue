<script setup>
  import { mdiTableBorder, mdiGithub } from '@mdi/js'
  import SectionMain from '@/components/SectionMain.vue'
  import CardBox from '@/components/CardBox.vue'
  import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
  import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
  import BaseButton from '@/components/BaseButton.vue'
  import { onMounted, ref, defineProps } from 'vue'
  import { createService } from '@/types/Service'
  import ServiceTable from '@/components/Service/ServiceTable.vue'
  import {
    getListService,
    createServiceByAdmin,
    getAllCategories,
    getCategoryForDropDown,
    updateService,
    createCategoryByAdmin,
    updateCategory,
    deleteCategoryById,
    deleteServiceById
  } from '@/api/serviceApi'
  import {
    Dialog,
    InputText,
    Button,
    Dropdown,
    InputGroup,
    InputNumber,
    InputGroupAddon,
    Textarea,
    SelectButton
  } from 'primevue'
  import { useMasterDataStore } from '@/stores/masterData'
  import { useToastMessage } from '@/composables/useToast'
  import BaseMasterData from '@/types/BaseMasterData'
  import CategoryServiceTable from '@/components/Service/CategoryServiceTable.vue'

  const { showSuccessCreateService, showCommonSuccessMessage, showCommonErrorMessage } =
    useToastMessage()
  const masterData = useMasterDataStore()
  const services = ref([createService()])

  const currentPageSize = ref(10)
  const totalRecords = ref(0)

  const modalCreateActive = ref(false)
  const modalCategoryCreateActive = ref(false)

  const newService = ref(createService())
  const newCategory = ref(new BaseMasterData())
  const dropDown = ref(true)
  const SelectedType = ref(1)
  const options = ref([
    { name: 'Service', value: 1 },
    { name: 'Category Service', value: 2 }
  ])

  const isUpdate = ref(false)

  onMounted(async () => {
    refreshInfor()
    await queryService()
  })

  async function queryService() {
    masterData.setComponentLoading(true)
    await getListService({ pageSize: currentPageSize.value, pageNumber: 1 })
      .then((response) => {
        services.value = response.data?.services?.map((serviceData) => createService(serviceData))
        currentPageSize.value = response.data?.pageSize
        totalRecords.value = response.data?.total
      })
      .catch(() => {
        showCommonErrorMessage('Error', 'Please reload page')
      })
      .finally(() => {
        masterData.setComponentLoading(false)
      })
  }

  const props = defineProps({
    label: {
      type: [String, Number],
      default: null
    }
  })

  const refreshInfor = async () => {
    if (SelectedType.value == 1 && reflectNewService.value != newService.value) {
      await queryService()
    }
    if (SelectedType.value == 2 && reflectNewCategory.value != newCategory.value) {
      await queryCategory()
    }

    isUpdate.value = false
    newService.value = createService()
    reflectNewService.value = null
    newService.value.createdBy = masterData.userInfo?.id ?? ''
    newCategory.value = new BaseMasterData()
    reflectNewCategory.value = null
  }

  const Dropdowncategories = ref(null)
  const categories = ref([new BaseMasterData()])
  const categoryTotal = ref(0)
  const categoryPageSize = ref(10)
  const emit = defineEmits(['changePaging'])

  async function OpenCreateService(params) {
    if (SelectedType.value == 1) {
      await getCategoryForDropDown()
        .then((response) => {
          Dropdowncategories.value = response.data?.map((category) => {
            return {
              name: category.label,
              code: category.id
            }
          })
          modalCreateActive.value = true
        })
        .catch((exception) => {
          showCommonErrorMessage('Error', 'Can not query categories')
        })
      return
    }
    modalCategoryCreateActive.value = true
  }
  async function createOrUpdateNewService() {
    if (isUpdate.value) {
      await updateService(newService.value)
        .then(() => {
          showSuccessCreateService(newService.value)
          modalCreateActive.value = false
          refreshInfor()
        })
        .catch(() => {})
      return
    }
    await createServiceByAdmin([
      {
        Name: newService.value.name,
        CategoryId: newService.value.categoryId,
        Price: newService.value.price,
        Description: newService.value.description,
        CreatedBy: newService.value.createdBy
      }
    ])
      .then(() => {
        showSuccessCreateService(newService.value)
        refreshInfor()
        modalCreateActive.value = false
      })
      .catch(() => {})
  }

  async function createOrUpdateNewCategory() {
    if (isUpdate.value) {
      await updateCategory(newCategory.value)
        .then(() => {
          showSuccessCreateService(newCategory.value)
          modalCategoryCreateActive.value = false
          refreshInfor()
        })
        .catch(() => {})
      return
    }
    await createCategoryByAdmin([
      {
        label: newCategory.value.name,
        value: newCategory.value.value
      }
    ])
      .then(() => {
        showSuccessCreateService(newService.value)
        refreshInfor()
        modalCategoryCreateActive.value = false
      })
      .catch(() => {})
  }

  async function ChangeTab(params) {
    if (params.value == 1) {
      await queryService()
      return
    }
    await queryCategory()
  }

  async function queryCategory() {
    masterData.setComponentLoading(true)
    await getAllCategories({ pageSize: categoryPageSize.value, pageNumber: 1 })
      .then((response) => {
        categories.value = response.data?.data?.map((category) => {
          return new BaseMasterData(category)
        })
        categoryPageSize.value = response.data?.pageSize
        categoryTotal.value = response.data?.total
      })
      .catch(() => {
        showCommonErrorMessage('Error', 'Can not get data')
      })
      .finally(() => {
        masterData.setComponentLoading(false)
        return
      })
  }

  async function changePagingService(event) {
    masterData.setComponentLoading(true)
    await getListService({ pageSize: event.rows, pageNumber: event.page + 1 })
      .then((response) => {
        services.value = response.data?.services?.map((serviceData) => createService(serviceData))
        currentPageSize.value = response.data?.pageSize
        totalRecords.value = response.data?.total
      })
      .catch(() => {
        showCommonErrorMessage('Error', 'Can not get data')
      })
      .finally(() => {
        masterData.setComponentLoading(false)
        return
      })
  }

  const changePagingCategory = (event) => {
    masterData.setComponentLoading(true)
    getAllCategories({ pageSize: event.rows, pageNumber: event.page + 1 })
      .then((response) => {
        categories.value = response.data?.data?.map((category) => {
          return new BaseMasterData(category)
        })
        categoryPageSize.value = response.data?.pageSize
        categoryTotal.value = response.data?.total
      })
      .catch(() => {})
      .finally(() => {
        masterData.setComponentLoading(false)
        return
      })
  }

  const reflectNewService = ref(null)
  async function editService(service) {
    await getCategoryForDropDown()
      .then((response) => {
        Dropdowncategories.value = response.data?.map((category) => {
          return {
            name: category.label,
            code: category.id
          }
        })
        newService.value = service
        reflectNewService.value = service
        isUpdate.value = true
        modalCreateActive.value = true
      })
      .catch((exception) => {
        showCommonErrorMessage('Error', 'Can not query categories')
      })
  }

  const reflectNewCategory = ref(null)
  async function editCategory(category) {
    newCategory.value = category
    reflectNewCategory.value = category
    isUpdate.value = true
    modalCategoryCreateActive.value = true
  }

  const deleteService = async (id) => {
    deleteServiceById(id)
      .then(() => {
        services.value = services.value.filter((s) => s.id != id)

        showCommonSuccessMessage('Delete Service', 'Service deleted successfully')
      })
      .catch((error) => {
        showCommonErrorMessage('Delete Service', error)
      })
  }

  const deleteServiceCategory = async (id) => {
    deleteCategoryById(id)
      .then(() => {
        categories.value = categories.value.filter((category) => category.id !== id)
        showCommonSuccessMessage('Delete Category', 'Category deleted successfully')
      })
      .catch((error) => {
        showCommonErrorMessage('Delete Service', error)
      })
  }
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain class="h-full flex flex-col relative">
      <div class="h-4/5">
        <SectionTitleLineWithButton :icon="mdiTableBorder" title="Service " main>
          <Dialog
            @hide="refreshInfor"
            class="dark:bg-slate-900 dark:text-white"
            v-model:visible="modalCreateActive"
            modal
            header="Create new Sevice"
            :style="{ width: '40rem' }"
          >
            <div class="flex flex-col gap-3 mb-4">
              <label for="name" class="font-semibold dark:text-white w-24">Name</label>
              <InputText
                id="name"
                class="flex-auto dark:bg-slate-800"
                autocomplete="off"
                v-model="newService.name"
              />
            </div>
            <div class="flex flex-col gap-3 mb-4">
              <label for="category" class="font-semibold dark:text-white w-24">Category</label>
              <Dropdown
                v-model="newService.categoryId"
                ref="dropDown"
                checkmark
                :options="Dropdowncategories"
                optionLabel="name"
                optionValue="code"
                placeholder="Select Category"
                class="w-full md:w-14rem dark:bg-slate-800"
              >
                <template #dropdownicon>
                  <i
                    v-if="Boolean(!newService.categoryId)"
                    :class="dropDown?.clicked ? 'pi pi-angle-down' : 'pi pi-align-justify'"
                  ></i>
                  <i
                    v-else
                    :class="'pi pi-check font-extrabold	'"
                    style="color: green; font-weight: 800"
                  ></i>
                </template>
                <!-- <template #dropdownicon>
                    <i :class="'pi pi-angle-down'">{{ dropDown }}</i>
                  </template> -->
              </Dropdown>
            </div>
            <div class="flex flex-col gap-3 mb-4">
              <label for="category" class="font-semibold dark:text-white w-24">Price</label>
              <InputGroup class="dark:bg-slate-800">
                <InputGroupAddon class="dark:bg-slate-800 dark:text-white">€</InputGroupAddon>
                <InputNumber
                  v-model="newService.price"
                  :minFractionDigits="2"
                  @click.stop
                  size="small"
                  placeholder="Price"
                  class="dark:bg-slate-800 dark:text-white"
                  inputId="currency-germany"
                  mode="currency"
                  currency="EUR"
                  locale="de-DE"
                />
              </InputGroup>
            </div>
            <div class="flex flex-col gap-3 mb-4">
              <label for="category" class="font-semibold dark:text-white w-24">Note</label>
              <Textarea
                v-model="newService.description"
                id="category"
                class="flex-auto h-20 dark:bg-slate-800"
                rows="2"
                autocomplete="off"
              />
            </div>
            <div class="flex justify-end gap-2">
              <Button
                type="button"
                label="Cancel"
                severity="secondary"
                @click="() => (modalCreateActive = !modalCreateActive)"
              ></Button>
              <Button type="button" label="Save" @click="createOrUpdateNewService"></Button>
            </div>
          </Dialog>
          <Dialog
            @hide="refreshInfor"
            class="dark:bg-slate-900 dark:text-white"
            v-model:visible="modalCategoryCreateActive"
            modal
            header="Create new Category"
            :style="{ width: '40rem' }"
          >
            <div class="flex flex-col gap-3 mb-4">
              <label for="name" class="font-semibold dark:text-white w-24">Name</label>
              <InputText
                id="name"
                class="flex-auto dark:bg-slate-800"
                autocomplete="off"
                v-model="newCategory.label"
              />
            </div>
            <div class="flex flex-col gap-3 mb-4">
              <label for="category" class="font-semibold dark:text-white w-24">Note</label>
              <Textarea
                v-model="newCategory.value"
                id="category"
                class="flex-auto h-20 dark:bg-slate-800"
                rows="2"
                autocomplete="off"
              />
            </div>
            <div class="flex justify-end gap-2">
              <Button
                type="button"
                label="Cancel"
                severity="secondary"
                @click="() => (modalCategoryCreateActive = !modalCategoryCreateActive)"
              ></Button>
              <Button type="button" label="Save" @click="createOrUpdateNewCategory"></Button>
            </div>
          </Dialog>
          <BaseButton
            target="_blank"
            :icon="mdiGithub"
            label="Create"
            color="bg-pink-400"
            rounded-full
            small
            @click="OpenCreateService"
          />
        </SectionTitleLineWithButton>
        <div class="mb-3 h-full">
          <SelectButton
            class="border-gray-500"
            v-model="SelectedType"
            :options="options"
            aria-labelledby="basic"
            optionLabel="name"
            optionValue="value"
            @change="ChangeTab"
            :invalid="value === null"
          >
          </SelectButton>
        </div>
      </div>
      <div>
        <ServiceTable
          v-if="SelectedType == 1"
          checkable
          :services="services"
          :isloading="masterData.isComponentLoading"
          :total-records="totalRecords"
          @changePaging="changePagingService"
          @editService="editService"
          @deleteService="deleteService"
          :page-size="currentPageSize"
        />
        <CategoryServiceTable
          v-else
          checkable
          :categories="categories"
          :isloading="masterData.isComponentLoading"
          @deleteCategory="deleteServiceCategory"
          @changePaging="changePagingCategory"
          :total-records="categoryTotal"
          @editCategory="editCategory"
          :page-size="categoryPageSize"
        />
      </div>
    </SectionMain>
  </LayoutAuthenticated>
</template>

<style scoped>
  ::v-deep .p-togglebutton.p-togglebutton-checked::before {
    @apply bg-pink-400;
  }
</style>
