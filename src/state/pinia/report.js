import { defineStore } from "pinia";
import axios from "axios";

export const useReportStore = defineStore("report", {
  state: () => ({
    apiUrl: process.env.VUE_APP_APIURL,
    reports: [],
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
    perpage: 5,
    searchQuery: "",
  }),

  actions: {
    async getReports(date_from, date_to, category = "") {
      try {
        const url = `${this.apiUrl}/api/v1/report/sales-menu?page=${this.current}&per_page=${this.perpage}&date_from=${date_from}&date_to=${date_to}&category=${category}`;
        const res = await axios.get(url);

        this.reports = res.data.data;
        this.totalData = res.data.length;

        this.response = {
          status: res.status,
          message: "Reports fetched successfully.",
          data: res.data.data,
        };
      } catch (error) {
        this.errorResponse = {
          status: error.response?.status || 500,
          message: error.response?.data?.message || "Failed to fetch reports.",
          list: error.response?.data?.errors || [],
        };

        throw this.errorResponse;
      }
    },
  },

  async changePage(newPage) {
    this.current = newPage;
  },
});
