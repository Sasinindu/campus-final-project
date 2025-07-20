import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from 'typeorm';
import { AuditLog } from '../entities/AuditLog';

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<any> {
  listenTo() {
    return Object;
  }

  private isAuditLog(
    event: InsertEvent<any> | UpdateEvent<any> | RemoveEvent<any>,
  ) {
    return event.metadata.target === AuditLog;
  }

  async afterInsert(event: InsertEvent<any>) {
    if (this.isAuditLog(event)) return;
    const auditData = JSON.stringify(event.entity || {});
    await event.manager.getRepository(AuditLog).save({
      entity: event.metadata.name,
      action: 'INSERT',
      data: auditData,
    });
  }

  async afterUpdate(event: UpdateEvent<any>) {
    if (this.isAuditLog(event)) return;
    const auditData = JSON.stringify({
      previous: event.databaseEntity || {},
      current: event.entity || {},
    });
    await event.manager.getRepository(AuditLog).save({
      entity: event.metadata.name,
      action: 'UPDATE',
      data: auditData,
    });
  }

  async afterRemove(event: RemoveEvent<any>) {
    if (this.isAuditLog(event)) return;
    const auditData = JSON.stringify(event.databaseEntity || {});
    await event.manager.getRepository(AuditLog).save({
      entity: event.metadata.name,
      action: 'REMOVE',
      data: auditData,
    });
  }
}
