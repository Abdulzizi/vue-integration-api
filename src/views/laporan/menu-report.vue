<template>
    <Layouts>
        <PageHeader title="Menu Laporan" pageTitle="Laporan" />

        <BCard>
            <BCardHeader>
                <BRow class="mb-3">
                    <!-- Date picker -->
                    <BCol md="3">
                        <Vueform :float-placeholders="false" v-model="selectedDates">
                            <DatesElement mode="range" label="Pilih Tanggal" placeholder="Pilih tanggal" name="dates"
                                @update:modelValue="(val) => { selectedDates.value = val; }" />
                        </Vueform>
                        <!-- <pre>{{ selectedDates }}</pre> -->
                    </BCol>

                    <!-- Form Filter Customer -->
                    <BCol md="3">
                        <Vueform :float-placeholders="false" v-model="selectedCategories" sync>
                            <TagsElement :items="categories" label-prop="name" value-prop="id" label="Pilih Category"
                                placeholder="Pilih Category" name="categories" :search="true" :multiple="true" />
                        </Vueform>
                    </BCol>

                    <!-- Export button -->
                    <BCol md="3" class="d-flex justify-content-end align-items-end gap-2 mt-4 ms-auto">
                        <BButton variant="success" @click="exportExcel">
                            <i class="mdi mdi-file-excel" />
                            Export Excel
                        </BButton>
                    </BCol>

                </BRow>
            </BCardHeader>

            <BCardBody>
                <!-- Scrollable Table Wrapper -->
                <div style="overflow-x: auto;">
                    <BTableSimple bordered class="table-sm">
                        <!-- <BTableSimple bordered class=""> -->
                        <BThead>
                            <BTr>
                                <BTh scope="col">Category</BTh>
                                <BTh :colspan="daysInMonth" class="text-center">
                                    {{ currentMonth }} {{ currentYear }}
                                </BTh>
                                <BTh scope="col">Total</BTh>
                            </BTr>
                            <BTr>
                                <BTh></BTh>
                                <BTh v-for="day in daysInMonth" :key="day" class="text-center">{{ day }}</BTh>
                                <BTh class="text-end">Grand Total</BTh>
                            </BTr>
                        </BThead>
                        <BTbody>
                            <BTr v-if="rows.length === 0">
                                <BTd colspan="daysInMonth + 2" class="text-center">
                                    Tidak ada data untuk ditampilkan
                                </BTd>
                            </BTr>
                            <BTr v-for="sale in rows" :key="sale.category_id">
                                <BTd>{{ sale.category_name }}</BTd>

                                <!-- Daily totals for each category -->
                                <BTd v-for="day in daysInMonth" :key="day" class="text-center">
                                    {{
                                        (() => {
                                            const total = sale.products.reduce((total, product) => {
                                                return (
                                                    total +
                                                    product.transactions.reduce((sum, transaction) => {
                                                        return new Date(transaction.date_transaction).getDate() === day
                                                            ? sum + transaction.total_sales
                                                            : sum;
                                                    }, 0)
                                                );
                                            }, 0);

                                            return total === 0 ? '' : total;
                                        })()
                                    }}
                                </BTd>

                                <BTd class="text-end">{{ sale.category_total }}</BTd>
                            </BTr>
                        </BTbody>
                    </BTableSimple>
                </div>
            </BCardBody>
        </BCard>
    </Layouts>
</template>

<script setup>
import { showErrorToast, showSuccessToast } from "@/helpers/alert.js";
import { useProgress } from "@/helpers/progress";
import { onMounted, ref, watch } from "vue";
import { useProductCategoryStore, useReportStore } from "../../state/pinia";

import PageHeader from "../../components/page-header.vue";
import Layouts from "../../layouts/main.vue";

const { startProgress, finishProgress, failProgress } = useProgress();

const reportStore = useReportStore();
const categoryStore = useProductCategoryStore();

const currentYear = new Date().getFullYear();
const currentMonth = new Date().toLocaleString("default", { month: "long" });
const daysInMonth = new Date(currentYear, new Date().getMonth() + 1, 0).getDate();

const selectedDates = ref([]);
const selectedCategories = ref([]);
const rows = ref([]);
const categories = ref([]);

const getReports = async () => {
    startProgress();
    try {
        await reportStore.getReports();

        rows.value = reportStore.reports || [];
        showSuccessToast("Data laporan menu berhasil diambil");
        finishProgress();
    } catch (error) {
        console.error("Error fetching reports:", error);
        rows.value = [];
        failProgress();
        showErrorToast("Terjadi kesalahan saat mengambil laporan menu");
    }
};

const getCategories = async () => {
    startProgress();
    await categoryStore.getCategories()
    if (categoryStore.categories) {
        finishProgress();

        categories.value = categoryStore.categories.map((category) => ({
            id: category.id,
            name: category.name
        })) || [];
    } else {
        failProgress();
        categories.value = [];
    }
}

watch(selectedCategories, async (newVal) => {
    reportStore.categoryId = newVal.categories;
    await getReports();
})

watch(selectedDates, async (newRange) => {
    // console.log("selectedDates", selectedDates.value);

    if (newRange && Array.isArray(newRange.dates) && newRange.dates.length === 2) {
        reportStore.startDate = newRange.dates[0];
        reportStore.endDate = newRange.dates[1];
        await getReports();
    } else {
        reportStore.startDate = '';
        reportStore.endDate = '';
        await getReports();
    }
});

const exportExcel = async () => {
    startProgress();
    try {
        await reportStore.exportExcel();
        finishProgress();
        showSuccessToast("Laporan menu berhasil diunduh");
    } catch (error) {
        console.error("Error exporting reports:", error);
        failProgress();
        showErrorToast("Terjadi kesalahan saat mengunduh laporan menu");
    }
}

onMounted(async () => {
    await getCategories();
    await getReports();
});
</script>

<style>
.b-card-body {
    padding: 1rem;
}

.table-sm {
    font-size: 0.875rem;
}

div[style*="overflow-x: auto"] {
    max-width: 100%;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
}
</style>