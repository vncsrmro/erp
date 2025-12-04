"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    MoreHorizontal,
    Calendar,
    User,
    Trash2,
    Pencil,
    GripVertical,
    ChevronRight,
    Clock,
    AlertCircle
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button, Modal, Input } from "@/components/ui";
import { getSupabase } from "@/lib/supabase";
import { cn, formatDate } from "@/lib/utils";
import type { Project, Client } from "@/lib/database.types";

type ProjectStatus = "backlog" | "in_progress" | "review" | "done";
type ProjectPriority = "low" | "medium" | "high";

interface Column {
    id: ProjectStatus;
    title: string;
    color: string;
}

const columns: Column[] = [
    { id: "backlog", title: "Backlog", color: "text-text-muted" },
    { id: "in_progress", title: "Em Progresso", color: "text-warning" },
    { id: "review", title: "Revisão", color: "text-primary" },
    { id: "done", title: "Concluído", color: "text-success" },
];

const priorityColors: Record<ProjectPriority, string> = {
    low: "text-text-muted",
    medium: "text-warning",
    high: "text-danger",
};

const priorityLabels: Record<ProjectPriority, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [addToColumn, setAddToColumn] = useState<ProjectStatus>("backlog");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        client_id: "",
        priority: "medium" as ProjectPriority,
        due_date: "",
    });

    const fetchData = useCallback(async () => {
        try {
            const supabase = getSupabase();
            const [projectsRes, clientsRes] = await Promise.all([
                supabase.from("projects").select("*").order("created_at", { ascending: false }),
                supabase.from("clients").select("*").order("name"),
            ]);

            if (projectsRes.error) throw projectsRes.error;
            if (clientsRes.error) throw clientsRes.error;

            setProjects(projectsRes.data || []);
            setClients(clientsRes.data || []);
        } catch {
            // Mock data fallback
            setProjects([]);
            setClients([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getClientName = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client?.name || "Cliente";
    };

    const handleAddProject = (columnId: ProjectStatus) => {
        setAddToColumn(columnId);
        setFormData({
            title: "",
            description: "",
            client_id: "",
            priority: "medium",
            due_date: "",
        });
        setEditingProject(null);
        setIsAddModalOpen(true);
    };

    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setAddToColumn(project.status);
        setFormData({
            title: project.title,
            description: project.description || "",
            client_id: project.client_id,
            priority: project.priority,
            due_date: project.due_date?.split("T")[0] || "",
        });
        setIsAddModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const supabase = getSupabase();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            if (editingProject) {
                await supabase
                    .from("projects")
                    .update({
                        title: formData.title,
                        description: formData.description || null,
                        client_id: formData.client_id,
                        priority: formData.priority,
                        due_date: formData.due_date || null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", editingProject.id);
            } else {
                await supabase
                    .from("projects")
                    .insert({
                        user_id: user.id,
                        title: formData.title,
                        description: formData.description || null,
                        client_id: formData.client_id,
                        status: addToColumn,
                        priority: formData.priority,
                        due_date: formData.due_date || null,
                    });
            }

            setIsAddModalOpen(false);
            fetchData();
        } catch (err) {
            console.error("Error saving project:", err);
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        try {
            const supabase = getSupabase();
            await supabase.from("projects").delete().eq("id", projectId);
            fetchData();
        } catch (err) {
            console.error("Error deleting project:", err);
        }
    };

    const handleMoveProject = async (projectId: string, newStatus: ProjectStatus) => {
        try {
            const supabase = getSupabase();
            await supabase
                .from("projects")
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq("id", projectId);
            fetchData();
        } catch (err) {
            console.error("Error moving project:", err);
        }
    };

    const getProjectsByStatus = (status: ProjectStatus) => {
        return projects.filter(p => p.status === status);
    };

    return (
        <>
            <AppShell
                title="Projetos"
                subtitle={`${projects.length} projetos em andamento`}
                headerAction={
                    <Button size="sm" variant="secondary" onClick={() => handleAddProject("backlog")}>
                        Ver Todos
                    </Button>
                }
            >
                <div className="py-4 overflow-x-auto">
                    {/* Kanban Board */}
                    <div className="flex gap-4 min-w-max pb-4">
                        {columns.map((column) => {
                            const columnProjects = getProjectsByStatus(column.id);

                            return (
                                <motion.div
                                    key={column.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-72 flex-shrink-0"
                                >
                                    {/* Column Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-2 h-2 rounded-full",
                                                column.id === "backlog" && "bg-text-muted",
                                                column.id === "in_progress" && "bg-warning",
                                                column.id === "review" && "bg-primary",
                                                column.id === "done" && "bg-success"
                                            )} />
                                            <h3 className={cn("font-medium", column.color)}>
                                                {column.title}
                                            </h3>
                                            <span className="text-xs text-text-muted bg-background-tertiary px-2 py-0.5 rounded-full">
                                                {columnProjects.length}
                                            </span>
                                        </div>
                                        <button className="p-1 rounded hover:bg-background-secondary">
                                            <MoreHorizontal className="w-4 h-4 text-text-muted" />
                                        </button>
                                    </div>

                                    {/* Column Content */}
                                    <div className="space-y-2 min-h-[200px]">
                                        <AnimatePresence>
                                            {columnProjects.map((project, index) => (
                                                <motion.div
                                                    key={project.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    whileHover={{ scale: 1.02 }}
                                                    className="group card-elevated p-3 cursor-pointer"
                                                    onClick={() => handleEditProject(project)}
                                                >
                                                    {/* Priority indicator */}
                                                    <div className="flex items-start justify-between mb-2">
                                                        <span className={cn(
                                                            "text-xs font-medium",
                                                            priorityColors[project.priority]
                                                        )}>
                                                            ★ {priorityLabels[project.priority]}
                                                        </span>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteProject(project.id);
                                                                }}
                                                                className="p-1 rounded hover:bg-danger/20 text-text-muted hover:text-danger"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Title */}
                                                    <h4 className="font-medium text-text-primary text-sm mb-2 line-clamp-2">
                                                        {project.title}
                                                    </h4>

                                                    {/* Client */}
                                                    <p className="text-xs text-text-muted mb-2">
                                                        {getClientName(project.client_id)}
                                                    </p>

                                                    {/* Footer */}
                                                    {project.due_date && (
                                                        <div className="flex items-center gap-1 text-xs text-text-muted">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>{formatDate(new Date(project.due_date))}</span>
                                                        </div>
                                                    )}

                                                    {/* Move buttons on hover */}
                                                    <div className="flex gap-1 mt-2 pt-2 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {columns.filter(c => c.id !== project.status).map(col => (
                                                            <button
                                                                key={col.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleMoveProject(project.id, col.id);
                                                                }}
                                                                className={cn(
                                                                    "flex-1 text-xs py-1 rounded transition-colors",
                                                                    "bg-background-tertiary hover:bg-background-secondary",
                                                                    col.color
                                                                )}
                                                            >
                                                                {col.title.substring(0, 8)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {/* Add Card Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleAddProject(column.id)}
                                            className="w-full p-3 rounded-xl border border-dashed border-border text-text-muted text-sm hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Adicionar
                                        </motion.button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </AppShell>

            {/* Add/Edit Project Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={editingProject ? "Editar Projeto" : "Novo Projeto"}
                subtitle={editingProject ? "Atualize as informações do projeto" : `Adicionar em ${columns.find(c => c.id === addToColumn)?.title}`}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Título do Projeto"
                        placeholder="Ex: Redesign Landing Page"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Cliente
                        </label>
                        <select
                            value={formData.client_id}
                            onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            required
                        >
                            <option value="">Selecione um cliente</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Descrição"
                        placeholder="Descreva o projeto brevemente..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Prioridade
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as ProjectPriority }))}
                                className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            >
                                <option value="low">Baixa</option>
                                <option value="medium">Média</option>
                                <option value="high">Alta</option>
                            </select>
                        </div>

                        <Input
                            label="Data Limite"
                            type="date"
                            icon={Calendar}
                            value={formData.due_date}
                            onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            fullWidth
                            onClick={() => setIsAddModalOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                        >
                            {editingProject ? "Salvar" : "Criar Projeto"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
