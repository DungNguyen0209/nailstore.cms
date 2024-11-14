<script setup>
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import { onMounted, ref, computed } from 'vue'
import { useMasterDataStore } from '@/stores/masterData'
import { useToastMessage } from '@/composables/useToast'
import OrderTable from '@/components/Order/OrderTable.vue'
import Order from '@/types/Order'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import {
  Sidebar,
  Tag,
  Button,
  DataTable,
  Column,
  Select,
  FloatLabel,
  MultiSelect,
  ConfirmPopup,
  Card,
  DataView,
  ScrollPanel,
  Checkbox
} from 'primevue'
import { getOrderSeverity } from '@/helpers/order'
import { getStaffForDropDown } from '@/api/userApi'
import { getServiceForDropDown } from '@/api/serviceApi'
import { OrderStatus } from '@/helpers/constants'
import {
  updateOrderInfo,
  getOrders,
  getOrderDetail,
  UpdateOrderStatus,
  CheckoutOrder
} from '@/api/orderApi'
import { useConfirm } from 'primevue/useconfirm'
import { AccountStatus } from '@/helpers/constants'
import { mdiAccountGroup } from '@mdi/js'

const masterData = useMasterDataStore()
const confirm = useConfirm()

const { showErrorCommonMessage, showSuccessUpdateOrder } = useToastMessage()
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
    <SectionTitleLineWithButton :icon="mdiAccountGroup" title="Customer" main>
      </SectionTitleLineWithButton>
      <CardBox class="mb-6" has-table> </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>

<style scoped>
.thick-border {
  border-width: 1.5px;
  /* Adjust the value as needed */
}
</style>
