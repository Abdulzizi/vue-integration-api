export const menuItems = [
  {
    id: 1,
    label: "Dashboard",
    icon: "bx-home-circle",
    subItems: [
      {
        id: 2,
        label: "Home",
        link: "/",
        parentId: 1,
      },
    ],
  },
  {
    id: 3,
    label: "Menu",
    isTitle: true,
  },
  {
    id: 4,
    label: "Master",
    icon: "bx-shield-alt-2",
    subItems: [
      {
        id: 5,
        label: "User",
        link: "/user",
        parentId: 4,
      },
      {
        id: 6,
        label: "Customer",
        link: "/customer",
        parentId: 4,
      },
      {
        id: 7,
        label: "Product Category",
        link: "/product-category",
        parentId: 4,
      },
      {
        id: 8,
        label: "Product",
        link: "/product",
        parentId: 4,
      },
    ],
  },
  {
    id: 5,
    label: "Pembayaran",
    icon: "bx-wallet",
    subItems: [
      {
        id: 9,
        label: "Transaksi",
        link: "/transaksi",
        parentId: 5,
      },
    ],
  },
  {
    id: 6,
    label: "Laporan",
    icon: "bx bx-food-menu",
    subItems: [
      {
        id: 10,
        label: "Laporan Sales Customer",
        link: "/sales-report",
        parentId: 6,
      },
      {
        id: 11,
        label: "Laporan Sales",
        link: "/report-sales",
        parentId: 6,
      },
    ],
  },
];
