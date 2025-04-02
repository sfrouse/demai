import { EntityStatus } from "@contentful/f36-components";

export default function getEntryStatus(entry: any): EntityStatus {
  const sys = entry.sys;

  if (sys.archivedAt) return "archived";
  if (sys.deletedAt) return "deleted";
  if (!sys.publishedAt && !sys.createdAt) return "new";
  if (!sys.publishedAt) return "draft";
  if (sys.updatedAt !== sys.publishedAt) return "changed";

  return "published";
}
