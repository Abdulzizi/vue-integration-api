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
                                    <BFormSelectOption v-for="customer in customers" :key="customer.id"
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
                            <BCol lg="4" md="6" v-for="product in products" :key="product.id">
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
                        <p class="text-muted mb-3">{{ formModel.customer_name }}</p>

                        <!-- Order list -->
                        <div v-for="order in orders" :key="order.id" class="order-item d-flex align-items-center mb-3">
                            <BImg :src="order.image" alt="Order Item" class="rounded me-3" height="60" width="60" />
                            <div>
                                <h6 class="mb-1">{{ order.title }}</h6>
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
                        <BButton variant="primary" class="w-100 mt-3">Proses Pesanan</BButton>
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
import { ref, computed } from "vue";

// dummy data
const customers = ref([
    { id: 1, name: "Aditya Putra" },
    { id: 2, name: "Andi Surya" },
    { id: 3, name: "Abdul Jawad Azizi" }

]);
const products = ref([
    { id: 1, name: "Nasi Goreng", price: 15000, photo_url: "path-to-image" },
    { id: 2, name: "Mie Goreng", price: 12000, photo_url: "path-to-image" },
    { id: 3, name: "Sate", price: 20000, photo_url: "path-to-image" },
    { id: 4, name: "Gado-Gado", price: 10000, photo_url: "path-to-image" },
    { id: 5, name: "Es Teler", price: 8000, photo_url: "path-to-image" },
]);

const orders = ref([]);
const formModel = ref({ m_customer_id: "", customer_name: "" });
const productStore = ref({ searchQuery: "" });
const errorList = ref({});

// computed value
const subtotal = computed(() => orders.value.reduce((sum, order) => sum + order.price * order.quantity, 0));
const tax = computed(() => subtotal.value * 0.12);
const discount = computed(() => subtotal.value * 0.2);
const total = computed(() => subtotal.value + tax.value - discount.value);

const addToOrder = (product) => {
    const existingOrder = orders.value.find((order) => order.id === product.id);
    if (existingOrder) {
        existingOrder.quantity++;
    } else {
        orders.value.push({ ...product, quantity: 1 });
    }
};

const removeFromOrder = (id) => {
    orders.value = orders.value.filter((order) => order.id !== id);
};

const updateCustomerName = () => {
    const customer = customers.value.find((c) => c.id === formModel.value.m_customer_id);
    formModel.value.customer_name = customer ? customer.name : "";
};

const searchData = () => {
    console.log(`Searching for: ${productStore.value.searchQuery}`);
};

const clearSearchData = () => {
    productStore.value.searchQuery = "";
};
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
