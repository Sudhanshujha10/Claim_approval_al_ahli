import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

// Use environment variable for backend API URL
const BASE_URL = import.meta.env.VITE_API_URL || "";

// Default contact matrix data
function getDefaultContactMatrix() {
  return [
    { department: "Emergency Department", primary: "emergency@alahli.com", cc: "nursing.ed@alahli.com,admin.ed@alahli.com" },
    { department: "Radiology", primary: "radiology@alahli.com", cc: "tech.radiology@alahli.com" },
    { department: "Laboratory", primary: "lab@alahli.com", cc: "pathology@alahli.com" },
    { department: "Pharmacy", primary: "pharmacy@alahli.com", cc: "clinical.pharmacy@alahli.com" },
    { department: "Finance", primary: "finance@alahli.com", cc: "billing@alahli.com,accounts@alahli.com" },
    { department: "GSD", primary: "gsd@alahli.com", cc: "support.gsd@alahli.com" },
    { department: "Claims Processing", primary: "claims@alahli.com", cc: "claims.supervisor@alahli.com" },
    { department: "User", primary: "user@domain.com", cc: "" }
  ];
}

export function AdminConfig() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"diagnosis" | "service" | "exception" | "contact">("diagnosis");
  const [loading, setLoading] = useState(true);
  const [diagnosisCodes, setDiagnosisCodes] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [contactMatrix, setContactMatrix] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ code: "", name: "", description: "" });
  const [newContact, setNewContact] = useState({ department: "", primary: "", cc: "" });
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState<number>(-1);

  // Load configuration from API
  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/config`);
      const data = await response.json();
      if (data.ok) {
        setDiagnosisCodes(data.config.diagnosisCodesRequiringApproval || []);
        setServices(data.config.servicesRequiringApproval || []);
        setExceptions(data.config.coverageExceptions || []);
        setContactMatrix(data.config.departmentContactMatrix || getDefaultContactMatrix());
      }
    } catch (e) {
      console.error('Error loading config:', e);
      // Load default contact matrix on error
      setContactMatrix(getDefaultContactMatrix());
    } finally {
      setLoading(false);
    }
  }

  async function saveServices(updatedServices: any[]) {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: updatedServices })
      });
      const data = await response.json();
      if (data.ok) {
        setServices(data.config.servicesRequiringApproval);
      }
    } catch (e) {
      console.error('Error saving services:', e);
    }
  }

  async function saveDiagnosisCodes(updatedCodes: any[]) {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/diagnosis-codes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codes: updatedCodes })
      });
      const data = await response.json();
      if (data.ok) {
        setDiagnosisCodes(data.config.diagnosisCodesRequiringApproval);
      }
    } catch (e) {
      console.error('Error saving diagnosis codes:', e);
    }
  }

  async function saveExceptions(updatedExceptions: any[]) {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/coverage-exceptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exceptions: updatedExceptions })
      });
      const data = await response.json();
      if (data.ok) {
        setExceptions(data.config.coverageExceptions);
      }
    } catch (e) {
      console.error('Error saving exceptions:', e);
    }
  }

  function handleAddItem() {
    if (editMode) {
      // Edit existing item
      if (dialogType === 'service') {
        const updated = [...services];
        updated[editIndex] = { code: newItem.code, name: newItem.name };
        saveServices(updated);
      } else if (dialogType === 'diagnosis') {
        const updated = [...diagnosisCodes];
        updated[editIndex] = { code: newItem.code, description: newItem.description };
        saveDiagnosisCodes(updated);
      } else if (dialogType === 'exception') {
        const updated = [...exceptions];
        updated[editIndex] = { service: newItem.name, coverage: newItem.description, notes: "" };
        saveExceptions(updated);
      }
    } else {
      // Add new item
      if (dialogType === 'service') {
        const updated = [...services, { code: newItem.code, name: newItem.name }];
        saveServices(updated);
      } else if (dialogType === 'diagnosis') {
        const updated = [...diagnosisCodes, { code: newItem.code, description: newItem.description }];
        saveDiagnosisCodes(updated);
      } else if (dialogType === 'exception') {
        const updated = [...exceptions, { service: newItem.name, coverage: newItem.description, notes: "" }];
        saveExceptions(updated);
      }
    }
    setNewItem({ code: "", name: "", description: "" });
    setEditMode(false);
    setEditIndex(-1);
    setAddDialogOpen(false);
  }

  function handleDeleteService(index: number) {
    const updated = services.filter((_, i) => i !== index);
    saveServices(updated);
  }

  function handleDeleteDiagnosis(index: number) {
    const updated = diagnosisCodes.filter((_, i) => i !== index);
    saveDiagnosisCodes(updated);
  }

  function handleDeleteException(index: number) {
    const updated = exceptions.filter((_, i) => i !== index);
    saveExceptions(updated);
  }

  function handleEditService(index: number) {
    const item = services[index];
    setNewItem({ code: item.code, name: item.name, description: "" });
    setEditMode(true);
    setEditIndex(index);
    setDialogType("service");
    setAddDialogOpen(true);
  }

  function handleEditDiagnosis(index: number) {
    const item = diagnosisCodes[index];
    setNewItem({ code: item.code, name: "", description: item.description });
    setEditMode(true);
    setEditIndex(index);
    setDialogType("diagnosis");
    setAddDialogOpen(true);
  }

  function handleEditException(index: number) {
    const item = exceptions[index];
    setNewItem({ code: "", name: item.service, description: item.coverage });
    setEditMode(true);
    setEditIndex(index);
    setDialogType("exception");
    setAddDialogOpen(true);
  }

  const contacts = [
    { department: "GSD Team", role: "Supervisor", email: "gsd@alahli.com", level: "Level 1" },
    { department: "Cardiology", role: "Department Head", email: "cardio@alahli.com", level: "Level 2" },
    { department: "Laboratory", role: "Lab Manager", email: "lab@alahli.com", level: "Level 1" },
    { department: "Pharmacy", role: "Pharmacy Head", email: "pharmacy@alahli.com", level: "Level 1" },
    { department: "Radiology", role: "Chief Radiologist", email: "radiology@alahli.com", level: "Level 2" },
  ];

  const openAddDialog = (type: typeof dialogType) => {
    setDialogType(type);
    setEditMode(false);
    setEditIndex(-1);
    setNewItem({ code: "", name: "", description: "" });
    setAddDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1>Admin Configuration</h1>
        <p className="text-gray-500">Manage system rules, thresholds, and contact information</p>
      </div>

      {/* Diagnosis Codes Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Diagnosis Codes Requiring Approval</CardTitle>
            <Button size="sm" onClick={() => openAddDialog("diagnosis")} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Code
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ICD Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diagnosisCodes.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.code}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      Requires Approval
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditDiagnosis(index)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteDiagnosis(index)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Services Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Services Requiring Approval</CardTitle>
            <Button size="sm" onClick={() => openAddDialog("service")} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      Requires Approval
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditService(index)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteService(index)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Coverage Exceptions Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Coverage Exceptions</CardTitle>
            <Button size="sm" onClick={() => openAddDialog("exception")} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Exception
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exceptions.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.service}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {item.coverage}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.notes}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditException(index)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteException(index)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Department Contact Matrix Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Department Contact Matrix</CardTitle>
            <Button size="sm" onClick={() => openAddDialog("contact")} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Contact
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Escalation Level</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.department}</TableCell>
                  <TableCell>{item.role}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        item.level === "Level 1"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-purple-50 text-purple-700"
                      }
                    >
                      {item.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit" : "Add"} {dialogType === "diagnosis" && "Diagnosis Code"}
              {dialogType === "service" && "Service"}
              {dialogType === "exception" && "Coverage Exception"}
              {dialogType === "contact" && "Department Contact"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to {editMode ? "update" : "add"} {editMode ? "this" : "a new"} entry.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {dialogType === "diagnosis" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="icd-code">ICD Code</Label>
                  <Input 
                    id="icd-code" 
                    placeholder="e.g., Z34" 
                    value={newItem.code}
                    onChange={(e) => setNewItem({...newItem, code: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    placeholder="Enter description" 
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  />
                </div>
              </>
            )}

            {dialogType === "service" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="service-code">Service Code</Label>
                  <Input 
                    id="service-code" 
                    placeholder="e.g., PST0001" 
                    value={newItem.code}
                    onChange={(e) => setNewItem({...newItem, code: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-desc">Service Name</Label>
                  <Input 
                    id="service-desc" 
                    placeholder="Enter service name" 
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  />
                </div>
              </>
            )}

            {dialogType === "exception" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="exception-service">Service</Label>
                  <Input id="exception-service" placeholder="e.g., Emergency Room Visit" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverage">Coverage</Label>
                  <Input id="coverage" placeholder="e.g., Full Coverage" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input id="notes" placeholder="Additional notes" />
                </div>
              </>
            )}

            {dialogType === "contact" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" placeholder="e.g., GSD Team" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" placeholder="e.g., Supervisor" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@alahli.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="escalation">Escalation Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="level1">Level 1</SelectItem>
                      <SelectItem value="level2">Level 2</SelectItem>
                      <SelectItem value="level3">Level 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>{editMode ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
