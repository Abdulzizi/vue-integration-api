<template>
    <Layout>
        <PageHeader title="Customers List" pageTitle="Customers" />

        <BRow>
            <BCol lg="12">
                <BCard no-body>
                    <BCardBody class="border-bottom">
                        <div class="d-flex align-items-center">
                            <BCardTitle class="mb-0 flex-grow-1">Customer List</BCardTitle>
                            <div class="flex-shrink-0">
                                <BButton class="btn btn-primary me-1" @click="openFormModal('add', null)">Add Customer
                                </BButton>
                                <BModal v-model="isOpenForm" size="lg" id="modal-standard" :title="modalTitle"
                                    title-class="font-18" ok-title="Save" @ok="saveCustomer" @hide.prevent
                                    @cancel="isOpenForm = false; customerStore.resetState(); getCustomers()"
                                    @close="isOpenForm = false; customerStore.resetState(); getCustomers()">
                                    <BRow>
                                        <BCol cols="12">
                                            <ImageCropper :aspectRatio="1 / 1"
                                                :uploadText="'Drop photo here or click to upload'"
                                                @update:imageUrl="imageUrl = $event" @update:croppedImageUrl="
                                                    croppedImageUrl = $event;
                                                formModel.photo = $event;
                                                " />
                                        </BCol>
                                        <BCol cols="12" class="mt-4">
                                            <BForm class="form-horizontal" role="form">
                                                <BRow class="mb-3">
                                                    <label class="col-md-2 col-form-label" for="form-name">Name</label>
                                                    <BCol md="10">
                                                        <input class="form-control" :class="{
                                                            'is-invalid': !!(errorList && errorList.name),
                                                        }" id="form-name" placeholder="Enter Name"
                                                            v-model="formModel.name" />
                                                        <template v-if="!!(errorList && errorList.name)">
                                                            <div class="invalid-feedback"
                                                                v-for="(err, index) in errorList.name" :key="index">
                                                                <span>{{ err }}</span>
                                                            </div>
                                                        </template>
                                                    </BCol>
                                                </BRow>

                                                <BRow class="mb-3">
                                                    <label class="col-md-2 col-form-label"
                                                        for="form-email">Email</label>
                                                    <BCol md="10">
                                                        <input class="form-control" :class="{
                                                            'is-invalid': !!(errorList && errorList.email),
                                                        }" id="form-email" type="email" placeholder="Enter Email"
                                                            v-model="formModel.email" />
                                                        <template v-if="!!(errorList && errorList.email)">
                                                            <div class="invalid-feedback"
                                                                v-for="(err, index) in errorList.email" :key="index">
                                                                <span>{{ err }}</span>
                                                            </div>
                                                        </template>
                                                    </BCol>
                                                </BRow>
                                                <BRow class="mb-3">
                                                    <label class="col-md-2 col-form-label"
                                                        for="form-password">Password</label>
                                                    <BCol md="10">
                                                        <input class="form-control" :class="{
                                                            'is-invalid': !!(errorList && errorList.password),
                                                        }" id="form-password" type="password"
                                                            placeholder="Enter Password" v-model="formModel.password" />
                                                        <template v-if="!!(errorList && errorList.password)">
                                                            <div class="invalid-feedback"
                                                                v-for="(err, index) in errorList.password" :key="index">
                                                                <span>{{ err }}</span>
                                                            </div>
                                                        </template>
                                                    </BCol>
                                                </BRow>

                                                <BRow class="mb-3">
                                                    <label for="form-phone"
                                                        class="col-md-2 col-form-label">Phone</label>
                                                    <BCol md="10">
                                                        <input class="form-control" :class="{
                                                            'is-invalid': !!(errorList && errorList.phone),
                                                        }" id="form-phone" type="text" placeholder="Enter Phone"
                                                            v-model="formModel.phone" />
                                                        <template v-if="!!(errorList && errorList.phone)">
                                                            <div class="invalid-feedback"
                                                                v-for="(err, index) in errorList.phone" :key="index">
                                                                <span>{{ err }}</span>
                                                            </div>
                                                        </template>
                                                    </BCol>
                                                </BRow>
                                            </BForm>
                                        </BCol>
                                    </BRow>

                                    <BRow class="mb-3">
                                        <label class="col-md-2 col-form-label" for="form-address">Address</label>
                                        <BCol md="10">
                                            <textarea class="form-control" :class="{
                                                'is-invalid': !!(errorList && errorList.address),
                                            }" id="form-address" placeholder="Enter Address"
                                                v-model="formModel.address"></textarea>
                                            <template v-if="!!(errorList && errorList.address)">
                                                <div class="invalid-feedback" v-for="(err, index) in errorList.address"
                                                    :key="index">
                                                    <span>{{ err }}</span>
                                                </div>
                                            </template>
                                        </BCol>
                                    </BRow>

                                </BModal>
                                <BLink href="#!" class="btn btn-light me-1" @click="getCustomers"><i
                                        class="mdi mdi-refresh"></i></BLink>
                            </div>
                        </div>
                    </BCardBody>

                    <BCardBody class="border-bottom">
                        <BRow class="g-3">
                            <BCol xxl="10" lg="8">
                                <BFormInput type="text" class="form-control search" placeholder="Search for ..."
                                    v-model="customerStore.searchQuery" />
                            </BCol>

                            <BCol xxl="2" lg="4">
                                <BButton variant="soft-secondary" @click="searchData" class="w-100">
                                    <i class="mdi mdi-magnify align-middle"></i>
                                    Search
                                </BButton>
                            </BCol>
                        </BRow>
                    </BCardBody>

                    <BCardBody>
                        <div class="table-responsive">
                            <BTableSimple class="align-middle dt-responsive nowrap w-100 table-check"
                                id="customer-list">
                                <BThead>
                                    <BTr>
                                        <BTh scope="col">Name</BTh>
                                        <BTh scope="col">Address</BTh>
                                        <BTh scope="col">Phone</BTh>
                                        <BTh scope="col"></BTh>
                                    </BTr>
                                </BThead>

                                <BTbody>
                                    <BTr v-for="customer in rows" :key="customer.id">
                                        <BTd> {{ customer.name }} </BTd>
                                        <BTd> {{ customer.address }} </BTd>
                                        <BTd> {{ customer.phone }} </BTd>
                                        <BTd>
                                            <ul class="list-unstyled hstack gap-1 mb-0 justify-content-end">
                                                <li data-bs-toggle="tooltip" data-bs-placement="top" aria-label="Edit"
                                                    @click="openFormModal('edit', customer.id)">
                                                    <BButton class="btn btn-sm btn-soft-info"><i
                                                            class="mdi mdi-pencil-outline"></i>
                                                    </BButton>
                                                </li>
                                                <li data-bs-toggle="tooltip" data-bs-placement="top" aria-label="Delete"
                                                    @click="deleteCustomer(customer.id)">
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

                        <Pagination :currentPage="customerStore.current" :totalRows="customerStore.totalData"
                            :perPage="customerStore.perpage" @update:currentPage="updatePage" />
                    </BCardBody>
                </BCard>
            </BCol>
        </BRow>
    </Layout>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from "vue";
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Pagination from "@/components/widgets/pagination";
import { useCustomerStore } from "@/state/pinia";
import { useProgress } from "@/helpers/progress"; // Import custom progress function

