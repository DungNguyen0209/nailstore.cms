<template>
    <div class="card">
        <DataView :value="orders" :layout="layout">
            <template #header>
                <div class="flex justify-end gap-2">
                    <!-- <SelectButton v-model="layout" :options="options" :allowEmpty="false">
                        <template #option="{ option }">
                            <i :class="[option === 'list' ? 'pi pi-bars' : 'pi pi-table']" />
                        </template>
                    </SelectButton> -->
                    <Button icon="pi pi-download" label="Auto Asign" aria-label="Filter" class="p-button-sm" @click="emit('autoAssign')" :disabled="disableAutoAsssign"></Button>
                    <Button icon="pi pi-refresh" aria-label="Filter" class="p-button-sm" @click="emit('reloadOrders')"/>
                </div>
            </template>
            <template #grid="slotProps">
                <div class="grid grid-cols-12 gap-4">
                    <div v-for="(item, index) in slotProps.items" :key="index" class="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-4 p-2">
                        <div class="relative p-6 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded flex flex-col hover:cursor-pointer"
                             @click="editOrder(item)">
                            <div class="absolute mt-3 ml-2 w-28 right-0 transform rotate-45 translate-x-1 overflow-hidden">
                                <Tag
                                :value="item?.owner?.tier?.label" 
                                :style="{ '--tag-bg-color': `#${item?.owner?.tier?.value}` }"
                                class="w-full custom-tag"
                                />
                            </div>
                            <div class="pt-6">
                                <div class="flex flex-row justify-between items-start gap-2">
                                    <div>
                                        <h class="font-semibold text-2xl text-lime-600 dark:text-surface-400">{{ item.owner?.fullName }}</h>
                                        <div class="flex flex-row">
                                            <i class="pi pi-phone content-center"></i>
                                            <div class="ml-2 spac text-lg mt-1">{{ item.owner?.phone }}</div>
                                        </div>
                                        <span class="text-sm">{{ item.createdTime }}</span>
                                    </div>
                                    <div class="bg-surface-100 p-1" style="border-radius: 30px">
                                        <div class="bg-surface-0 flex items-center gap-2 justify-center py-1 px-2" style="border-radius: 30px; box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)">
                                            <i v-if="item.status == OrderStatus.Open" class="pi pi-star-fill text-yellow-500"></i>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex flex-col gap-6 mt-6">
                                    <span class="text-2xl font-semibold">{{ getPrice(item.price)}}</span>
                                    <div class="flex gap-2">
                                        <div class="bg-surface-50 flex justify-center rounded  w-4/5">
                                            <Tag :value="item.status" :severity="getOrderSeverity(item.status)" class="w-full"></Tag>
                                        </div>
                                        <Button class="w-1/5" icon="pi pi-heart" outlined></Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </DataView>
        <Paginator :totalRecords="totalRecords"  :rows="pageNumer" @page="onPageChange"  :rowsPerPageOptions="[10, 20, 30]"></Paginator>
    </div>
</template>

<script setup>
import { OrderStatus } from "@/helpers/constants";
import { ref, onMounted, computed } from "vue";
import { defineProps } from "vue";
import { Button, Tag, SelectButton, DataView  } from "primevue";
import Paginator from 'primevue/paginator';
import Order from "@/types/Order";
import {getOrderSeverity} from "@/helpers/order";

const props = defineProps({
    orders: {
        type: Array,
        default: [new Order({})]
    },
    pageSize: {
        type: Number,
        default: 10
    },
    pageNumer: {
        type: Number,
        default: 1
    },
    totalRecords: {
        type: Number,
        default: 1
    },
    currentPage: {
        type: Number,
        default: 1
    }
})

const disableAutoAsssign = computed(() => {
    return props.orders.filter(order => order.status == OrderStatus.Open).length > 0;
});
const emit = defineEmits(['changePaging', 'editOrder', 'reloadOrders', 'autoAssign']);

onMounted(() => {
    console.log("orders", props.orders)
});

const layout = ref('grid');
const options = ref(['list', 'grid']);


const getPrice = (order) => {
    if(order != null && order.bill != null){
        return "€ " + order.bill.price;
    }
    return '';
}

const onPageChange = (event) => {
    emit('changePaging', event)
};

const editOrder = (slotProps) => {
    emit('editOrder', slotProps)
    }
</script>

<style scoped>
:deep(.custom-tag) {
    background: var(--tag-bg-color) !important;
    color: white !important;
}
</style>
