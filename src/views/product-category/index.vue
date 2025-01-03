<template>
    <Layout>
        <PageHeader title="Kategori Produk" pageTitle="Kategori Produk" />
        <BRow>
            <BCol lg="12">
                <BCard no-body>
                    <BCardBody class="border-bottom">
                        <div class="d-flex align-items-center">
                            <BCardTitle class="mb-0 flex-grow-1">Kategori Produk List</BCardTitle>
                            <div class="flex-shrink-0">
                                <BButton class="btn btn-primary me-1" @click="openFormModal('add', null)">Add Category
                                </BButton>
                                <BModal v-model="isOpenForm" size="lg" id="modal-standard" :title="modalTitle"
                                    title-class="font-18" ok-title="Simpan" @ok="saveCategory" @hide.prevent
                                    @cancel="isOpenForm = false; productCategoryStore.resetState(); getCategories()"
                                    @close="isOpenForm = false; productCategoryStore.resetState(); getCategories()">
                                    <BCol cols="12" class="mt-4">
                                        <BForm>
                                            <BRow class="mb-3">
                                                <label class="col-md-2 col-form-label" for="form-name">Name</label>
                                                <BCol md="10">
                                                    <input class="form-control" :class="{
                                                        'is-invalid': !!(errorList && errorList.name),
                                                    }" id="form-name" placeholder="Masukkan Nama Kategori Produk"
                                                        v-model="formModel.name" />
                                                    <template v-if="!!(errorList && errorList.name)">
                                                        <div class="invalid-feedback"
                                                            v-for="(err, index) in errorList.name" :key="index">
                                                            <span>{{ err }}</span>
                                                        </div>
                                                    </template>
                                                </BCol>
                                            </BRow>
                                        </BForm>
                                    </BCol>
                                </BModal>
                            </div>
                        </div>
                    </BCardBody>
                    <BCardBody class="border-bottom">
                        <BRow class="g-3">
                            <BCol xxl="10" lg="8">
                                <BFormInput type="text" class="form-control search" placeholder="Search for ..."
                                    v-model="productCategoryStore.searchQuery" @keydown.enter="searchData" />
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
                            <BTableSimple>
                                <BThead>
                                    <BTr>
                                        <BTh scope="col">Name</BTh>
                                    </BTr>
                                </BThead>
                                <BTbody>
                                    <BTr v-for="categories in rows" :key="categories.id">
                                        <BTd>{{ categories.name }}</BTd>
                                        <BTd>
                                            <ul class="list-unstyled hstack gap-1 mb-0 justify-content-end">
                                                <li data-bs-toggle="tooltip" data-bs-placement="top" aria-label="Edit"
                                                    @click="openFormModal('edit', categories.id)">
                                                    <BButton class="btn btn-sm btn-soft-info"><i
                                                            class="mdi mdi-pencil-outline"></i>
                                                    </BButton>
                                                </li>
                                                <li data-bs-toggle="tooltip" data-bs-placement="top" aria-label="Delete"
                                                    @click="deleteCategory(categories.id)">
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
                        <Pagination :currentPage="productCategoryStore.current"
                            :totalRows="productCategoryStore.totalData" :perPage="productCategoryStore.perpage"
                            @update:currentPage="updatePage" />
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
import { onMounted, ref, computed, reactive } from "vue";
import { useProductCategoryStore } from "@/state/pinia";
import { useProgress } from "@/helpers/progress"; // Import custom progress function
import { showSuccessToast, showErrorToast, showDeleteConfirmationDialog } from "@/helpers/alert.js";

const { startProgress, finishProgress, failProgress } = useProgress();
const productCategoryStore = useProductCategoryStore();
const statusCode = computed(() => productCategoryStore.error.status)
const errorList = computed(() => productCategoryStore.error?.list || {})
const errorMessage = computed(() => productCategoryStore.error?.message || "")

var isOpenForm = ref(false);
var modalTitle = ref(false);
var rows = ref([]);

const getCategories = async () => {
    startProgress();
    await productCategoryStore.getCategories()
    if (productCategoryStore.categories) {
        finishProgress();
        rows.value = productCategoryStore.categories || [];
    } else {
        failProgress();
        rows.value = [];
    }
}

const formModel = reactive({
    id: "",
    name: "",
});

const openFormModal = (mode, id = null) => {
    isOpenForm.value = true;
    if (mode === "edit" && id) {
        const category = rows.value.find((cat) => cat.id === id);
        if (category) {
            formModel.id = category.id;
            formModel.name = category.name
            modalTitle.value = "Ubah Kategori";
        }
    } else {
        formModel.id = "";
        formModel.name = ""
        modalTitle.value = "Tambah Kategori";
    }
};

const saveCategory = async () => {
    try {
        if (formModel.id) {
            await productCategoryStore.updateCategory(formModel);
            if (statusCode.value != 200) {
                showErrorToast("Failed to add category", errorMessage.value);
            } else {
                isOpenForm.value = false;
                await getCategories()
                showSuccessToast("Category added successfully!");
            }
        } else {
            await productCategoryStore.addCategory(formModel);
            if (statusCode.value != 200) {
                showErrorToast("Failed to add category", errorMessage.value);
            } else {
                isOpenForm.value = false;
                await getCategories()
                showSuccessToast("Category added successfully!");
            }
        }
    } catch (error) {
        console.error(error);
        showErrorToast("Failed to add category", errorMessage.value);
    }
};

const deleteCategory = async (id) => {
    const confirmed = await showDeleteConfirmationDialog()
    if (confirmed) {
        try {
            await productCategoryStore.deleteCategory(id);
            showSuccessToast("Kategori berhasil dihapus");
            await getCategories();
        } catch (error) {
            showErrorToast("Terjadi kesalahan saat menghapus user");
        }
    }
}

const updatePage = async (page) => {
    await productCategoryStore.changePage(page);
    await getCategories();
};

const searchData = async () => {
    await productCategoryStore.changePage(1);
    await getCategories();
};

onMounted(async () => {
    await getCategories()
})
</script>