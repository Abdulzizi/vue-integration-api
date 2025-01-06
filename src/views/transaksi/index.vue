<template>
    <Layout>
        <PageHeader title="Transaksi" pageTitle="Transaksi" />
        <BRow class="g-4">

            <BCol lg="8">
                <BCard class="shadow-sm">
                    <BCardBody>
                        <BRow class="mb-3 align-items-center">
                            <!-- Pilih customer -->
                            <BCol md="4">
                                <BFormSelect v-model="formModel.m_customer_id" @change="updateCustomerName">
                                    <BFormSelectOption :value="''" disabled>Pilih Customer</BFormSelectOption>
                                    <BFormSelectOption v-for="customer in rowsCustomer" :key="customer.id"
                                        :value="customer.id">
                                        {{ customer.name }}
                                    </BFormSelectOption>
                                </BFormSelect>
                                <template v-if="errorList?.m_customer_id">
                                    <div class="invalid-feedback" v-for="(err, index) in errorList.m_customer_id"
                                        :key="index">
                                        {{ err }}
                                    </div>
                                </template>
                            </BCol>

                            <!-- Search bar -->
                            <BCol md="8">
                                <BInputGroup>
                                    <BFormInput v-model="productStore.searchQuery" placeholder="Cari Produk..."
                                        @keydown.enter="searchData" />
                                    <BInputGroupAppend>
                                        <BButton variant="outline-secondary" @click="clearSearchData">
                                            <i class="mdi mdi-close"></i>
                                        </BButton>
                                    </BInputGroupAppend>

                                </BInputGroup>
                            </BCol>
                        </BRow>

                        <!-- Product grid -->
                        <BRow>
                            <BCol lg="4" md="6" v-for="product in rowsProduct" :key="product.id">
                                <BCard class="product-card">
                                    <BImg :src="product.photo_url" alt="Foto Produk" class="card-img-top" />
                                    <BCardBody class="text-center">
                                        <h6 class="card-title">{{ product.name }}</h6>
                                        <p class="card-text">Rp {{ product.price.toLocaleString() }}</p>
                                        <BButton variant="primary" @click="addToOrder(product)">
                                            <i class="mdi mdi-plus"></i> Tambah
                                        </BButton>
                                    </BCardBody>
                                </BCard>
                            </BCol>
                        </BRow>
                    </BCardBody>
                </BCard>
            </BCol>

            <!-- Sidebar (order detail) -->
            <BCol lg="4">
                <BCard class="shadow-sm">
                    <BCardBody>
                        <h5 class="mb-3">Detail Order</h5>
                        <p class="text-muted mb-3">{{ selectedCustomerName }}</p>

                        <!-- Order list -->
                        <div v-for="order in orders" :key="order.id" class="order-item d-flex align-items-center mb-3">
                            <BImg :src="order.photo_url" :alt="order.name" class="rounded me-3" height="60"
                                width="60" />
                            <div>
                                <h6 class="mb-1">{{ order.name }}</h6>
                                <small class="text-muted">Rp {{ order.price.toLocaleString() }}</small>
                            </div>
                            <BFormInput type="number" v-model="order.quantity" class="ms-auto" min="1"
                                style="width: 60px;" />
                            <BButton variant="danger" class="ms-2" @click="removeFromOrder(order.id)">
                                <i class="mdi mdi-close"></i>
                            </BButton>
                        </div>

                        <!-- Detail order -->
                        <div class="payment-summary">
                            <div class="d-flex justify-content-between">
                                <span>Subtotal</span>
                                <span>Rp {{ subtotal.toLocaleString() }}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>Tax 12%</span>
                                <span>Rp {{ tax.toLocaleString() }}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>Diskon 20%</span>
                                <span>- Rp {{ discount.toLocaleString() }}</span>
                            </div>
                            <div class="d-flex justify-content-between fw-bold">
                                <span>Total</span>
                                <span>Rp {{ total.toLocaleString() }}</span>
                            </div>
                        </div>
                        <BButton variant="primary" class="w-100 mt-3" @click="handleOrderSubmit">Proses Pesanan
                        </BButton>
                    </BCardBody>
                </BCard>
            </BCol>
        </BRow>
    </Layout>
</template>

<script setup>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { BButton } from "bootstrap-vue-next";
import { ref, computed, onMounted, reactive } from "vue";

import { showSuccessToast, showErrorToast } from "@/helpers/alert.js";
import { useProgress } from "@/helpers/progress";
import { useProductStore, useCustomerStore, useSaleStore } from "../../state/pinia";

