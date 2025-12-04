// Mock data types for the application

export interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
    plan: "starter" | "professional" | "enterprise";
    planValue: number;
    status: "active" | "trial" | "overdue" | "inactive";
    paymentStatus: "paid" | "pending" | "overdue";
    projectStatus: "active" | "paused" | "completed";
    tags: string[];
    createdAt: Date;
    lastPayment?: Date;
    nextPayment?: Date;
}

export interface Domain {
    id: string;
    clientId: string;
    clientName: string;
    domain: string;
    registrar: string;
    expirationDate: Date;
    autoRenew: boolean;
    sslExpiration?: Date;
    notes?: string;
}

export interface Expense {
    id: string;
    category: "salaries" | "infrastructure" | "marketing" | "software" | "office" | "other";
    description: string;
    amount: number;
    dueDate: Date;
    paidDate?: Date;
    isPaid: boolean;
    isRecurring: boolean;
    recurrenceType?: "monthly" | "yearly";
}

export interface Revenue {
    id: string;
    clientId: string;
    clientName: string;
    description: string;
    amount: number;
    dueDate: Date;
    paidDate?: Date;
    isPaid: boolean;
    type: "mrr" | "one-time" | "project";
}

// Mock Clients
export const mockClients: Client[] = [
    {
        id: "1",
        name: "Tech Solutions Ltda",
        email: "contato@techsolutions.com.br",
        phone: "(11) 99999-1111",
        plan: "professional",
        planValue: 199,
        status: "active",
        paymentStatus: "paid",
        projectStatus: "active",
        tags: ["web", "seo"],
        createdAt: new Date("2024-01-15"),
        lastPayment: new Date("2024-11-01"),
        nextPayment: new Date("2024-12-01"),
    },
    {
        id: "2",
        name: "Advocacia Mendes",
        email: "juridico@mendes.adv.br",
        phone: "(21) 98888-2222",
        plan: "starter",
        planValue: 99,
        status: "active",
        paymentStatus: "pending",
        projectStatus: "active",
        tags: ["institucional"],
        createdAt: new Date("2024-03-20"),
        lastPayment: new Date("2024-10-01"),
        nextPayment: new Date("2024-11-01"),
    },
    {
        id: "3",
        name: "Clínica Saúde Plena",
        email: "admin@saudeplena.com",
        phone: "(31) 97777-3333",
        plan: "enterprise",
        planValue: 499,
        status: "active",
        paymentStatus: "paid",
        projectStatus: "active",
        tags: ["sistema", "crm", "seo"],
        createdAt: new Date("2023-11-10"),
        lastPayment: new Date("2024-11-01"),
        nextPayment: new Date("2024-12-01"),
    },
    {
        id: "4",
        name: "Restaurante Bella Italia",
        email: "contato@bellaitalia.com.br",
        phone: "(11) 96666-4444",
        plan: "starter",
        planValue: 99,
        status: "overdue",
        paymentStatus: "overdue",
        projectStatus: "paused",
        tags: ["cardápio digital"],
        createdAt: new Date("2024-06-01"),
        lastPayment: new Date("2024-09-01"),
        nextPayment: new Date("2024-10-01"),
    },
    {
        id: "5",
        name: "Startup XYZ",
        email: "ceo@startupxyz.io",
        phone: "(11) 95555-5555",
        plan: "professional",
        planValue: 199,
        status: "trial",
        paymentStatus: "pending",
        projectStatus: "active",
        tags: ["landing page", "ads"],
        createdAt: new Date("2024-11-15"),
        nextPayment: new Date("2024-12-15"),
    },
];

// Mock Domains
export const mockDomains: Domain[] = [
    {
        id: "1",
        clientId: "1",
        clientName: "Tech Solutions Ltda",
        domain: "techsolutions.com.br",
        registrar: "Registro.br",
        expirationDate: new Date("2024-12-10"),
        autoRenew: true,
        sslExpiration: new Date("2025-03-15"),
    },
    {
        id: "2",
        clientId: "2",
        clientName: "Advocacia Mendes",
        domain: "mendes.adv.br",
        registrar: "Registro.br",
        expirationDate: new Date("2024-12-25"),
        autoRenew: false,
    },
    {
        id: "3",
        clientId: "3",
        clientName: "Clínica Saúde Plena",
        domain: "saudeplena.com",
        registrar: "GoDaddy",
        expirationDate: new Date("2025-01-05"),
        autoRenew: true,
        sslExpiration: new Date("2025-01-05"),
    },
    {
        id: "4",
        clientId: "4",
        clientName: "Restaurante Bella Italia",
        domain: "bellaitalia.com.br",
        registrar: "Hostinger",
        expirationDate: new Date("2024-12-08"),
        autoRenew: false,
    },
];

// Mock Expenses
export const mockExpenses: Expense[] = [
    {
        id: "1",
        category: "infrastructure",
        description: "Servidor AWS",
        amount: 450,
        dueDate: new Date("2024-12-05"),
        isPaid: false,
        isRecurring: true,
        recurrenceType: "monthly",
    },
    {
        id: "2",
        category: "software",
        description: "Licença Adobe Creative Cloud",
        amount: 250,
        dueDate: new Date("2024-12-10"),
        isPaid: false,
        isRecurring: true,
        recurrenceType: "monthly",
    },
    {
        id: "3",
        category: "marketing",
        description: "Google Ads - Dezembro",
        amount: 1500,
        dueDate: new Date("2024-12-01"),
        paidDate: new Date("2024-12-01"),
        isPaid: true,
        isRecurring: false,
    },
    {
        id: "4",
        category: "salaries",
        description: "Freelancer Design",
        amount: 2000,
        dueDate: new Date("2024-12-05"),
        isPaid: false,
        isRecurring: false,
    },
];

// Mock Revenues
export const mockRevenues: Revenue[] = [
    {
        id: "1",
        clientId: "1",
        clientName: "Tech Solutions Ltda",
        description: "Mensalidade Plano Professional",
        amount: 199,
        dueDate: new Date("2024-12-01"),
        paidDate: new Date("2024-12-01"),
        isPaid: true,
        type: "mrr",
    },
    {
        id: "2",
        clientId: "2",
        clientName: "Advocacia Mendes",
        description: "Mensalidade Plano Starter",
        amount: 99,
        dueDate: new Date("2024-12-01"),
        isPaid: false,
        type: "mrr",
    },
    {
        id: "3",
        clientId: "3",
        clientName: "Clínica Saúde Plena",
        description: "Mensalidade Plano Enterprise",
        amount: 499,
        dueDate: new Date("2024-12-01"),
        paidDate: new Date("2024-12-01"),
        isPaid: true,
        type: "mrr",
    },
    {
        id: "4",
        clientId: "5",
        clientName: "Startup XYZ",
        description: "Setup Inicial Landing Page",
        amount: 1500,
        dueDate: new Date("2024-12-15"),
        isPaid: false,
        type: "one-time",
    },
];

// Cash Flow data for charts
export const cashFlowData = [
    { month: "Jul", inflows: 8500, outflows: 4200 },
    { month: "Ago", inflows: 9200, outflows: 4800 },
    { month: "Set", inflows: 8800, outflows: 5100 },
    { month: "Out", inflows: 10500, outflows: 4900 },
    { month: "Nov", inflows: 11200, outflows: 5300 },
    { month: "Dez", inflows: 9800, outflows: 4200 },
];
