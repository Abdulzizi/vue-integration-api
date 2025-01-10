import { defineStore } from "pinia";
import axios from "axios";

export const useSaleStore = defineStore("sale", {
  state: () => ({
    apiUrl: process.env.VUE_APP_APIURL,
    sales: [],
    response: {
      status: null,
      message: null,
      data: null,
    },
    errorResponse: {
      status: null,
      message: null,
      list: [],
    },
    totalData: 0,
    current: 1,
    perPage: 5,
    customerId: "",
    productId: "",
    dateFrom: "",
    dateTo: "",
  }),

  actions: {
    async submitOrder(orderData) {
      try {
        const url = `${this.apiUrl}/api/v1/sales`;
        const response = await axios.post(url, orderData);

        this.response = {
          status: response.status,
          message: response.data.message,
        };
      } catch (error) {
        this.errorResponse = {
          status: error.response?.status || 500,
          message: error.response?.data?.message || "Failed to process order.",
          list: error.response?.data?.errors || [],
        };
      }
    },

    async getSales() {
      const params = new URLSearchParams({
        page: this.current,
        per_page: this.perPage,
      });

      console.log(
        "API PARAMS : ",
        this.dateFrom,
        this.dateTo,
        this.customerId,
        this.productId
      );

      if (this.customerId.length)
        params.append("customer_id", this.customerId.join(","));
      if (this.productId.length)
        params.append("menu_id", this.productId.join(","));

      if (this.dateFrom) params.append("date_from", this.dateFrom);
      if (this.dateTo) params.append("date_to", this.dateTo);

      try {
        const { data } = await axios.get(`${this.apiUrl}/api/v1/sales`, {
          params,
        });
        this.sales = data.data.list;
        this.totalData = data.data.meta.total;
      } catch (error) {
        this.response = {
          status: error.response?.status || 500,
          message: error.message,
          list: error.response?.data?.errors || [],
        };
      }
    },

    async changePage(page) {
      this.current = page;
      await this.getSales();
    },

    async changePerPage(perPage) {
      this.perPage = perPage;
      await this.getSales();
    },

    resetState() {
      this.sales = [];
      this.response = { status: null, message: null, data: null };
      this.errorResponse = { status: null, message: null, list: [] };
      this.totalData = 0;
      this.current = 1;
      this.perPage = 5;
      this.searchQuery = "";
    },
  },
});
