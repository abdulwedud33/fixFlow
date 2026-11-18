import { db, AuditEventEntity } from "../../db/store";

export interface LogAuditParams {
  shopId: string;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  requestId?: string | null;
  metadata?: Record<string, any>;
}

export function logAuditEvent(params: LogAuditParams): AuditEventEntity {
  const event: AuditEventEntity = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    shopId: params.shopId,
    actorUserId: params.actorUserId || null,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    requestId: params.requestId || null,
    metadata: params.metadata || {},
    createdAt: new Date(),
  };

  db.auditEvents.push(event);
  return event;
}
