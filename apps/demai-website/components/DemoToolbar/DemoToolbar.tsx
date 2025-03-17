"use client";

import { SpaceParams } from "@/app/types";
import styles from "./DemoToolbar.module.css";
import { useEffect, useState } from "react";

export default function DemoToolbar({ params }: { params: SpaceParams }) {
  const [fullUrl, setFullUrl] = useState("");

  useEffect(() => {
    const completeUrl = window?.location.href;
    setFullUrl(completeUrl);
  }, []);

  return (
    <div className={styles["demo-toolbar"]}>
      <div>
        space:{" "}
        <a
          className={styles["link"]}
          href={`https://app.contentful.com/spaces/${params.spaceId}/environments/${params.environment}`}
          target="_ctf"
        >
          &quot;{params.spaceName}&quot; ID: {params.spaceId}, ENV:{" "}
          {params.environment}
        </a>{" "}
        | locale: {params.locale} | slug: {params.slug} | preview:{" "}
        {params.preview ? "true" : "false"}
        <br /> url: {fullUrl}{" "}
      </div>
    </div>
  );
}
