"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Client, Expense, Revenue, Domain } from "./database.types";
import { formatCurrency, formatDate } from "./utils";

interface ReportData {
    clients: Client[];
    expenses: Expense[];
    revenues: Revenue[];
    domains: Domain[];
}

// Helper to add InovaSys branding
function addHeader(doc: jsPDF, title: string) {
    // Header background
    doc.setFillColor(22, 22, 30);
    doc.rect(0, 0, 210, 40, "F");

    // Logo text
    doc.setTextColor(139, 92, 246);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("InovaSys", 20, 25);

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(title, 20, 35);

    // Date
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(`Gerado em: ${formatDate(new Date())}`, 150, 35);
}

function addFooter(doc: jsPDF, pageNumber: number) {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
        "Desenvolvido com 💗 pela InovaSys",
        105,
        pageHeight - 10,
        { align: "center" }
    );
    doc.text(`Página ${pageNumber}`, 195, pageHeight - 10, { align: "right" });
}

export function generateFinancialReport(data: ReportData) {
    const doc = new jsPDF();
    let pageNumber = 1;

    addHeader(doc, "Relatório Financeiro Mensal");

    // Calculate totals
    const totalRevenue = data.revenues
        .filter((r) => r.is_paid)
        .reduce((sum, r) => sum + r.amount, 0);

    const totalExpenses = data.expenses
        .filter((e) => e.is_paid)
        .reduce((sum, e) => sum + e.amount, 0);

    const pendingRevenue = data.revenues
        .filter((r) => !r.is_paid)
        .reduce((sum, r) => sum + r.amount, 0);

    const pendingExpenses = data.expenses
        .filter((e) => !e.is_paid)
        .reduce((sum, e) => sum + e.amount, 0);

    const netProfit = totalRevenue - totalExpenses;

    // Summary section
    doc.setFontSize(14);
    doc.setTextColor(248, 250, 252);
    doc.text("Resumo Financeiro", 20, 55);

    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);

    const summaryY = 65;
    doc.text("Receitas Recebidas:", 20, summaryY);
    doc.setTextColor(16, 185, 129);
    doc.text(formatCurrency(totalRevenue), 80, summaryY);

    doc.setTextColor(100, 116, 139);
    doc.text("Despesas Pagas:", 20, summaryY + 8);
    doc.setTextColor(239, 68, 68);
    doc.text(formatCurrency(totalExpenses), 80, summaryY + 8);

    doc.setTextColor(100, 116, 139);
    doc.text("Lucro Líquido:", 20, summaryY + 16);
    doc.setTextColor(netProfit >= 0 ? 16 : 239, netProfit >= 0 ? 185 : 68, netProfit >= 0 ? 129 : 68);
    doc.text(formatCurrency(netProfit), 80, summaryY + 16);

    doc.setTextColor(100, 116, 139);
    doc.text("A Receber:", 120, summaryY);
    doc.setTextColor(251, 191, 36);
    doc.text(formatCurrency(pendingRevenue), 170, summaryY);

    doc.setTextColor(100, 116, 139);
    doc.text("A Pagar:", 120, summaryY + 8);
    doc.setTextColor(251, 191, 36);
    doc.text(formatCurrency(pendingExpenses), 170, summaryY + 8);

    // Revenues table
    doc.setFontSize(12);
    doc.setTextColor(248, 250, 252);
    doc.text("Receitas", 20, 100);

    autoTable(doc, {
        startY: 105,
        head: [["Descrição", "Valor", "Vencimento", "Status"]],
        body: data.revenues.slice(0, 10).map((r) => [
            r.description,
            formatCurrency(r.amount),
            formatDate(new Date(r.due_date)),
            r.is_paid ? "Pago" : "Pendente",
        ]),
        theme: "grid",
        headStyles: {
            fillColor: [139, 92, 246],
            textColor: [255, 255, 255],
            fontSize: 9,
        },
        bodyStyles: {
            textColor: [148, 163, 184],
            fontSize: 8,
        },
        alternateRowStyles: {
            fillColor: [30, 30, 40],
        },
        styles: {
            cellPadding: 3,
        },
    });

    // Expenses table
    const expenseY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setTextColor(248, 250, 252);
    doc.text("Despesas", 20, expenseY);

    autoTable(doc, {
        startY: expenseY + 5,
        head: [["Descrição", "Categoria", "Valor", "Status"]],
        body: data.expenses.slice(0, 10).map((e) => [
            e.description,
            e.category,
            formatCurrency(e.amount),
            e.is_paid ? "Pago" : "Pendente",
        ]),
        theme: "grid",
        headStyles: {
            fillColor: [239, 68, 68],
            textColor: [255, 255, 255],
            fontSize: 9,
        },
        bodyStyles: {
            textColor: [148, 163, 184],
            fontSize: 8,
        },
        alternateRowStyles: {
            fillColor: [30, 30, 40],
        },
    });

    addFooter(doc, pageNumber);

    // Save
    doc.save(`relatorio-financeiro-${new Date().toISOString().split("T")[0]}.pdf`);
}

