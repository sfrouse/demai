"use client";

import { Entry } from "contentful";
import { useEffect, useState } from "react";

export default function SimpleReactView({ entry }: { entry: Entry<any> }) {
  const [fullUrl, setFullUrl] = useState("");

  useEffect(() => {
    const completeUrl = window?.location.href;
    setFullUrl(completeUrl);
  }, []);

  if (!entry) {
    return null;
  }

  return (
    <div>
      react view {fullUrl} {entry.sys.id} {entry.fields.title as string}
    </div>
  );
}
