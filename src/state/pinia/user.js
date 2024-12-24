import { defineStore } from "pinia";
import axios from "axios";

export const useUserStore = defineStore("user", {
  state: () => ({
    apiUrl: process.env.VUE_APP_APIURL || "http://127.0.0.1:8000",
    users: [],
    roles: [],
    user: null,
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
    searchQuery: 0,
  }),
  actions: {
    openForm(newAction, user) {
      this.modalAction.action = newAction;
      this.user = user;
    },

    // * Fetch user data
    async getUsers() {
      try {
        // console.log(`API URL: ${process.env.VUE_APP_APIURL}`);
        const url = `${this.apiUrl}/api/v1/users?page=${this.current}&per_page=${this.perPage}&name=${this.searchQuery}`;

        const res = await axios.get(url);
        const usersDataList = res.data.data.list;

        this.users = usersDataList;
        this.totalData = res.data.data.meta.total;
      } catch (error) {
        this.response = {
          status: error.response?.status,
          message: error.message,
        };
      }
    },

    // * Fetch roles data
    async getRoles() {
      try {
        const url = `${this.apiUrl}/api/v1/roles`;

        const res = await axios.get(url);
        const rolesDataList = res.data.data.list;

        this.roles = rolesDataList;
      } catch (error) {
        this.response = {
          status: error.response?.status,
          message: error.message,
        };
      }
    },

    async changePage(newPage) {
      this.current = newPage;
      await this.getUsers();
    },

    async searchUsers(query) {
      this.searchQuery = query;
      this.current = 1;
      await this.getUsers();
    },

    async addUsers(users) {
      try {
        // console.log(users);
        const res = await axios.post(`${this.apiUrl}/api/v1/users`, users, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        this.response = {
          status: res.status,
          message: res.data.message,
        };
      } catch (error) {
        this.response = {
          status: error.response?.status,
          message: error.message,
          list: error.response.data.errors,
        };
      } finally {
        await this.getUsers();
      }
    },

    async deleteUser(id) {
      this.loading = true;
      try {
        await axios.delete(`${this.apiUrl}/api/v1/users/${id}`);
        this.response = {
          status: "200",
        };
      } catch (error) {
        this.response = {
          status: error.response?.status,
          message: error.message,
          list: error.response.data.errors,
        };
      } finally {
        this.getUsers();
      }
    },

    async updateUser(users) {
      try {
        // const updatedUser = { ...users, photo: users.foto_url };

        // console.log(users);

        await axios.put(`${this.apiUrl}/api/v1/users`, users, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        this.response = {
          status: "200",
        };
      } catch (error) {
        console.error("Error Response:", error.response);
        this.response = {
          status: error.status,
          message: error.message,
        };
      }
    },

    resetState() {
      this.users = [];
      this.roles = [];
      this.user = null;
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
