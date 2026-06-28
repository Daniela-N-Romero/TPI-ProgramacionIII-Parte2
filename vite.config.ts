import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                index: resolve(__dirname, "index.html"),
                login: resolve(__dirname, "src/pages/auth/login/login.html"),
                registro: resolve(__dirname, "src/pages/auth/registro/registro.html"),
                adminHome: resolve(__dirname, "src/pages/admin/adminHome/home.html"),
                categories: resolve(__dirname, "src/pages/admin/categories/categories.html"),
                products: resolve(__dirname, "src/pages/admin/products/products.html"),
                orders: resolve(__dirname, "src/pages/admin/orders/manageOrders.html"),
                storeHome: resolve(__dirname, "src/pages/store/home/storeHome.html"),
                cart: resolve(__dirname, "src/pages/store/cart/cart.html"),
                productDetail: resolve(__dirname, "src/pages/store/productDetail/productDetail.html"),
                clientOrders: resolve(__dirname, "src/pages/client/orders/clientOrders.html")                
            },
        },
    },
    base: "./",
   plugins: [
        {
            name: "html-rewriter-plugin",
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    if (req.url === "/inicio") {req.url = "/index.html";}
                    if (req.url === "/login") { req.url = "/src/pages/auth/login/login.html";}
                    if (req.url === "/registro"){req.url = "/src/pages/auth/registro/registro.html";}
                    if (req.url === "/adminPanel"){req.url = "/src/pages/admin/adminHome/home.html";}
                    if (req.url === "/manageCategories"){req.url = "/src/pages/admin/categories/categories.html";}
                    if (req.url === "/manageProducts"){req.url = "/src/pages/admin/products/products.html";}
                    if (req.url === "/manageOrders"){req.url = "/src/pages/admin/orders/manageOrders.html";}
                    if (req.url === "/tienda") {req.url = "/src/pages/store/home/storeHome.html"; }
                    if (req.url === "/carrito") {req.url = "/src/pages/store/cart/cart.html"; }
                    if (req.url === "/pedidos") {req.url = "/src/pages/client/orders/clientOrders.html";}    
                    if (req.url?.startsWith("/producto?id")) { req.url = "/src/pages/store/productDetail/productDetail.html";}
                    next();
                });
            },
        },
    ],
});