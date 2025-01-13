<template>
    <Layouts>
        <PageHeader title="Laporan Penjualan" pageTitle="Laporan" />

        <BRow class="mb-3">

            <!-- Date picker -->
            <BCol md="3">
                <Vueform :float-placeholders="false" v-model="selectedDates">
                    <DatesElement mode="range" label="Pilih Tanggal" placeholder="Pilih tanggal" name="dates"
                        @update:modelValue="(val) => { selectedDates.value = val; }" />
                </Vueform>
                <!-- <pre>{{ selectedDates }}</pre> -->
            </BCol>

            <BCol md="3">
                <!-- Customer Picker -->
                <Vueform :float-placeholders="false" v-model="selectedCustomers">
                    <TagsElement :items="customers" label-prop="name" value-prop="id" label="Pilih Pelanggan"
                        placeholder="Pilih Customer" name="customers" :search="true" :clearable="true"
                        :multiple="true" />
                </Vueform>
            </BCol>

            <BCol md="3">
                <!-- Menu Picker -->
                <Vueform :float-placeholders="false" v-model="selectedMenus">
                    <TagsElement :items="menus" label-prop="name" value-prop="id" label="Pilih Menu"
                        placeholder="Pilih Menu" name="menus" :search="true" :clearable="true" :multiple="true" />
                </Vueform>
            </BCol>


            <!-- Export button -->
            <BCol md="3" class="d-flex justify-content-end align-items-end gap-2 mt-4 md:mt-0">
                <BButton variant="danger">
                    <i class="mdi mdi-file-pdf" />
                    Export PDF
                </BButton>
                <BButton variant="success">
                    <i class="mdi mdi-file-excel" />
                    Export Excel
                </BButton>
            </BCol>
        </BRow>

        <!-- Table report -->
        <BCard>
            <BTableSimple>
                <BThead>
                    <BTr>
                        <BTh>No</BTh>
                        <BTh>Customer</BTh>
                        <BTh>Tanggal</BTh>
                        <BTh>Menu</BTh>

                        <BTh>Jumlah</BTh>
                        <BTh>Harga</BTh>

                        <BTh>Total</BTh>
                    </BTr>
                </BThead>
                <BTbody>

                    <BTr v-if="rows.length === 0" class="my-3">
                        <BTd colspan="7" class="text-center">There is no data with selected filter</BTd>
                    </BTr>

                    <BTr v-for="(sale, index) in rows" :key="sale.id">
                        <BTd>{{ index + 1 }}</BTd>
                        <BTd>{{ sale.customer }}</BTd>
                        <BTd>{{ sale.tanggal }}</BTd>
                        <BTd>{{ sale.menu }}</BTd>

                        <BTd>{{ sale.quantity }}</BTd>
                        <BTd>{{ sale.price }}</BTd>

                        <BTd>{{ sale.total }}</BTd>
                    </BTr>
                </BTbody>
            </BTableSimple>

            <!-- Pagination -->
            <Pagination :currentPage="saleStore.current" :totalRows="rowLength" :perPage="saleStore.perPage"
                @update:currentPage="updatePage" />
        </BCard>
    </Layouts>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useSaleStore, useCustomerStore, useProductStore } from '@/state/pinia';

import { useProgress } from "@/helpers/progress";
import PageHeader from '../../components/page-header.vue';
import Pagination from '../../components/widgets/pagination.vue';
import Layouts from '../../layouts/main.vue';

const { startProgress, finishProgress, failProgress } = useProgress();

const saleStore = useSaleStore();
const productStore = useProductStore();
const customerStore = useCustomerStore();

const rowLength = computed(() => rows.value.length);

const selectedCustomers = ref([]);
const selectedMenus = ref([]);
const selectedDates = ref([]);

const rows = ref([]);
const customers = ref([]);
const menus = ref([]);

const getSales = async () => {
    startProgress();
    console.log("Sales Data:", saleStore.sales);

    await saleStore.getSales()
    if (saleStore.sales) {
        finishProgress();

        // reformat sales
        rows.value = saleStore.sales.reduce((acc, sale) => {
            const { customer_name: customer, date: tanggal, details } = sale;

            const saleRows = details.map(detail => ({
                id: detail.id,
                customer,
                tanggal,
                menu: detail.product_name,
                quantity: detail.total_item,
                price: parseFloat(detail.price).toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
                total: parseFloat(detail.price * detail.total_item).toLocaleString("id-ID", { style: "currency", currency: "IDR" })
            }));

            return acc.concat(saleRows);
        }, []);
        // console.log("Sales length:", rows.value.length);

    } else {
        failProgress();
        menus.value = [];
    }
}

const getCustomers = async () => {
    startProgress();
    await customerStore.getCustomers();

    if (customerStore.customers) {
        finishProgress();

        // ekstrak nama customer
        customers.value = customerStore.customers.map((customer) => ({
            name: customer.name,
            id: customer.id
        })) || [];
    } else {
        failProgress();
        customers.value = [];
    }
}

const getProducts = async () => {
    startProgress();
    await productStore.getProducts()
    if (productStore.products) {
        finishProgress();

        // ekstrak nama menu
        menus.value = productStore.products.map((product) => ({
            name: product.name,
            id: product.id
        })) || [];
    } else {
        failProgress();
        menus.value = [];
    }
}

const updatePage = async (page) => {
    saleStore.current = page;
    await getSales();
};

watch(selectedCustomers, async (newVal) => {
    saleStore.customerId = newVal.customers;
    await getSales();
});

watch(selectedMenus, async (newVal) => {
    saleStore.productId = newVal.menus;
    await getSales();
});

watch(selectedDates, async (newRange) => {
    if (newRange && Array.isArray(newRange.dates) && newRange.dates.length === 2) {
        saleStore.dateFrom = newRange.dates[0];
        saleStore.dateTo = newRange.dates[1];
        await getSales();
    } else {
        saleStore.dateFrom = '';
        saleStore.dateTo = '';
        await getSales();
    }
});

onMounted(async () => {
    await getSales();
    await getCustomers();
    await getProducts();
});
</script>
