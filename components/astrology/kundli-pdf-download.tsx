"use client";

import { useState } from "react";
import { Button } from "@digital-astrology/ui";
import { useUserPlan } from "@/hooks/use-user-plan";
import { UpgradeModal } from "@/components/payment/upgrade-modal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function KundliPdfDownload({ chartData }: { chartData: any }) {
  const { plan, loading } = useUserPlan();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const generatePDF = () => {
    if (plan === "FREE") {
      setShowUpgradeModal(true);
      return;
    }

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(22);
    doc.setTextColor(255, 107, 0); // Saffron
    doc.text("Jyotishya Birth Chart Report", 105, 20, { align: "center" });

    // Details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Name: ${chartData.name || "Seeker"}`, 20, 40);
    doc.text(`Date of Birth: ${chartData.birthDate || "N/A"}`, 20, 50);
    doc.text(`Time of Birth: ${chartData.birthTime || "N/A"}`, 20, 60);

    // Planets Table
    const tableData = chartData.planets ? chartData.planets.map((p: any) => [
      p.name,
      p.sign,
      p.degree?.toFixed(2) || "0.00",
      p.house || "-",
    ]) : [["Sun", "Aries", "10.00", "1"]];

    autoTable(doc, {
      startY: 80,
      head: [["Planet", "Sign", "Degree", "House"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [255, 107, 0] },
    });

    doc.save(`${chartData.name || "Kundli"}_Birth_Chart.pdf`);
  };

  if (loading) return <Button disabled>Loading...</Button>;

  return (
    <>
      <Button 
        onClick={generatePDF}
        className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
           <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Download Full PDF Report
      </Button>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </>
  );
}
