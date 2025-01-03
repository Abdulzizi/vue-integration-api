<template>
    <Layout>
        <PageHeader title="Produk" pageTitle="Produk" />
        <BRow>
            <BCol lg="12">
                <BCard no-body>
                    <BCardBody class="border-bottom ">
                        <div class="d-flex align-items-center">
                            <BCardTitle class="mb-0 flex-grow-1">Produk List</BCardTitle>
                            <div class="flex-shrink-0">
                                <BButton class="btn btn-primary me-1" @click="addProduct">Add Product
                                </BButton>
                                <BLink href="#!" class="btn btn-light me-1" @click="getProducts"><i
                                        class="mdi mdi-refresh"></i></BLink>
                            </div>
                        </div>
                    </BCardBody>

                    <BCardBody class="border-bottom">
                        <BRow class="g-3">
                            <BCol xxl="10" lg="8">
                                <BFormInput type="text" class="form-control search" placeholder="Search for ..."
                                    v-model="productStore.searchQuery" @keydown.enter="searchData" />
                            </BCol>
                            <BCol xxl="2" lg="4">
                                <BButton variant="soft-secondary" @click="searchData" class="w-100">
                                    <i class="mdi mdi-magnify align-middle"></i>
                                    Cari
                                </BButton>
                            </BCol>
                        </BRow>
                    </BCardBody>
                    <BCardBody>
                        <div class="table-responsive">
                            <BTableSimple class="align-middle dt-responsive nowrap w-100 table-check" id="user-list">
                                <BThead>
                                    <BTr>
                                        <BTh scope="col">Picture</BTh>
                                        <BTh scope="col">Name</BTh>
                                        <BTh scope="col">Category</BTh>
                                        <BTh scope="col">Status</BTh>
                                        <BTh scope="col">Price</BTh>
                                        <BTh scope="col"></BTh>
                                    </BTr>
                                </BThead>
                                <BTbody>
                                    <BTr v-for="product in rows" :key="product.id">
                                        <BTd>
                                            <span v-if="product.photo_url">
                                                <img :src="product.photo_url" style="width: 50px; height: 50px" />
                                            </span>
                                            <span v-else> No Image </span>
                                        </BTd>
                                        <BTd> {{ product.name }} </BTd>
                                        <BTd> {{ product.product_category_name }} </BTd>
                                        <BTd>
                                            <span v-if="product.is_available == 1">Available</span>
                                            <span v-else>Unavailable</span>
                                        </BTd>
                                        <BTd> {{ product.price }} </BTd>
                                        <BTd>
                                            <ul class="list-unstyled hstack gap-1 mb-0 justify-content-end">
                                                <li data-bs-toggle="tooltip" data-bs-placement="top" aria-label="Edit"
                                                    @click="editProduct(product.id)">
                                                    <BButton class="btn btn-sm btn-soft-info"><i
                                                            class="mdi mdi-pencil-outline"></i></BButton>
                                                </li>
                                                <li data-bs-toggle="tooltip" data-bs-placement="top" aria-label="Delete"
                                                    @click="deleteProduct(product.id)">
                                                    <BButton data-bs-toggle="modal" class="btn btn-sm btn-soft-danger">
                                                        <i class="mdi mdi-delete-outline"></i>
                                                    </BButton>
                                                </li>
                                            </ul>
                                        </BTd>
                                    </BTr>
                                </BTbody>
                            </BTableSimple>
                        </div>
                        <Pagination :currentPage="productStore.current" :totalRows="productStore.totalData"
                            :perPage="productStore.perpage" @update:currentPage="updatePage" />
                    </BCardBody>
                </BCard>
            </BCol>
        </BRow>
    </Layout>
</template>

<script setup>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Pagination from "@/components/widgets/pagination";
import { useProductStore } from "../../state/pinia";
import { onMounted, ref } from "vue";
import { useProgress } from "@/helpers/progress";
import { showSuccessToast, showErrorToast, showDeleteConfirmationDialog, } from "@/helpers/alert.js";
import { useRouter } from "vue-router";

const productStore = useProductStore()
const router = useRouter();
const { startProgress, finishProgress, failProgress } = useProgress();
const rows = ref([]);

const getProducts = async () => {
    startProgress();
    await productStore.getProducts()
    if (productStore.products) {
        finishProgress();
        rows.value = productStore.products || [];
    } else {
        failProgress();
        rows.value = [];
    }
}

const deleteProduct = async (id) => {
    const confirmed = await showDeleteConfirmationDialog()
    if (confirmed) {
        try {
            await productStore.deleteProduct(id);
            showSuccessToast("Produk berhasil dihapus");
            await getProducts();
        } catch (error) {
            showErrorToast("Terjadi kesalahan saat menghapus produk");
        }
    }
}

const addProduct = () => {
    productStore.openForm('add')
    router.push({ name: 'product-form', params: { product: '' } });
}

const editProduct = async (id) => {
    productStore.openForm('edit')
    router.push({ name: 'product-form' });
    await productStore.getProductById(id)
}

const updatePage = async (page) => {
    await productStore.changePage(page);
    await getProducts();
};

const searchData = async () => {
    await productStore.changePage(1);
    await getProducts();
};

onMounted(async () => {
    await getProducts()
})
</script>