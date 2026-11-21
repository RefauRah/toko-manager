"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Printer,
  CheckCircle2,
  X,
  Package,
} from "lucide-react";
import { formatRupiah, formatDateTimeIndo } from "@/lib/format";

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  stock: number;
}

export default function PosPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer" | "ewallet">("cash");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [completedTrx, setCompletedTrx] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [search, selectedCat]);

  async function fetchProducts() {
    try {
      const res = await fetch(`/api/products?search=${search}&categoryId=${selectedCat}`);
      const json = await res.json();
      setProducts(json.products || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch("/api/products/categories");
      const json = await res.json();
      setCategories(json.categories || []);
    } catch (e) {
      console.error(e);
    }
  }

  function addToCart(product: any) {
    if (product.stock_quantity <= 0) {
      alert("Stok barang ini habis!");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          alert(`Stok hanya tersisa ${product.stock_quantity} unit`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          price: Number(product.selling_price),
          quantity: 1,
          stock: product.stock_quantity,
        },
      ];
    });
  }

  function updateQty(productId: string, delta: number) {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.stock) {
              alert(`Stok maksimal ${item.stock}`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  }

  function removeItem(productId: string) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = Math.max(0, subtotal - (discount || 0));
  const change = Math.max(0, paidAmount - finalTotal);

  function openCheckout() {
    if (cart.length === 0) return;
    setPaidAmount(finalTotal);
    setErrorMsg(null);
    setShowCheckoutModal(true);
  }

  async function handleCheckout() {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          discount_amount: discount,
          payment_method: paymentMethod,
          paid_amount: paidAmount,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal memproses transaksi");
      }

      setCompletedTrx({
        ...json.data,
        items: [...cart],
        date: new Date().toISOString(),
      });
      setCart([]);
      setDiscount(0);
      setShowCheckoutModal(false);
      fetchProducts(); // refresh stocks
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6.5rem)]">
      {/* Left Column: Product Catalog */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm overflow-hidden">
        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari nama produk atau SKU barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 shrink-0">
            <button
              onClick={() => setSelectedCat("")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCat === ""
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCat === c.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pr-1">
          {products.map((p) => {
            const isOutOfStock = p.stock_quantity <= 0;
            return (
              <div
                key={p.id}
                onClick={() => !isOutOfStock && addToCart(p)}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer select-none ${
                  isOutOfStock
                    ? "opacity-50 bg-slate-50 border-slate-200 cursor-not-allowed"
                    : "bg-white hover:border-indigo-400 hover:shadow-md border-slate-200"
                }`}
              >
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block mb-1">
                    {p.category_name || "Umum"}
                  </span>
                  <h4 className="font-bold text-xs text-slate-800 leading-snug line-clamp-2">
                    {p.name}
                  </h4>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-xs font-extrabold text-indigo-600 block">
                      {formatRupiah(p.selling_price)}
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${
                        isOutOfStock ? "text-rose-600" : "text-slate-400"
                      }`}
                    >
                      {isOutOfStock ? "Stok Habis" : `Stok: ${p.stock_quantity}`}
                    </span>
                  </div>

                  {!isOutOfStock && (
                    <button className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition">
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Cart & Total */}
      <div className="w-full lg:w-96 bg-white rounded-2xl border border-slate-200 flex flex-col shadow-sm shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Keranjang Kasir</h3>
          </div>
          <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
            {cart.reduce((sum, i) => sum + i.quantity, 0)} item
          </span>
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
              <Package className="w-8 h-8 mb-2 opacity-40" />
              <p>Keranjang masih kosong</p>
              <p className="text-[11px] text-slate-300">Pilih produk di sebelah kiri</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex-1 mr-2 overflow-hidden">
                  <p className="font-bold text-slate-800 truncate">{item.productName}</p>
                  <p className="text-[11px] text-slate-500">{formatRupiah(item.price)}</p>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    onClick={() => updateQty(item.productId, -1)}
                    className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                  >
                    <Minus className="w-3 h-3 text-slate-600" />
                  </button>
                  <span className="font-bold w-6 text-center text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQty(item.productId, 1)}
                    className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                  >
                    <Plus className="w-3 h-3 text-slate-600" />
                  </button>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-1 text-slate-400 hover:text-rose-600 ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Checkout Button */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-800">{formatRupiah(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Diskon (Rp)</span>
            <input
              type="number"
              min={0}
              value={discount || ""}
              onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
              placeholder="0"
              className="w-24 px-2 py-1 text-right text-xs rounded border border-slate-200 bg-white"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900">Total Akhir</span>
            <span className="font-black text-lg text-indigo-600">
              {formatRupiah(finalTotal)}
            </span>
          </div>

          <button
            onClick={openCheckout}
            disabled={cart.length === 0}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-indigo-100 transition disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4" />
            <span>Bayar Transaksi ({formatRupiah(finalTotal)})</span>
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                Penyelesaian Pembayaran
              </h3>
              <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500">Total Tagihan:</p>
              <p className="text-2xl font-black text-indigo-600">{formatRupiah(finalTotal)}</p>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "cash", label: "Tunai (Cash)" },
                  { id: "transfer", label: "Transfer" },
                  { id: "ewallet", label: "QRIS / E-Wallet" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`py-2 text-xs font-bold rounded-xl border text-center transition ${
                      paymentMethod === m.id
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Paid Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Uang Diterima (Rp)
              </label>
              <input
                type="number"
                value={paidAmount || ""}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />

              {/* Quick Cash Buttons */}
              <div className="flex gap-2 mt-2">
                {[finalTotal, 50000, 100000, 200000].map((amt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPaidAmount(amt)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 rounded-lg"
                  >
                    {idx === 0 ? "Uang Pas" : formatRupiah(amt)}
                  </button>
                ))}
              </div>
            </div>

            {/* Kembalian */}
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Kembalian:</span>
              <span className="text-base font-black text-emerald-600">
                {formatRupiah(change)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || paidAmount < finalTotal}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Konfirmasi Pembayaran Lunas"}
            </button>
          </div>
        </div>
      )}

      {/* Completed Transaction & Receipt Modal */}
      {completedTrx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Transaksi Berhasil!
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {completedTrx.invoiceNumber}
              </p>
            </div>

            {/* Receipt Preview */}
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-left text-xs font-mono space-y-2">
              <div className="border-b pb-2 text-center">
                <p className="font-bold text-slate-800">STRUK PEMBELIAN</p>
                <p className="text-[10px] text-slate-500">{formatDateTimeIndo(completedTrx.date)}</p>
              </div>

              <div className="space-y-1 py-1">
                {completedTrx.items?.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span>
                      {it.productName} x{it.quantity}
                    </span>
                    <span>{formatRupiah(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-2 space-y-0.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Total Tagihan</span>
                  <span className="font-bold">{formatRupiah(completedTrx.finalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bayar</span>
                  <span>{formatRupiah(completedTrx.paidAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Kembalian</span>
                  <span>{formatRupiah(completedTrx.changeAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Struk</span>
              </button>
              <button
                onClick={() => setCompletedTrx(null)}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition"
              >
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
