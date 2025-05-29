"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Edit,
  Plus,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { AdoptionManagementService } from "@/services/adoption/adoption-management/services";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Adoption } from "@/services/adoption/adoption-management/services";
import RedirectButton from "@/components/redirect-button";
import { HomeIcon } from "lucide-react";
import { NavBar } from "@/components/navbar";
import {
  AdoptionServerAuthWrapper,
  exportedRole,
} from "@/app/protected/adoption/AdoptionServerAuthWrapper";

// This ensures the auth check runs on every request
export const dynamic = "force-dynamic";

export default function AdoptionManagementPage() {
  const router = require("next/navigation").useRouter();
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [filteredAdoptions, setFilteredAdoptions] = useState<Adoption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const role = exportedRole;

  const supabase = createClientComponentClient();
  const adoptionService = new AdoptionManagementService();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Lunas":
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Lunas</Badge>;
      case "Tertunda":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Tertunda</Badge>;
      case "Dibatalkan":
        return <Badge variant="destructive">Dibatalkan</Badge>;
      case "Gagal":
        return <Badge variant="destructive">Gagal</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  useEffect(() => {
    fetchAdoptions();
  }, []);

  useEffect(() => {
    let result = adoptions;

    // Apply search filter
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        (adoption) =>
          adoption.animal_name?.toLowerCase().includes(lowercaseSearch) ||
          adoption.animal_species?.toLowerCase().includes(lowercaseSearch) ||
          adoption.adopter_name?.toLowerCase().includes(lowercaseSearch) ||
          adoption.id_adopter?.toLowerCase().includes(lowercaseSearch) ||
          adoption.id_hewan?.toLowerCase().includes(lowercaseSearch)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (adoption) =>
          adoption.status_pembayaran.toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    setFilteredAdoptions(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, adoptions]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAdoptions = filteredAdoptions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredAdoptions.length / itemsPerPage);

  async function fetchAdoptions() {
    setLoading(true);
    try {
      const adoptionsData = await adoptionService.getAllAdoptions();
      setAdoptions(adoptionsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching adoptions:", err);
      setError("Failed to load adoptions");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, adopterId: string) {
    try {
      const { error } = await supabase.from("adoptions").delete().eq("id", id);

      if (error) throw error;

      // Refresh the data
      fetchAdoptions();
    } catch (err) {
      console.error("Error deleting adoption:", err);
      setError("Failed to delete adoption");
    }
  }

  function handleEdit(id: string) {
    router.push(`/protected/adoption/adoption-management/update?id=${id}`);
  }

  function handleCreate() {
    router.push("/protected/adoption/adoption-management/create");
  }

  function handleStatusChange(
    id_adopter: string,
    id_hewan: string,
    newStatus: "Lunas" | "Tertunda" | "Dibatalkan" | "Gagal"
  ) {
    adoptionService
      .updateAdoptionStatus(id_adopter, id_hewan, newStatus)
      .then(() => {
        fetchAdoptions();
      })
      .catch((err) => {
        console.error("Error updating status:", err);
        setError("Failed to update status");
      });
  }

  function handlePageChange(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  if (loading)
    return (
      <AdoptionServerAuthWrapper>
        <>
          <NavBar user={null}></NavBar>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading adoptions...</p>
            </div>
          </div>
        </>
      </AdoptionServerAuthWrapper>
    );

  if (error)
    return (
      <AdoptionServerAuthWrapper>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          {/* Redirect buttons for navigation */}

          {/* Redirect to adoption page (staff only) */}
          {role === "staff" && (
            <div className="flex justify-end mt-4">
              <RedirectButton
                href="/protected/adoption"
                variant="default"
                size="icon"
                className="w-full max-w-xs"
              >
                Back to Adoption Page
              </RedirectButton>
            </div>
          )}

          <div className="flex justify-end">
            <RedirectButton
              href="/protected"
              variant="destructive"
              size="icon"
              className="w-full max-w-xs flex items-center gap-2"
            >
              <HomeIcon size={16} />
              Back to Homepage
            </RedirectButton>
          </div>
        </div>
      </AdoptionServerAuthWrapper>
    );

  return (
    <div className="container mx-auto py-6 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Adoption Management</CardTitle>
          <CardDescription>
            View and manage all animal adoptions in the system
          </CardDescription>
          <div className="flex justify-end">
            <Button onClick={handleCreate} className="default">
              <Plus className="h-4 w-4 mr-2" />
              Create New Adoption
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and filter controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by animal or adopter..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[180px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Lunas">Lunas</SelectItem>
                  <SelectItem value="Tertunda">Tertunda</SelectItem>
                  <SelectItem value="Dibatalkan">Dibatalkan</SelectItem>
                  <SelectItem value="Gagal">Gagal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-[120px]">
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Items per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="30">30 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredAdoptions.length === 0 ? (
            <div className="text-center p-12 border rounded-md bg-gray-50">
              <p className="text-muted-foreground">
                {adoptions.length === 0
                  ? "No adoptions found in the system."
                  : "No adoptions match your search criteria."}
              </p>
              {adoptions.length > 0 && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal</TableHead>
                  <TableHead>Adopter</TableHead>
                  <TableHead>Contribution</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentAdoptions.map((adoption) => (
                  <TableRow key={`${adoption.id_adopter}-${adoption.id_hewan}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          {adoption.animal_photo ? (
                            <AvatarImage
                              src={adoption.animal_photo}
                              alt={adoption.animal_name}
                            />
                          ) : null}
                          <AvatarFallback>
                            {adoption.animal_name
                              ?.substring(0, 2)
                              .toUpperCase() || "AN"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{adoption.animal_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {adoption.animal_species}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{adoption.adopter_name}</p>
                        <p className="text-xs text-muted-foreground">
                          ID:{" "}
                          {adoption.id_adopter.length > 8
                            ? `${adoption.id_adopter.substring(0, 8)}...`
                            : adoption.id_adopter}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        Rp {adoption.kontribusi_finansial.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(adoption.status_pembayaran)}
                    </TableCell>
                    <TableCell>
                      {new Date(adoption.tgl_mulai_adopsi).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(
                        adoption.tgl_berhenti_adopsi
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {adoption.status_pembayaran !== "Lunas" &&
                          adoption.status_pembayaran !== "paid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusChange(
                                  adoption.id_adopter,
                                  adoption.id_hewan,
                                  "Lunas"
                                )
                              }
                              className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span className="sr-only sm:not-sr-only sm:ml-1">
                                Approve
                              </span>
                            </Button>
                          )}
                        {(adoption.status_pembayaran === "Tertunda" ||
                          adoption.status_pembayaran === "pending") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStatusChange(
                                adoption.id_adopter,
                                adoption.id_hewan,
                                "Dibatalkan"
                              )
                            }
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            <span className="sr-only sm:not-sr-only sm:ml-1">
                              Reject
                            </span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleEdit(
                              `${adoption.id_adopter}-${adoption.id_hewan}`
                            )
                          }
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          <span className="sr-only sm:not-sr-only sm:ml-1">
                            Edit
                          </span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleDelete(adoption.id_adopter, adoption.id_hewan)
                          }
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          <span className="sr-only sm:not-sr-only sm:ml-1">
                            Delete
                          </span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {filteredAdoptions.length > itemsPerPage && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1}-
                {Math.min(indexOfLastItem, filteredAdoptions.length)} of{" "}
                {filteredAdoptions.length}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  let pageNumber;

                  // Handle pagination display logic for when there are many pages
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else {
                    if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                  }

                  return (
                    <Button
                      key={i}
                      variant={
                        currentPage === pageNumber ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Note</AlertTitle>
          <AlertDescription>
            The "Contribution" value is based on thousands of Rupiah (Rp)
          </AlertDescription>
        </Alert>

        {/* Redirect buttons for navigation */}

        {/* Redirect to adoption page (staff only) */}
        {role === "staff" && (
          <div className="flex justify-end mt-4">
            <RedirectButton
              href="/protected/adoption"
              variant="default"
              size="icon"
              className="w-full max-w-xs"
            >
              Back to Adoption Page
            </RedirectButton>
          </div>
        )}

        <div className="flex justify-end">
          <RedirectButton
            href="/protected"
            variant="destructive"
            size="icon"
            className="w-full max-w-xs flex items-center gap-2"
          >
            <HomeIcon size={16} />
            Back to Homepage
          </RedirectButton>
        </div>
      </div>
    </div>
  );
}