export function generateClientReport(data: ReportData) {
    const doc = new jsPDF();
    let pageNumber = 1;

    addHeader(doc, "Relatório de Clientes");

    // Summary
    const activeClients = data.clients.filter((c) => c.status === "active").length;
    const totalMRR = data.clients
        .filter((c) => c.status === "active")
        .reduce((sum, c) => sum + c.plan_value, 0);

    doc.setFontSize(14);
    doc.setTextColor(248, 250, 252);
    doc.text("Resumo do Portfólio", 20, 55);

    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(`Total de Clientes: ${data.clients.length}`, 20, 65);
    doc.text(`Clientes Ativos: ${activeClients}`, 20, 73);
    doc.text(`MRR Total: ${formatCurrency(totalMRR)}`, 20, 81);

    // Clients table
    doc.setFontSize(12);
    doc.setTextColor(248, 250, 252);
    doc.text("Lista de Clientes", 20, 100);

    autoTable(doc, {
        startY: 105,
        head: [["Nome", "Plano", "Valor", "Status", "Pagamento"]],
        body: data.clients.map((c) => [
            c.name,
            c.plan,
            formatCurrency(c.plan_value),
            c.status,
            c.payment_status,
        ]),
        theme: "grid",
        headStyles: {
            fillColor: [139, 92, 246],
            textColor: [255, 255, 255],
            fontSize: 9,
        },
        bodyStyles: {
            textColor: [148, 163, 184],
            fontSize: 8,
        },
        alternateRowStyles: {
            fillColor: [30, 30, 40],
        },
    });

    addFooter(doc, pageNumber);
    doc.save(`relatorio-clientes-${new Date().toISOString().split("T")[0]}.pdf`);
}

export function generateDomainReport(data: ReportData) {
    const doc = new jsPDF();

    addHeader(doc, "Relatório de Domínios");

    const expiringCount = data.domains.filter((d) => {
        const days = Math.ceil(
            (new Date(d.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return days <= 30;
    }).length;

    doc.setFontSize(14);
    doc.setTextColor(248, 250, 252);
    doc.text("Resumo", 20, 55);

    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(`Total de Domínios: ${data.domains.length}`, 20, 65);
    doc.setTextColor(251, 191, 36);
    doc.text(`Vencendo em 30 dias: ${expiringCount}`, 20, 73);

    autoTable(doc, {
        startY: 90,
        head: [["Domínio", "Registrar", "Vencimento", "Auto-Renovação"]],
        body: data.domains.map((d) => [
            d.domain,
            d.registrar,
            formatDate(new Date(d.expiration_date)),
            d.auto_renew ? "Sim" : "Não",
        ]),
        theme: "grid",
        headStyles: {
            fillColor: [251, 191, 36],
            textColor: [0, 0, 0],
            fontSize: 9,
        },
        bodyStyles: {
            textColor: [148, 163, 184],
            fontSize: 8,
        },
        alternateRowStyles: {
            fillColor: [30, 30, 40],
        },
    });

    addFooter(doc, 1);
    doc.save(`relatorio-dominios-${new Date().toISOString().split("T")[0]}.pdf`);
}
