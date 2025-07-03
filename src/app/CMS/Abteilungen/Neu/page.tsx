"use client";

import BackBtn from "../../_components/back-btn";
import AbteilungForm from "../_components/form";

export default function Page() {
  return (
    <div>
      <BackBtn href="/CMS/Abteilungen" />
      <h1 className="text-center">Neue Abteilung anlegen</h1>
      <AbteilungForm />
    </div>
  );
}
