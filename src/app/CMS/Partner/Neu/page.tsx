"use client";

import BackBtn from "../../_components/back-btn";
import PartnerForm from "../_components/form";

export default function Page() {
  return (
    <div>
      <BackBtn href="/CMS/Partner" />
      <h1 className="text-center">Neuen Partner anlegen</h1>
      <PartnerForm />
    </div>
  );
}
