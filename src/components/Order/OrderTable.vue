<template>
    <div class="card">
        <DataView :value="orders" :layout="layout">
            <template #header>
                <div class="flex justify-end">
                    <SelectButton v-model="layout" :options="options" :allowEmpty="false">
                        <template #option="{ option }">
                            <i :class="[option === 'list' ? 'pi pi-bars' : 'pi pi-table']" />
                        </template>
                    </SelectButton>
                </div>
            </template>

            <template #list="slotProps">
                <div class="flex flex-col">
                    <div v-for="(item, index) in slotProps" :key="index">
                        <div class="flex flex-col sm:flex-row sm:items-center p-6 gap-4" :class="{ 'border-t border-surface-200 dark:border-surface-700': index !== 0 }">
                            <Tag :value="item.status" :severity="getOrderSeverity(item.status)"></Tag>
                            <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6">
                                <div class="flex flex-row md:flex-col justify-between items-start gap-2">
                                    <div>
                                        <span class="font-medium text-surface-500 dark:text-surface-400 text-sm">{{ item.ownerName }}</span>
                                    </div>
                                    <div v-if="item.status == OrderStatus.Open" class="bg-surface-100 p-1" style="border-radius: 30px">
                                        <div class="bg-surface-0 flex items-center gap-2 justify-center py-1 px-2" style="border-radius: 30px; box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)">
                                            <i class="pi pi-star-fill texst-yellow-500"></i>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex flex-col md:items-end gap-8">
                                    <span class="text-xl font-semibold">{{ getPrice(item.price)}}</span>
                                    <div class="flex flex-row-reverse md:flex-row gap-2">
                                        <Button icon="pi pi-heart" outlined></Button>
                                        <Button icon="pi pi-shopping-cart" label="Update" class="flex-auto md:flex-initial whitespace-nowrap"></Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <template #grid="slotProps">
                <div class="grid grid-cols-12 gap-4">
                    <div v-for="(item, index) in slotProps.items" :key="index" class="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-4 p-2">
                        <div class="p-6 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded flex flex-col">
                            <div class="bg-surface-50 flex justify-center rounded h-2/5">
                                <Tag :value="item.status" :severity="getOrderSeverity(item.status)" class="w-full"></Tag>
                            </div>
                            <div class="pt-6">
                                <div class="flex flex-row justify-between items-start gap-2">
                                    <div>
                                        <span class="font-medium text-surface-500 dark:text-surface-400 text-sm">{{ item.ownerName }}</span>
                                        <div class="flex flex-row">
                                            <i class="pi pi-phone content-center"></i>
                                            <div class="ml-2 spac text-lg mt-1">{{ item.ownerPhone }}</div>
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
                                        <Button icon="pi pi-shopping-cart" 
                                            label="Update" 
                                            class="flex-auto whitespace-nowrap"
                                            @click="editOrder(item)"></Button>
                                        <Button icon="pi pi-heart" outlined></Button>
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
import { ref, onMounted } from "vue";
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

const emit = defineEmits(['changePaging', 'editOrder']);

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
