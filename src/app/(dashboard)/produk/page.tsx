"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  X,
  Sparkles,
  ArrowUpDown,
  Tags,
  FolderPlus,
} from "lucide-react";
import { formatRupiah } from "@/lib/format";

export default function ProdukPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState<any>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category_id: "",
    purchase_price: "",
    selling_price: "",
    stock_quantity: "",
    min_stock_alert: "5",
  });

  const [stockAdjData, setStockAdjData] = useState({
    stock_adjustment: "",
    adjustment_reason: "Kulakan / Belanja Modal Baru",
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [search, selectedCat]);

  async function loadProducts() {
    try {
      const res = await fetch(`/api/products?search=${search}&categoryId=${selectedCat}`);
      const json = await res.json();
      setProducts(json.products || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadCategories() {
    try {
      const res = await fetch("/api/products/categories");
      const json = await res.json();
      setCategories(json.categories || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;
    setCategoryLoading(true);
    setCategoryError(null);

    try {
      const res = await fetch("/api/products/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menambah kategori");

      await loadCategories();
      const newCatId = json.id;
      setCategoryForm({ name: "", description: "" });
      if (newCatId) {
        setFormData((prev) => ({ ...prev, category_id: newCatId }));
      }
      setShowCategoryModal(false);
    } catch (err: any) {
      setCategoryError(err.message);
    } finally {
      setCategoryLoading(false);
    }
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menambah produk");
      }

      setShowAddModal(false);
      setFormData({
        name: "",
        sku: "",
        category_id: "",
        purchase_price: "",
        selling_price: "",
        stock_quantity: "",
        min_stock_alert: "5",
      });
      loadProducts();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdjustStock(e: React.FormEvent) {
    e.preventDefault();
    if (!showStockModal) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${showStockModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock_adjustment: stockAdjData.stock_adjustment,
          adjustment_reason: stockAdjData.adjustment_reason,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyesuaikan stok");

      setShowStockModal(null);
      setStockAdjData({ stock_adjustment: "", adjustment_reason: "Kulakan / Belanja Modal Baru" });
      loadProducts();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("Nonaktifkan produk ini?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      loadProducts();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Produk, Modal & Stok
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Catat harga modal barang belanja, tentukan harga jual, dan pantau stok minim otomatis
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setCategoryError(null);
              setShowCategoryModal(true);
            }}
            className="flex items-center justify-center space-x-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Tags className="w-4 h-4 text-indigo-600" />
            <span>Kelola Kategori</span>
          </button>

          <button
            onClick={() => {
              setErrorMsg(null);
              setShowAddModal(true);
            }}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama produk atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3.5 px-4">Nama Produk</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 text-right">Harga Modal (Beli)</th>
                <th className="py-3.5 px-4 text-right">Harga Jual</th>
                <th className="py-3.5 px-4 text-right">Margin Untung</th>
                <th className="py-3.5 px-4 text-center">Stok</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada produk yang cocok dengan pencarian
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const modal = Number(p.purchase_price || 0);
                  const jual = Number(p.selling_price || 0);
                  const marginRp = jual - modal;
                  const marginPct = modal > 0 ? ((marginRp / modal) * 100).toFixed(0) : 0;
                  const isLow = p.stock_quantity <= p.min_stock_alert;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{p.sku || "-"}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {p.category_name || "Umum"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-600">
                        {formatRupiah(modal)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-indigo-600">
                        {formatRupiah(jual)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-emerald-600">
                          +{formatRupiah(marginRp)}
                        </span>
                        <span className="text-[10px] text-emerald-500 ml-1">
                          ({marginPct}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-black px-2 py-0.5 rounded-full text-[11px] ${
                            isLow
                              ? "bg-rose-100 text-rose-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {p.stock_quantity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setShowStockModal(p)}
                            title="Restock / Sesuaikan Stok"
                            className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            title="Hapus / Nonaktifkan"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                Tambah Produk & Modal Baru
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Barang / Produk *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Misal: Beras Ramos 5kg"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    SKU / Barcode (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="BRS-001"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Kategori
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryError(null);
                        setShowCategoryModal(true);
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center space-x-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Kategori Baru</span>
                    </button>
                  </div>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Harga Modal / Beli (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                    placeholder="65000"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Harga Jual Kasir (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                    placeholder="75000"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    placeholder="20"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Batas Peringatan Menipis
                  </label>
                  <input
                    type="number"
                    value={formData.min_stock_alert}
                    onChange={(e) => setFormData({ ...formData, min_stock_alert: e.target.value })}
                    placeholder="5"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50 mt-4"
              >
                {loading ? "Menyimpan..." : "Simpan Produk & Catat Modal"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Restock / Penyesuaian Stok
                </h3>
                <p className="text-xs text-indigo-600 font-bold">{showStockModal.name}</p>
              </div>
              <button onClick={() => setShowStockModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Jumlah Tambah/Kurang Stok
                </label>
                <input
                  type="number"
                  required
                  value={stockAdjData.stock_adjustment}
                  onChange={(e) => setStockAdjData({ ...stockAdjData, stock_adjustment: e.target.value })}
                  placeholder="Misal: +20 untuk restock belanja, -2 untuk rusak"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Stok saat ini: {showStockModal.stock_quantity} unit
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Catatan / Keterangan
                </label>
                <input
                  type="text"
                  value={stockAdjData.adjustment_reason}
                  onChange={(e) => setStockAdjData({ ...stockAdjData, adjustment_reason: e.target.value })}
                  placeholder="Kulakan dari distributor"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Simpan Penyesuaian Stok"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <Tags className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Kelola Kategori Produk
                </h3>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {categoryError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {categoryError}
              </div>
            )}

            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Tambah Kategori Baru
              </span>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Minuman Kemasan, Makanan Ringan, ATK"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Deskripsi / Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Aneka minuman dingin dan teh"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={categoryLoading}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition disabled:opacity-50"
              >
                {categoryLoading ? "Menyimpan..." : "Simpan Kategori Baru"}
              </button>
            </form>

            {/* Existing Categories List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Daftar Kategori Saat Ini ({categories.length})
              </span>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {categories.length === 0 ? (
                  <p className="p-3 text-xs text-slate-400 text-center">Belum ada kategori</p>
                ) : (
                  categories.map((c) => (
                    <div key={c.id} className="p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{c.name}</p>
                        {c.description && (
                          <p className="text-[10px] text-slate-400">{c.description}</p>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Aktif
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
