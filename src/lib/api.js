const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2204";

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ mess: res.statusText }));
    throw new Error(err.mess || err.message || "Request failed");
  }
  return res.json();
}

export const api = {
  products: {
    getAll: async () => { const r = await request("/products"); return r.Products; },
    getById: async (id) => { const r = await request(`/products/${id}`); return r.Product; },
    search: async (keyword) => { const r = await request(`/products?q=${encodeURIComponent(keyword)}`); return r.Products; },
    create: async (data) => { const r = await request("/products", { method: "POST", body: JSON.stringify(data) }); return r.Product; },
    update: async (id, data) => { const r = await request(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }); return r.Product; },
    delete: async (id) => { const r = await request(`/products/${id}`, { method: "DELETE" }); return r.Product; },
  },

  categories: {
    getAll: async () => { const r = await request("/product-categories"); return r.ProductCategories; },
    getById: async (id) => { const r = await request(`/product-categories/${id}`); return r.ProductCategory; },
    create: async (data) => { const r = await request("/product-categories", { method: "POST", body: JSON.stringify(data) }); return r.ProductCategory; },
    update: async (id, data) => { const r = await request(`/product-categories/${id}`, { method: "PUT", body: JSON.stringify(data) }); return r.ProductCategory; },
    delete: async (id) => { const r = await request(`/product-categories/${id}`, { method: "DELETE" }); return r.ProductCategory; },
  },

  users: {
    getAll: async () => { const r = await request("/users"); return r.Users; },
    getById: async (id) => { const r = await request(`/users/${id}`); return r.User; },
    create: async (data) => { const r = await request("/users/register", { method: "POST", body: JSON.stringify(data) }); return r.User; },
    update: async (id, data) => { const r = await request(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }); return r.User; },
    delete: async (id) => { const r = await request(`/users/${id}`, { method: "DELETE" }); return r.User; },
  },

  colors: {
    getAll: async () => { const r = await request("/colors"); return r.Colors; },
    getById: async (id) => { const r = await request(`/colors/${id}`); return r.Color; },
    create: async (data) => { const r = await request("/colors", { method: "POST", body: JSON.stringify(data) }); return r.Color; },
    update: async (id, data) => { const r = await request(`/colors/${id}`, { method: "PUT", body: JSON.stringify(data) }); return r.Color; },
    delete: async (id) => { const r = await request(`/colors/${id}`, { method: "DELETE" }); return r.Color; },
  },

  variants: {
    getAll: async () => { const r = await request("/product-variants"); return r.ProductVariants; },
    getById: async (id) => { const r = await request(`/product-variants/${id}`); return r.ProductVariant; },
    create: async (data) => { const r = await request("/product-variants", { method: "POST", body: JSON.stringify(data) }); return r.ProductVariant; },
    update: async (id, data) => { const r = await request(`/product-variants/${id}`, { method: "PUT", body: JSON.stringify(data) }); return r.ProductVariant; },
    delete: async (id) => { const r = await request(`/product-variants/${id}`, { method: "DELETE" }); return r.ProductVariant; },
  },

  sizeCategories: {
    getAll: async () => { const r = await request("/size-categories"); return r.SizeCategories; },
    getById: async (id) => { const r = await request(`/size-categories/${id}`); return r.SizeCategory; },
    create: async (data) => { const r = await request("/size-categories", { method: "POST", body: JSON.stringify(data) }); return r.SizeCategory; },
    update: async (id, data) => { const r = await request(`/size-categories/${id}`, { method: "PUT", body: JSON.stringify(data) }); return r.SizeCategory; },
    delete: async (id) => { const r = await request(`/size-categories/${id}`, { method: "DELETE" }); return r.SizeCategory; },
  },

  sizeOptions: {
    getAll: async () => { const r = await request("/size-options"); return r.SizeOptions; },
    getById: async (id) => { const r = await request(`/size-options/${id}`); return r.SizeOption; },
    create: async (data) => { const r = await request("/size-options", { method: "POST", body: JSON.stringify(data) }); return r.SizeOption; },
    update: async (id, data) => { const r = await request(`/size-options/${id}`, { method: "PUT", body: JSON.stringify(data) }); return r.SizeOption; },
    delete: async (id) => { const r = await request(`/size-options/${id}`, { method: "DELETE" }); return r.SizeOption; },
  },

  media: {
    getAll: async () => { const r = await request("/media"); return r.Media; },
    getById: async (id) => { const r = await request(`/media/${id}`); return r.Media; },
    uploadSingle: async (file, folder = "susan_shop") => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      const res = await fetch(`${API_BASE}/media/upload-single`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const r = await res.json();
      return r.Media;
    },
    uploadMultiple: async (files, folder = "susan_shop") => {
      const formData = new FormData();
      for (const file of files) formData.append("files", file);
      formData.append("folder", folder);
      const res = await fetch(`${API_BASE}/media/upload-multiple`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const r = await res.json();
      return r.Media;
    },
    update: async (id, data) => { const r = await request(`/media/${id}`, { method: "PUT", body: JSON.stringify(data) }); return r.Media; },
    delete: async (id) => { const r = await request(`/media/${id}`, { method: "DELETE" }); return r.Media; },
  },

  cartItems: {
    getAll: async () => { const r = await request("/cart-items"); return r.CartItems; },
    getByUserId: async (userId) => { const r = await request(`/cart-items/user/${userId}`); return r.CartItems; },
    getById: async (id) => { const r = await request(`/cart-items/${id}`); return r.CartItem; },
    create: async (data) => { const r = await request("/cart-items", { method: "POST", body: JSON.stringify(data) }); return r.CartItem; },
    update: async (id, data) => { const r = await request(`/cart-items/${id}`, { method: "PUT", body: JSON.stringify(data) }); return r.CartItem; },
    delete: async (id) => { const r = await request(`/cart-items/${id}`, { method: "DELETE" }); return r.CartItem; },
    deleteByUserId: async (userId) => { const r = await request(`/cart-items/user/${userId}`, { method: "DELETE" }); return r.CartItems; },
  },
};
