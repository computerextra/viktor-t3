"use client";

import BackBtn from "../../_components/back-btn";
import AbteilungForm from "../_components/form";

export default function Page() {
  return (
    <div>
      <BackBtn href="/CMS/Angebote" />
      <h1 className="text-center">Neues Angebot anlegen</h1>
      <AbteilungForm />
    </div>
  );
}
