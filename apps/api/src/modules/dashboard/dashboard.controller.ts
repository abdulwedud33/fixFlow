import { Router, Response } from "express";
import { authenticate, requireTenant, AuthRequest } from "../../middleware/auth";
import { db } from "../../db/store";
import { RepairStatus, UserRole } from "@fixflow/contracts";

export const dashboardRouter = Router();
dashboardRouter.use(authenticate, requireTenant);

dashboardRouter.get("/summary", (req: AuthRequest, res: Response, next) => {
  try {
    const shopTickets = db.repairTickets.filter((t) => t.shopId === req.shopId);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Status counts
    const totalRepairs = shopTickets.length;
    const newRepairs = shopTickets.filter((t) => t.status === RepairStatus.RECEIVED).length;
    const diagnosing = shopTickets.filter((t) => t.status === RepairStatus.DIAGNOSING).length;
    const waitingForApproval = shopTickets.filter((t) => t.status === RepairStatus.WAITING_FOR_APPROVAL).length;
    const waitingForParts = shopTickets.filter((t) => t.status === RepairStatus.WAITING_FOR_PARTS).length;
    const inProgress = shopTickets.filter((t) => t.status === RepairStatus.IN_PROGRESS).length;
    const completed = shopTickets.filter((t) => t.status === RepairStatus.COMPLETED).length;
    const readyForPickup = shopTickets.filter((t) => t.status === RepairStatus.READY_FOR_PICKUP).length;
    const collected = shopTickets.filter((t) => t.status === RepairStatus.COLLECTED).length;

    // Overdue count: active tickets whose expectedCompletionAt is in the past
    const activeStatuses: RepairStatus[] = [
      RepairStatus.RECEIVED,
      RepairStatus.DIAGNOSING,
      RepairStatus.WAITING_FOR_APPROVAL,
      RepairStatus.WAITING_FOR_PARTS,
      RepairStatus.IN_PROGRESS,
    ];

    const overdueRepairs = shopTickets.filter(
      (t) =>
        activeStatuses.includes(t.status) &&
        t.expectedCompletionAt !== null &&
        new Date(t.expectedCompletionAt) < now
    ).length;

    // Financial calculations from recorded payments
    const shopPayments = db.payments.filter(
      (p) => p.shopId === req.shopId && p.status === "recorded"
    );

    const todayCollections = shopPayments
      .filter((p) => new Date(p.recordedAt) >= startOfToday)
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRevenue = shopPayments.reduce((sum, p) => sum + p.amount, 0);

    // Calculate total outstanding balance on active/completed jobs
    let outstandingBalance = 0;
    for (const t of shopTickets) {
      if (t.status !== RepairStatus.CANCELLED) {
        const ticketPayments = shopPayments.filter((p) => p.repairTicketId === t.id);
        const paid = ticketPayments.reduce((sum, p) => sum + p.amount, 0);
        const cost = t.finalCost ?? t.estimatedCost ?? 0;
        if (cost > paid) {
          outstandingBalance += cost - paid;
        }
      }
    }

    // Recent activity (latest 5 events)
    const recentEvents = db.repairStatusEvents
      .filter((e) => e.shopId === req.shopId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map((e) => {
        const ticket = shopTickets.find((t) => t.id === e.repairTicketId);
        const actor = db.users.find((u) => u.id === e.actorUserId);
        return {
          id: e.id,
          ticketNumber: ticket?.ticketNumber || "Ticket",
          fromStatus: e.fromStatus,
          toStatus: e.toStatus,
          reason: e.reason,
          actorName: actor?.displayName || "System",
          createdAt: e.createdAt,
        };
      });

    // Technician workloads
    const techMemberships = db.memberships.filter(
      (m) =>
        m.shopId === req.shopId &&
        m.status === "active" &&
        (m.role === UserRole.TECHNICIAN || m.role === UserRole.MANAGER || m.role === UserRole.OWNER)
    );

    const technicianWorkload = techMemberships.map((m) => {
      const user = db.users.find((u) => u.id === m.userId);
      const activeAssignments = db.repairAssignments.filter(
        (a) =>
          a.shopId === req.shopId &&
          a.technicianUserId === m.userId &&
          a.unassignedAt === null
      );

      // Check how many of those assigned tickets are still in progress / active
      const activeCount = activeAssignments.filter((a) => {
        const t = shopTickets.find((tk) => tk.id === a.repairTicketId);
        return t && activeStatuses.includes(t.status);
      }).length;

      return {
        userId: m.userId,
        displayName: user?.displayName || "Technician",
        role: m.role,
        activeTicketsCount: activeCount,
      };
    });

    res.json({
      data: {
        counts: {
          total: totalRepairs,
          new: newRepairs,
          diagnosing,
          waitingForApproval,
          waitingForParts,
          inProgress,
          completed,
          readyForPickup,
          collected,
          overdue: overdueRepairs,
          active: newRepairs + diagnosing + waitingForApproval + waitingForParts + inProgress,
        },
        financials: {
          currency: "ETB",
          todayCollections,
          totalRevenue,
          outstandingBalance,
        },
        recentActivity: recentEvents,
        technicianWorkload,
      },
      meta: { requestId: req.requestId },
    });
  } catch (err) {
    next(err);
  }
});