const { startProgress, finishProgress, failProgress } = useProgress();
import ImageCropper from "@/components/widgets/cropper";
import {
    showSuccessToast,
    showErrorToast,
    showDeleteConfirmationDialog,
} from "@/helpers/alert.js";
import { BCard, BCol, BRow } from "bootstrap-vue-next";


const customerStore = useCustomerStore();

const rows = ref([]);
const isOpenForm = ref(false);
const modalTitle = ref("");

const getCustomers = async () => {
    startProgress();
    await customerStore.getCustomers();

    if (customerStore.customers) {
        finishProgress();
        rows.value = customerStore.customers || [];
    } else {
        failProgress();
        rows.value = [];
    }
}

const updatePage = async (page) => {
    await customerStore.changePage(page);
    await getCustomers();
}

const searchData = async () => {
    // console.log('Search Query:', customerStore.searchQuery);
    // console.log('Current Page:', customerStore.current);

    await customerStore.searchCustomer(customerStore.searchQuery);
}

const imageUrl = ref("");
const croppedImageUrl = ref("");

const formModel = reactive({
    id: "",
    name: "",
    address: "",
    photo: "",
    phone: "",
    email: "",
    password: "",
    m_user_id: ""
});


const openFormModal = (mode, id = null) => {
    isOpenForm.value = true;
    if (mode === 'edit' && id) {
        const customer = rows.value.find((customer) => customer.id === id);
        // console.log(customer);

        if (customer) {
            formModel.id = customer.id;
            formModel.name = customer.name;
            formModel.address = customer.address;
            formModel.photo = customer.photo;
            formModel.phone = customer.phone;
            formModel.email = customer.email;
            formModel.m_user_id = customer.m_user_id;
            formModel.password = "";
            modalTitle.value = "Ubah Customer";

            imageUrl.value = customer.photo || "";
            croppedImageUrl.value = "";
        }
    } else {
        formModel.id = "";
        formModel.name = "";
        formModel.address = "";
        formModel.photo = "";
        formModel.phone = "";
        formModel.email = "";
        formModel.password = "";
        formModel.m_user_id = "";
        modalTitle.value = "Add Customer";

        imageUrl.value = "";
        croppedImageUrl.value = "";
    }
}

const statusCode = computed(() => customerStore.response.status);
const errorList = computed(() => customerStore.response?.list || {});
const errorMessage = computed(() => customerStore.response?.message || "");

const saveCustomer = async () => {
    console.log("Form Data:", formModel);

    try {
        if (formModel.id) {
            await customerStore.updateCustomer(formModel);
            if (statusCode.value != 200) {
                showErrorToast("Failed to edit customer", errorMessage.value);
            } else {
                isOpenForm.value = false;
                await getCustomers(); // Refresh the customer list after update
                showSuccessToast("Customer edited successfully!");
            }
        } else {
            await customerStore.addCustomer(formModel);

            if (statusCode.value != 200) {
                showErrorToast("Failed to add customer", errorMessage.value);
            } else {
                isOpenForm.value = false;
                await getCustomers(); // Refresh the customer list after addition
                showSuccessToast("Customer added successfully!");
            }
        }
    } catch (error) {
        console.error(error);
        showErrorToast("Failed to add customer", errorMessage.value);
    }
}

const deleteCustomer = async (id) => {
    const confirmed = await showDeleteConfirmationDialog();

    if (confirmed) {
        try {
            await customerStore.deleteCustomer(id);
            showSuccessToast("Customer deleted successfully");
            await getCustomers();
        } catch (error) {
            showErrorToast("Failed to delete customer", errorMessage.value);
        }
    }
}

onMounted(async () => {
    await getCustomers();
});

</script>