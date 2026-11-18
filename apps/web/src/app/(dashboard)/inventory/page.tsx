"use client";

import React, { useState, useEffect } from "react";
import { Package, Plus, AlertCircle, TrendingDown, ArrowUpDown } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatETB } from "@/lib/format";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StockMovementType } from "@fixflow/contracts";

export default function InventoryPage() {
  const [parts, setParts] = useState<any[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New Part Modal
  const [showPartModal, setShowPartModal] = useState(false);
  const [isCreatingPart, setIsCreatingPart] = useState(false);
  const [partForm, setPartForm] = useState({
    sku: "",
    name: "",
    description: "",
    unit: "pcs",
    costPrice: 0,
    sellingPrice: 0,
    reorderLevel: 5,
    initialQuantity: 0,
  });

  // Stock Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [adjustQty, setAdjustQty] = useState("1");
  const [adjustType, setAdjustType] = useState<string>(StockMovementType.PURCHASE);
  const [isAdjusting, setIsAdjusting] = useState(false);

  useEffect(() => {
    loadParts();
  }, [filterLowStock]);

  const loadParts = async () => {
    setIsLoading(true);
    const res = await apiRequest(`/inventory?lowStock=${filterLowStock}`);
    setIsLoading(false);
    if (res.data) {
      setParts(res.data);
      if (res.meta?.lowStockCount !== undefined) {
        setLowStockCount(res.meta.lowStockCount);
      }
    }
  };

  const handleCreatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingPart(true);

    await apiRequest("/inventory", {
      method: "POST",
      body: JSON.stringify(partForm),
    });

    setIsCreatingPart(false);
    setShowPartModal(false);
    setPartForm({
      sku: "",
      name: "",
      description: "",
      unit: "pcs",
      costPrice: 0,
      sellingPrice: 0,
      reorderLevel: 5,
      initialQuantity: 0,
    });
    loadParts();
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart) return;

    setIsAdjusting(true);
    const qty = parseInt(adjustQty, 10) || 0;
    const delta = adjustType === StockMovementType.PURCHASE ? qty : -qty;

    await apiRequest("/inventory/adjust", {
      method: "POST",
      body: JSON.stringify({
        partId: selectedPart.id,
        quantityDelta: delta,
        movementType: adjustType,
      }),
    });

    setIsAdjusting(false);
    setShowAdjustModal(false);
    setSelectedPart(null);
    setAdjustQty("1");
    loadParts();
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-950 tracking-tight">Parts & Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track spare parts, stock levels, and repair consumption
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="primary" onClick={() => setShowPartModal(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Part</span>
          </Button>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-card flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-amber-800 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>
              {lowStockCount} part{lowStockCount > 1 ? "s are" : " is"} running low on stock
              (at or below reorder level).
            </span>
          </div>
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className="text-xs font-bold text-amber-900 underline hover:text-amber-950"
          >
            {filterLowStock ? "Show All Parts" : "View Low Stock"}
          </button>
        </div>
      )}

      {/* Parts Table */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : parts.length === 0 ? (
        <EmptyState
          title="No inventory parts found"
          description="Your spare parts catalog is currently empty. Add replacement screens, batteries, or connectors to start tracking stock."
          actionLabel="Add First Part"
          onAction={() => setShowPartModal(true)}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Part / SKU</th>
                  <th className="py-3.5 px-4">Unit</th>
                  <th className="py-3.5 px-4">Cost Price</th>
                  <th className="py-3.5 px-4">Selling Price</th>
                  <th className="py-3.5 px-4">Stock Level</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parts.map((p) => {
                  const isLow = p.currentQuantity <= p.reorderLevel;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block">{p.name}</span>
                        <span className="font-mono text-xs text-slate-400">{p.sku}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">{p.unit}</td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">{formatETB(p.costPrice)}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 text-xs">
                        {formatETB(p.sellingPrice)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isLow
                              ? "bg-amber-50 text-amber-700 border border-amber-300"
                              : "bg-teal-50 text-teal-700 border border-teal-200"
                          }`}
                        >
                          {p.currentQuantity} {p.unit}
                        </span>
                        {isLow && (
                          <span className="text-[10px] text-amber-700 block mt-0.5">
                            Reorder at {p.reorderLevel}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedPart(p);
                            setShowAdjustModal(true);
                          }}
                          className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium inline-flex items-center space-x-1"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                          <span>Adjust Stock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Part */}
      {showPartModal && (
        <div className="fixed inset-0 bg-ink-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-card border border-slate-200 p-6 max-w-md w-full shadow-lg space-y-4">
            <h2 className="text-base font-bold text-ink-950">Add Spare Part to Inventory</h2>
            <form onSubmit={handleCreatePart} className="space-y-3">
              <Input
                label="SKU / Part Number"
                required
                placeholder="e.g. SCR-IP13-OLED"
                value={partForm.sku}
                onChange={(e) => setPartForm({ ...partForm, sku: e.target.value })}
              />

              <Input
                label="Part Name"
                required
                placeholder="e.g. iPhone 13 OLED Screen"
                value={partForm.name}
                onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Cost Price (ETB)"
                  type="number"
                  min="0"
                  value={partForm.costPrice}
                  onChange={(e) =>
                    setPartForm({ ...partForm, costPrice: parseFloat(e.target.value) || 0 })
                  }
                />
                <Input
                  label="Selling Price (ETB)"
                  type="number"
                  min="0"
                  value={partForm.sellingPrice}
                  onChange={(e) =>
                    setPartForm({ ...partForm, sellingPrice: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Initial Quantity"
                  type="number"
                  min="0"
                  value={partForm.initialQuantity}
                  onChange={(e) =>
                    setPartForm({ ...partForm, initialQuantity: parseInt(e.target.value, 10) || 0 })
                  }
                />
                <Input
                  label="Reorder Alert Level"
                  type="number"
                  min="0"
                  value={partForm.reorderLevel}
                  onChange={(e) =>
                    setPartForm({ ...partForm, reorderLevel: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <Button variant="secondary" type="button" onClick={() => setShowPartModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={isCreatingPart}>
                  Save Part
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adjust Stock */}
      {showAdjustModal && selectedPart && (
        <div className="fixed inset-0 bg-ink-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-card border border-slate-200 p-6 max-w-sm w-full shadow-lg space-y-4">
            <h2 className="text-base font-bold text-ink-950">Adjust Stock for {selectedPart.name}</h2>
            <p className="text-xs text-slate-500">
              Current stock on bench: <span className="font-bold">{selectedPart.currentQuantity}</span> {selectedPart.unit}
            </p>

            <form onSubmit={handleAdjustStock} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adjustment Type
                </label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-btn text-sm"
                >
                  <option value={StockMovementType.PURCHASE}>Restock / Purchase (+)</option>
                  <option value={StockMovementType.ADJUSTMENT}>Manual Reduction (-)</option>
                  <option value={StockMovementType.RETURN}>Vendor Return (-)</option>
                </select>
              </div>

              <Input
                label="Quantity"
                type="number"
                min="1"
                required
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
              />

              <div className="flex justify-end space-x-2 pt-3">
                <Button variant="secondary" type="button" onClick={() => setShowAdjustModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={isAdjusting}>
                  Update Stock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
