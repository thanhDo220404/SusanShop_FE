/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./auth";
import { api } from "@/lib/api";

const CartContext = createContext(null);

const LOCAL_CART_KEY = "susan_shop_cart";

function loadLocalCart() {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(LOCAL_CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalCart(items) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
}

function mapServerItem(item) {
  const variant = item.product_variant_id;
  const product = variant?.product_id;
  return {
    _id: item._id,
    product_variant_id: variant?._id,
    quantity: item.quantity,
    variant: {
      _id: variant?._id,
      price: variant?.price,
      discount: variant?.discount || 0,
      stock: variant?.stock,
      status: variant?.status,
      color_id: variant?.color_id,
      size_id: variant?.size_id,
      product_id: {
        _id: product?._id,
        name: product?.name,
        slug: product?.slug,
        status: product?.status,
        images: product?.images,
      },
    },
  };
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const mergedRef = useRef(false);

  const loadServerCart = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const serverItems = await api.cartItems.getByUserId(user._id);
      setItems(serverItems.map(mapServerItem));
    } catch (err) {
      console.error("Failed to load cart:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      if (!mergedRef.current) {
        mergedRef.current = true;
        (async () => {
          const localItems = loadLocalCart();
          if (localItems.length > 0) {
            setLoading(true);
            try {
              for (const item of localItems) {
                await api.cartItems.create({
                  user_id: user._id,
                  product_variant_id: item.product_variant_id,
                  quantity: item.quantity,
                });
              }
              localStorage.removeItem(LOCAL_CART_KEY);
            } catch (err) {
              console.error("Failed to merge cart:", err);
            } finally {
              setLoading(false);
            }
          }
          await loadServerCart();
        })();
      } else {
        loadServerCart();
      }
    } else {
      mergedRef.current = false;
      setItems(loadLocalCart());
    }
  }, [user, loadServerCart]);

  async function addToCart(variantId, quantity = 1, variantData = null) {
    if (!user) {
      window.location.href = "/dang-nhap?redirect=" + encodeURIComponent(window.location.pathname);
      return;
    }
    const existing = items.find(
      (item) => item.product_variant_id === variantId,
    );
    const stock = existing?.variant?.stock ?? variantData?.stock ?? 999;
    const currentQty = existing?.quantity || 0;
    const total = currentQty + quantity;
    if (total > stock) {
      quantity = Math.max(0, stock - currentQty);
      if (quantity <= 0) return;
    }
    setLoading(true);
    try {
      await api.cartItems.create({
        user_id: user._id,
        product_variant_id: variantId,
        quantity,
      });
      await loadServerCart();
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateQuantity(itemKey, quantity) {
    if (quantity < 1) return;
    const item = items.find(
      (i) => i._id === itemKey || i.product_variant_id === itemKey,
    );
    const maxStock = item?.variant?.stock;
    if (maxStock != null && quantity > maxStock) {
      quantity = maxStock;
    }
    setLoading(true);
    try {
      await api.cartItems.update(itemKey, { quantity });
      await loadServerCart();
    } catch (err) {
      console.error("Failed to update quantity:", err);
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(itemKey) {
    setLoading(true);
    try {
      await api.cartItems.delete(itemKey);
      await loadServerCart();
    } catch (err) {
      console.error("Failed to remove item:", err);
    } finally {
      setLoading(false);
    }
  }

  async function changeVariant(itemKey, newVariantId, newVariantData) {
    setLoading(true);
    try {
      await api.cartItems.delete(itemKey);
      await api.cartItems.create({
        user_id: user._id,
        product_variant_id: newVariantId,
        quantity: 1,
      });
      await loadServerCart();
    } catch (err) {
      console.error("Failed to change variant:", err);
    } finally {
      setLoading(false);
    }
  }

  async function clearCart() {
    setLoading(true);
    try {
      await api.cartItems.deleteByUserId(user._id);
      setItems([]);
    } catch (err) {
      console.error("Failed to clear cart:", err);
    } finally {
      setLoading(false);
    }
  }

  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const totalPrice = items.reduce((sum, item) => {
    const price = item.variant?.price || 0;
    const discount = item.variant?.discount || 0;
    const salePrice = price * (1 - discount / 100);
    return sum + salePrice * (item.quantity || 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        totalItems,
        totalPrice,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        changeVariant,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
