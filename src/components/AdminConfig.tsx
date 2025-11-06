import { useState } from "react";
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

export function AdminConfig() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"diagnosis" | "service" | "exception" | "contact">("diagnosis");

  // Mock data
  const diagnosisCodes = [
    { code: "Z34", description: "Supervision of normal pregnancy", status: "Requires Approval" },
    { code: "F32", description: "Depressive episode", status: "Requires Approval" },
    { code: "O80", description: "Encounter for full-term delivery", status: "Requires Approval" },
    { code: "I10", description: "Essential hypertension", status: "Requires Approval" },
  ];

  const services = [
    { code: "S-1234", description: "CT Scan - Brain", status: "Requires Approval" },
    { code: "S-5678", description: "MRI - Spine", status: "Requires Approval" },
    { code: "S-9012", description: "Ultrasound - Abdomen", status: "No Approval Needed" },
    { code: "S-3456", description: "ECG - Standard", status: "No Approval Needed" },
  ];

  const exceptions = [
    { service: "Emergency Room Visit", coverage: "Full Coverage", notes: "No pre-approval required" },
    { service: "Basic Lab Tests", coverage: "100%", notes: "CBC, Urinalysis included" },
    { service: "Preventive Care", coverage: "100%", notes: "Annual checkup covered" },
  ];

  const contacts = [
    { department: "GSD Team", role: "Supervisor", email: "gsd@alahli.com", level: "Level 1" },
    { department: "Cardiology", role: "Department Head", email: "cardio@alahli.com", level: "Level 2" },
    { department: "Laboratory", role: "Lab Manager", email: "lab@alahli.com", level: "Level 1" },
    { department: "Pharmacy", role: "Pharmacy Head", email: "pharmacy@alahli.com", level: "Level 1" },
    { department: "Radiology", role: "Chief Radiologist", email: "radiology@alahli.com", level: "Level 2" },
  ];

  const openAddDialog = (type: typeof dialogType) => {
    setDialogType(type);
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
                      {item.status}
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
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        item.status === "Requires Approval"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-green-50 text-green-700"
                      }
                    >
                      {item.status}
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
              {dialogType === "diagnosis" && "Add Diagnosis Code"}
              {dialogType === "service" && "Add Service"}
              {dialogType === "exception" && "Add Coverage Exception"}
              {dialogType === "contact" && "Add Department Contact"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new entry.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {dialogType === "diagnosis" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="icd-code">ICD Code</Label>
                  <Input id="icd-code" placeholder="e.g., Z34" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder="Enter description" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="requires">Requires Approval</SelectItem>
                      <SelectItem value="no-approval">No Approval Needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {dialogType === "service" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="service-code">Service Code</Label>
                  <Input id="service-code" placeholder="e.g., S-1234" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-desc">Description</Label>
                  <Input id="service-desc" placeholder="Enter description" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-status">Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="requires">Requires Approval</SelectItem>
                      <SelectItem value="no-approval">No Approval Needed</SelectItem>
                    </SelectContent>
                  </Select>
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
            <Button onClick={() => setAddDialogOpen(false)}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