const { startProgress, finishProgress, failProgress } = useProgress();
const orders = ref([]);

const formModel = reactive({
    m_customer_id: "",
    date: "",
    product_detail: []
});

const productStore = useProductStore();
const customerStore = useCustomerStore();
const saleStore = useSaleStore();

const rowsProduct = ref([]);
const rowsCustomer = ref([]);
const selectedCustomerName = ref("");

// computed value
const subtotal = computed(() => orders.value.reduce((sum, order) => sum + order.price * order.quantity, 0));
const tax = computed(() => subtotal.value * 0.12);
const discount = computed(() => subtotal.value * 0.2);
const total = computed(() => subtotal.value + tax.value - discount.value);

const errorList = computed(() => customerStore.response?.list || {});

const getProducts = async () => {
    try {
        startProgress();
        await productStore.getProducts()
        if (productStore.products) {
            finishProgress();
            rowsProduct.value = productStore.products || [];
        } else {
            failProgress();
            rowsProduct.value = [];
        }
    } catch (error) {
        console.error("Error Response:", error.response);
        rowsProduct.value = [];

        showErrorToast(error);
    }
}

const getCustomers = async () => {
    try {
        startProgress();
        await customerStore.getCustomers();

        if (customerStore.customers) {
            finishProgress();
            rowsCustomer.value = customerStore.customers || [];
        } else {
            failProgress();
            rowsCustomer.value = [];
        }
    } catch (error) {
        console.error("Error Response:", error.response);
        rowsCustomer.value = [];

        showErrorToast(error);
    }
}

const handleOrderSubmit = async () => {
    console.log('Submitting order:', formModel);

    if (!formModel.m_customer_id) {
        showErrorToast("Please select a customer.");
        return;
    }

    const orderData = {
        m_customer_id: formModel.m_customer_id,
        product_detail: orders.value.flatMap((order) => {
            if (order.details && order.details.length > 0) {
                return order.details.map((detail) => ({
                    m_product_id: order.id,
                    m_product_detail_id: detail.id,
                    total_item: order.quantity,
                    price: order.price,
                }));
            }
            return [];
        }),
    };

    // console.log('Order Data:', orderData);

    try {
        await saleStore.submitOrder(orderData);
        if (saleStore.response?.status === 200) {
            // Reset form and orders
            formModel.m_customer_id = '';
            formModel.product_detail = [];
            orders.value = [];
            showSuccessToast('Order submitted successfully!');
        }
    } catch (error) {
        console.error('Order submit error:', error);
        showErrorToast(error);
    }
};


const addToOrder = (product) => {
    // console.log('Adding product to order:', product);

    const existingOrder = orders.value.find((order) => order.id === product.id);

    if (!formModel.m_customer_id) {
        showErrorToast('Please select a customer first.');
    }

    if (existingOrder) {
        existingOrder.quantity++;
    } else {
        const newOrder = {
            id: product.id,
            name: product.name,
            photo_url: product.photo_url,
            price: product.price,
            quantity: 1,
            details: product.details || [],
        };
        orders.value.push(newOrder);
    }

    // console.log('Updated orders:', orders.value);

    formModel.product_detail = orders.value.flatMap(order => {
        return order.details.map(detail => ({
            m_product_id: order.id,
            m_product_detail_id: detail.id,
            total_item: order.quantity,
            price: order.price,
        }));
    });

};

const removeFromOrder = (id) => {
    orders.value = orders.value.filter((order) => order.id !== id);
};

const updateCustomerName = () => {
    const customer = rowsCustomer.value.find((customer) => customer.id === formModel.m_customer_id);
    if (customer) {
        selectedCustomerName.value = customer.name;
        console.log('Selected Customer:', formModel.m_customer_id, customer);
    } else {
        console.error('Customer not found!');
    }
};


const searchData = async () => {
    try {
        console.log('Search Query:', productStore.searchQuery);
        await productStore.searchProduct(productStore.searchQuery);
    } catch (error) {
        rowsProduct.value = [];
        showErrorToast(error);
    }
};

const clearSearchData = () => {
    productStore.value.searchQuery = "";
};


onMounted(async () => {
    await getProducts();
    await getCustomers();
});
</script>

<style scoped>
.product-card {
    border: 1px solid #ddd;
    border-radius: 8px;
}

.payment-summary div {
    margin-bottom: 8px;
}
</style>
