<template>
    <Layouts>
        <PageHeader title="Laporan Penjualan" pageTitle="Laporan" />

        <BRow class="mb-3">
            <BCol md="3">
                <BFormGroup label="Start Date" label-size="sm">
                    <BFormInput v-model="saleStore.startDate" type="date" class="mb-2" />
                </BFormGroup>
                <BFormGroup label="End Date" label-size="sm">
                    <BFormInput v-model="saleStore.endDate" type="date" />
                </BFormGroup>
            </BCol>

            <BCol md="3">
                <Vueform>
                    <TagsElement v-model="selectedCustomers" :items="customers" :multiple="true" label="Pilih Pelanggan"
                        name="customers" placeholder="Cari pelanggan" :search="true" :clearable="true" />
                </Vueform>
                <p v-if="selectedCustomers.length > 0">Selected Customers: {{ selectedCustomers.join(', ') }}</p>
            </BCol>

            <BCol md="3">
                <Vueform>
                    <TagsElement name="menus" :items="menus" :multiple="true" label="Pilih Menu" placeholder="Cari menu"
                        :search="true" :clearable="true" />
                </Vueform>
            </BCol>

            <BCol md="3" class="d-flex justify-content-end align-items-end gap-2">
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

        <BCard>
            <BTableSimple>
                <BThead>
                    <BTr>
                        <BTh>No</BTh>
                        <BTh>Customer</BTh>
                        <BTh>Tanggal</BTh>
                        <BTh>Menu</BTh>
                        <BTh>Total</BTh>
                    </BTr>
                </BThead>
                <BTbody>
                    <BTr v-for="(sale) in filteredRows" :key="sale.id">
                        <BTd>{{ sale.id }}</BTd>
                        <BTd>{{ sale.customer }}</BTd>
                        <BTd>{{ sale.tanggal }}</BTd>
                        <BTd>{{ sale.menu }}</BTd>
                        <BTd>{{ sale.total }}</BTd>
                    </BTr>
                </BTbody>
            </BTableSimple>

            <Pagination :currentPage="saleStore.current" :totalRows="saleStore.totalData" :perPage="saleStore.perPage"
                @update:currentPage="updatePage" />
        </BCard>
    </Layouts>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useSaleStore } from '@/state/pinia'

import PageHeader from '../../components/page-header.vue'
import Pagination from '../../components/widgets/pagination.vue'
import Layouts from '../../layouts/main.vue'

const saleStore = useSaleStore();
const selectedCustomers = ref([])

const rows = ref([
    { id: 1, customer: "Bintang Ramadhan", tanggal: "10 Juni 2022", menu: "Rice Bowl BBW", total: "15.000" },
    { id: 2, customer: "John Doe", tanggal: "15 Juni 2022", menu: "Lalapan Usus", total: "10.000" },
    { id: 3, customer: "Jane Smith", tanggal: "20 Juni 2022", menu: "Tahu Bakso", total: "25.000" },
    { id: 4, customer: "Mike Johnson", tanggal: "25 Juni 2022", menu: "Bakmie Goreng", total: "20.000" },
])

const customers = ref([
    { value: 1, label: 'John Doe' },
    { value: 2, label: 'Jane Smith' },
    { value: 3, label: 'Mike Johnson' },
    { value: 4, label: 'Sarah Williams' }
])

const menus = [
    'Tempe Mendoan',
    'Lalapan Usus',
    'Bakmie Goreng/Kuah',
    'Tahu Bakso',
    'Tahu Walik'
]

const fetchRows = async () => {
    // Simulate fetching rows, you can adjust based on filters
    saleStore.totalData = rows.value.length; // Update total count based on actual data
};

// Computed property for filtered rows based on selected customers
const filteredRows = computed(() => {
    if (selectedCustomers.value.length === 0) return rows.value;
    return rows.value.filter(row => selectedCustomers.value.includes(row.customer));
})

const updatePage = async (page) => {
    await saleStore.changePage(page);
}

onMounted(async () => {
    await fetchRows();
})
</script>
