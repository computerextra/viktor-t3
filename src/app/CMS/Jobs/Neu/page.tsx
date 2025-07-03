"use client";

import BackBtn from "../../_components/back-btn";
import JobForm from "../_components/form";

export default function Page() {
  return (
    <div>
      <BackBtn href="/CMS/Jobs" />
      <h1 className="text-center">Neuen Job anlegen</h1>
      <JobForm />
    </div>
  );
}
