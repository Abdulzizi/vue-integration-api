import { defineStore } from "pinia";
import axios from "axios";

export const useCustomerStore = defineStore("customer", {
  state: () => ({
    apiUrl: process.env.VUE_APP_APIURL || "http://127.0.0.1:8000",
    customers: [],
    customer: null,
    response: {
      status: null,
      message: null,
      error: [],
    },
    modalAction: {
      action: "",
      modal_title: "",
      modal_button: "",
    },
    totalData: 0,
    current: 1,
    perPage: 5,
    searchQuery: "",
  }),

  actions: {
    async getCustomers() {
      try {
        const url = `${this.apiUrl}/api/v1/customers?page=${this.current}&per_page=${this.perPage}&name=${this.searchQuery}`;
        const res = await axios.get(url);

        this.customers = res.data.data.list || [];
        this.totalData = res.data.data.meta.total || 0;
      } catch (error) {
        this.response = {
          status: error.response?.status,
          message: error.message,
        };
      }
    },

    async changePage(newPage) {
      this.current = newPage;
      await this.getCustomers();
    },

    async searchCustomer(query) {
      this.searchQuery = query;
      this.current = 1;
      await this.getCustomers();
    },

    async addCustomer(payload) {
      try {
        const res = await axios.post(
          `${this.apiUrl}/api/v1/customers`,
          payload
        );

        this.response = { status: res.status, message: res.data.message };
        await this.getCustomers();
      } catch (error) {
        this.response = {
          status: error.response?.status,
          message: error.message,
          error: error.response.data.errors,
        };
      }
    },

    async updateCustomer(payload) {
      try {
        const res = await axios.put(`${this.apiUrl}/api/v1/customers`, payload);

        this.response = { status: res.status, message: res.data.message };
        await this.getCustomers();
      } catch (error) {
        this.response = {
          status: error.response?.status,
          message: error.message,
          error: error.response.data.errors,
        };
      }
    },

    async deleteCustomer(id) {
      try {
        await axios.delete(`${this.apiUrl}/api/v1/customers/${id}`);

        this.response = {
          status: 200,
          message: "Customer deleted successfully",
        };
        await this.getCustomers();
      } catch (error) {
        this.response = {
          status: error.response?.status,
          message: error.message,
        };
      }
    },

    resetState() {
      this.customers = [];
      this.customer = null;
      this.response = {
        status: null,
        message: null,
        error: [],
      };
      this.modalAction = {
        action: "",
        modal_title: "",
        modal_button: "",
      };
      this.totalData = 0;
      this.current = 1;
      this.searchQuery = "";
    },
  },
});
