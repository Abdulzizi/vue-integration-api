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
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    categoryId: "",
  }),

  actions: {
    async getReports() {
      try {
        const url = `${this.apiUrl}/api/v1/report/sales-menu?page=${this.current}&per_page=${this.perpage}&date_from=${this.startDate}&date_to=${this.endDate}&category_id=${this.categoryId}`;
        // console.log("API Request URL:", url);

        console.log("Params:", this.startDate, this.endDate, this.categoryId);

        const res = await axios.get(url);

        // console.log("API Response:", res.data);

        this.reports = res.data.data;
        this.totalData = res.data.total;

        this.response = {
          status: res.status,
          message: "Reports fetched successfully.",
          data: res.data.data,
        };
      } catch (error) {
        console.error("API Error:", error.response || error);

        this.errorResponse = {
          status: error.response?.status || 500,
          message: error.response?.data?.message || "Failed to fetch reports.",
          list: error.response?.data?.errors || [],
        };

        throw this.errorResponse;
      }
    },

    async exportExcel() {
      const params = new URLSearchParams({
        is_export_excel: 1,
        start_date: this.startDate,
        end_date: this.endDate,
      });

      if (this.categoryId) params.append("category_id", this.categoryId);

      try {
        const response = await axios
          .get(`${this.apiUrl}/api/v1/download/sales-category`, {
            params,
            responseType: "blob",
          })
          .then((response) => {
            const url = URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = url;
            link.download = "report-sales-category.xls";
            document.body.appendChild(link);
            link.click();
          });
        return response;
      } catch (error) {
        console.log(error);
        this.error = {
          status: error.response?.status || 500,
          message: error.message,
          list: error.response?.data?.errors || [],
        };
      }
    },
  },
});
