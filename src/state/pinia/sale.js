import { defineStore } from "pinia";
import axios from "axios";

export const useSaleStore = defineStore("sale", {
  state: () => ({
    apiUrl: process.env.VUE_APP_APIURL,
    saleResponse: {
      status: null,
      message: null,
      data: null,
    },
    errorResponse: {
      status: null,
      message: null,
      list: [],
    },
  }),

  actions: {
    async submitOrder(orderData) {
      try {
        const url = `${this.apiUrl}/api/v1/sales`;
        const response = await axios.post(url, orderData);

        this.respnse = {
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
  },
});
