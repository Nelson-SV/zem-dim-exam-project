import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea.tsx";
import { toast } from "sonner";
import type { CreateProjectDto, PatchProjectDto, ProjectDto, UpdateProjectDto } from "../generated-client";
import { http } from "../lib/api";

type Mode = "create" | "edit";

type ProjectModalProps = {
  open: boolean;
  mode: Mode;
  project?: ProjectDto | null;
  onClose: () => void;
  onSaved: (project: ProjectDto, mode: Mode) => void;
};

type ClientOption = { id: string; fullName: string };

type FormState = {
  clientId: string;
  title: string;
  address: string;
  city: string;
  postalCode: string;
  totalArea: string;
  budget: string;
  notes: string;
  status: string;
  startDate: string;
  plannedEndDate: string;
  actualEndDate: string;
};

const emptyForm: FormState = {
  clientId: "",
  title: "",
  address: "",
  city: "",
  postalCode: "",
  totalArea: "",
  budget: "",
  notes: "",
  status: "In Progress",
  startDate: "",
  plannedEndDate: "",
  actualEndDate: "",
};

const toInputDate = (value?: string | Date | null): string => {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return isNaN(date.getTime()) ? "" : format(date, "yyyy-MM-dd");
};

export function ProjectModal({ open, mode, project, onClose, onSaved }: ProjectModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;
    const loadClients = async () => {
      setLoadingClients(true);
      try {
        const res = await http.userManagement.getAllUsers(1, 100, null, true);
        const mapped = (res.items ?? []).map(u => ({
          id: u.userId!,
          fullName: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || "(no name)",
        }));
        setClients(mapped);
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to load clients");
      } finally {
        setLoadingClients(false);
      }
    };
    loadClients();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (isEdit && project) {
      setForm({
        clientId: project.clientId ?? "",
        title: project.title ?? "",
        address: project.address ?? "",
        city: project.city ?? "",
        postalCode: project.postalCode ?? "",
        totalArea: project.totalArea?.toString() ?? "",
        budget: project.budget?.toString() ?? "",
        notes: project.notes ?? "",
        status: project.status ?? "In Progress",
        startDate: toInputDate(project.startDate ?? null),
        plannedEndDate: toInputDate(project.plannedEndDate ?? null),
        actualEndDate: toInputDate(project.actualEndDate ?? null),
      });
      setPreview(project.thumbnailUrl ?? null);
      setFile(null);
    } else {
      setForm(emptyForm);
      setPreview(null);
      setFile(null);
    }
  }, [open, isEdit, project]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.address.trim()) errors.address = "Address is required";
    if (!form.city.trim()) errors.city = "City is required";
    if (!form.postalCode.trim()) errors.postalCode = "Postal code is required";
    if (!form.startDate) errors.startDate = "Start date is required";
    if (!form.clientId) errors.clientId = "Client is required";
    if (form.totalArea === "") errors.totalArea = "Area is required";
    const start = form.startDate ? new Date(`${form.startDate}T00:00:00`) : null;
    const plannedEnd = form.plannedEndDate ? new Date(`${form.plannedEndDate}T00:00:00`) : null;
    const actualEnd = form.actualEndDate ? new Date(`${form.actualEndDate}T00:00:00`) : null;
    if (plannedEnd && start && plannedEnd < start) errors.plannedEndDate = "Expected completion cannot be before the start date.";
    if (actualEnd && start && actualEnd < start) errors.actualEndDate = "Actual end date cannot be before the start date.";
    if (actualEnd && plannedEnd && actualEnd < plannedEnd) errors.actualEndDate = "Actual end date cannot be before expected completion.";
    return errors;
  }, [form]);

  const handleNumber = (value: string) => {
    if (value === "") return 0;
    const n = Number(value);
    return Number.isNaN(n) ? NaN : n;
  };

  const handleSubmit = async () => {
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const totalAreaNum = handleNumber(form.totalArea);
    const budgetNum = handleNumber(form.budget);

    if (Number.isNaN(totalAreaNum) || totalAreaNum < 0) {
      toast.error("Total area must be zero or a positive number");
      return;
    }
    if (Number.isNaN(budgetNum) || budgetNum < 0) {
      toast.error("Budget must be zero or a positive number");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && project?.id) {
        let thumbnailUrl = project.thumbnailUrl;
        if (file) {
          const uploaded = await http.uploadProjectImage(file, project.id);
          thumbnailUrl = uploaded.url;
        }

        const dto: UpdateProjectDto = {
          title: form.title,
          notes: form.notes || undefined,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          status: form.status,
          startDate: form.startDate,
          plannedEndDate: form.plannedEndDate || undefined,
          actualEndDate: form.actualEndDate || undefined,
          totalArea: totalAreaNum,
          budget: budgetNum,
          progressPercentage: project.progressPercentage ?? 0,
          thumbnailUrl: thumbnailUrl ?? undefined,
        };

        const updated = await http.projects.updateProject(project.id, dto);
        onSaved(updated, "edit");
        toast.success("Project updated");
      } else {
        const dto: CreateProjectDto = {
          clientId: form.clientId,
          title: form.title,
          notes: form.notes || undefined,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          status: form.status,
          startDate: form.startDate,
          plannedEndDate: form.plannedEndDate || form.startDate,
          totalArea: totalAreaNum,
          budget: budgetNum,
          progressPercentage: 0,
          thumbnailUrl: undefined,
        };

        const created = await http.projects.createProject(dto);

        let result = created;
        if (file && created.id) {
          const uploaded = await http.uploadProjectImage(file, created.id);
          const patch: PatchProjectDto = {
            title: created.title,
            notes: created.notes,
            address: created.address,
            city: created.city,
            postalCode: created.postalCode,
            status: created.status,
            startDate: toInputDate(created.startDate),
            plannedEndDate: toInputDate(created.plannedEndDate),
            totalArea: created.totalArea,
            budget: created.budget,
            progressPercentage: created.progressPercentage,
            thumbnailUrl: uploaded.url,
          };
          await http.projects.patchProject(created.id, patch);
          result = { ...created, thumbnailUrl: uploaded.url };
        }

        onSaved(result, "create");
        toast.success("Project created");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit project" : "Create a new project"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the project details below." : "Enter the basic information for the new project."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Cottage in Vyshneve"
            />
            {validationErrors.title && <p className="text-destructive text-sm">{validationErrors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-address">Address</Label>
            <Input
              id="project-address"
              value={form.address}
              onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
              placeholder="15 Sosnova St, Vyshneve"
            />
            {validationErrors.address && <p className="text-destructive text-sm">{validationErrors.address}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-city">City</Label>
              <Input
                id="project-city"
                value={form.city}
                onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Vyshneve"
              />
              {validationErrors.city && <p className="text-destructive text-sm">{validationErrors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-postal">Postal code</Label>
              <Input
                id="project-postal"
                value={form.postalCode}
                onChange={(e) => setForm(prev => ({ ...prev, postalCode: e.target.value }))}
                placeholder="08132"
              />
              {validationErrors.postalCode && <p className="text-destructive text-sm">{validationErrors.postalCode}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-area">Area (m²)</Label>
              <Input
                id="project-area"
                type="number"
                value={form.totalArea}
                onChange={(e) => setForm(prev => ({ ...prev, totalArea: e.target.value }))}
                placeholder="180"
              />
              {validationErrors.totalArea && <p className="text-destructive text-sm">{validationErrors.totalArea}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-budget">Budget</Label>
              <Input
                id="project-budget"
                type="number"
                value={form.budget}
                onChange={(e) => setForm(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="100000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Client</Label>
            <Select
              value={form.clientId}
              onValueChange={(v) => setForm(prev => ({ ...prev, clientId: v }))}
              disabled={isEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingClients ? "Loading..." : "Select a client"} />
              </SelectTrigger>
              <SelectContent>
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.clientId && <p className="text-destructive text-sm">{validationErrors.clientId}</p>}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm(prev => ({ ...prev, status: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start date</Label>
              <Input
                id="start-date"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                disabled={isEdit}
              />
              {validationErrors.startDate && <p className="text-destructive text-sm">{validationErrors.startDate}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="planned-end-date">Expected completion</Label>
              <Input
                id="planned-end-date"
                type="date"
                value={form.plannedEndDate}
                min={form.startDate || undefined}
                onChange={(e) => setForm(prev => ({ ...prev, plannedEndDate: e.target.value }))}
              />
              {validationErrors.plannedEndDate && <p className="text-destructive text-sm">{validationErrors.plannedEndDate}</p>}
            </div>
          </div>

          {isEdit && (
            <div className="space-y-2">
              <Label htmlFor="actual-end-date">Actual end date</Label>
              <Input
                id="actual-end-date"
                type="date"
                value={form.actualEndDate}
                min={form.startDate || undefined}
                onChange={(e) => setForm(prev => ({ ...prev, actualEndDate: e.target.value }))}
              />
              {validationErrors.actualEndDate && <p className="text-destructive text-sm">{validationErrors.actualEndDate}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Project photo (optional)</Label>
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {preview && (
              <img src={preview} alt="preview" className="mt-2 h-28 w-auto rounded-md object-cover border" />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-notes">Notes (optional)</Label>
            <Textarea
              id="project-notes"
              value={form.notes}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about the project"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-[#F97316] hover:bg-[#F97316]/90">
            {submitting ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save changes" : "Create project")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
