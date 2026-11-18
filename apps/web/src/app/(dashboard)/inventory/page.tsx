"use client";

import React, { useState, useEffect } from "react";
import { Package, Plus, AlertCircle, TrendingDown, ArrowUpDown, X, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatETB } from "@/lib/format";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
              Parts & Inventory
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-card border border-border text-content-secondary">
              {parts.length} catalog items
            </span>
          </div>
          <p className="text-xs text-content-secondary mt-1">
            Track spare parts warehouse, reorder alerts, and repair consumption
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="primary" onClick={() => setShowPartModal(true)}>
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            <span>Add Part</span>
          </Button>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockCount > 0 && (
        <div className="p-4 bg-warning-muted border border-warning/40 rounded-card flex items-center justify-between">
          <div className="flex items-center space-x-2.5 text-xs text-warning font-medium">
            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
            <span>
              {lowStockCount} part{lowStockCount > 1 ? "s are" : " is"} running critically low on stock
              (at or below reorder threshold).
            </span>
          </div>
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className="text-xs font-mono font-bold text-warning hover:underline"
          >
            {filterLowStock ? "Show All Items" : "Filter Low Stock"}
          </button>
        </div>
      )}

      {/* Parts Table */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : parts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No inventory parts found"
          description="Your spare parts catalog is currently empty. Add replacement screens, batteries, or ports to start tracking stock."
          actionLabel="Add First Part"
          onAction={() => setShowPartModal(true)}
        />
      ) : (
        <div className="bg-surface-card border border-border rounded-card overflow-hidden shadow-card-dark">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface border-b border-border text-content-muted text-[11px] font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Part / SKU</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Cost Price</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {parts.map((p) => {
                  const isLow = p.currentQuantity <= p.reorderLevel;
                  return (
                    <tr key={p.id} className="hover:bg-surface-hover/70 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-content-primary block">{p.name}</span>
                        <span className="font-mono text-xs text-accent">{p.sku}</span>
                      </td>
                      <td className="py-3.5 px-4 text-content-secondary text-xs">{p.unit}</td>
                      <td className="py-3.5 px-4 text-content-secondary font-mono text-xs">
                        {formatETB(p.costPrice)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-content-primary text-xs">
                        {formatETB(p.sellingPrice)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                            isLow
                              ? "bg-warning-muted text-warning border-warning/40"
                              : "bg-success-muted text-success border-success/40"
                          }`}
                        >
                          {p.currentQuantity} {p.unit}
                        </span>
                        {isLow && (
                          <span className="text-[10px] font-mono text-warning block mt-0.5">
                            Reorder at ≤ {p.reorderLevel}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedPart(p);
                            setShowAdjustModal(true);
                          }}
                          className="h-8 px-2.5 bg-surface border border-border hover:border-border-strong text-content-primary rounded-btn text-xs font-medium inline-flex items-center space-x-1.5 transition-colors"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5 text-accent" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-canvas/80 backdrop-blur-sm"
            onClick={() => setShowPartModal(false)}
          />

          <div className="relative w-full max-w-md bg-surface-modal border border-border shadow-modal-dark rounded-xl p-6 z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-content-primary">Add Spare Part to Catalog</h2>
              <button
                onClick={() => setShowPartModal(false)}
                className="p-1 rounded text-content-muted hover:text-content-primary hover:bg-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePart} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="SKU / Part Code"
                  required
                  placeholder="e.g. SCR-IP13-BLK"
                  value={partForm.sku}
                  onChange={(e) => setPartForm({ ...partForm, sku: e.target.value.toUpperCase() })}
                />
                <Input
                  label="Unit"
                  required
                  placeholder="pcs, set, meter"
                  value={partForm.unit}
                  onChange={(e) => setPartForm({ ...partForm, unit: e.target.value })}
                />
              </div>

              <Input
                label="Part Name"
                required
                placeholder="e.g. iPhone 13 OLED Display Panel"
                value={partForm.name}
                onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Cost Price (ETB)"
                  type="number"
                  min="0"
                  required
                  value={partForm.costPrice}
                  onChange={(e) =>
                    setPartForm({ ...partForm, costPrice: parseFloat(e.target.value) || 0 })
                  }
                />
                <Input
                  label="Selling Price (ETB)"
                  type="number"
                  min="0"
                  required
                  value={partForm.sellingPrice}
                  onChange={(e) =>
                    setPartForm({ ...partForm, sellingPrice: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Initial Stock Qty"
                  type="number"
                  min="0"
                  required
                  value={partForm.initialQuantity}
                  onChange={(e) =>
                    setPartForm({ ...partForm, initialQuantity: parseInt(e.target.value, 10) || 0 })
                  }
                />
                <Input
                  label="Reorder Alert Level"
                  type="number"
                  min="1"
                  required
                  value={partForm.reorderLevel}
                  onChange={(e) =>
                    setPartForm({ ...partForm, reorderLevel: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-border">
                <Button variant="secondary" type="button" onClick={() => setShowPartModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={isCreatingPart}
                  loadingText="Creating..."
                >
                  Save to Inventory
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adjust Stock */}
      {showAdjustModal && selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-canvas/80 backdrop-blur-sm"
            onClick={() => setShowAdjustModal(false)}
          />

          <div className="relative w-full max-w-sm bg-surface-modal border border-border shadow-modal-dark rounded-xl p-6 z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-base font-bold text-content-primary">Adjust Stock Level</h2>
                <p className="text-xs font-mono text-accent">{selectedPart.name}</p>
              </div>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="p-1 rounded text-content-muted hover:text-content-primary hover:bg-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Movement Reason
                </label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-card border border-border rounded-btn text-sm text-content-primary focus:outline-none focus:border-accent"
                >
                  <option value={StockMovementType.PURCHASE}>New Purchase / Restock (+)</option>
                  <option value={StockMovementType.ADJUSTMENT}>Correction / Inventory Count</option>
                  <option value={StockMovementType.RETURN}>Return / Defective (-)</option>
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

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-border">
                <Button variant="secondary" type="button" onClick={() => setShowAdjustModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={isAdjusting}
                  loadingText="Adjusting..."
                >
                  Apply Movement
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
