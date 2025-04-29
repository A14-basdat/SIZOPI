'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Plus, Loader2, Search, ChevronLeft, ChevronRight, UserRound, Building2 } from 'lucide-react';
import { AdopterManagementService, Adopter } from '@/services/adoption/adopter-management/services';
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
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HomeIcon } from "lucide-react";
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import RedirectButton from "@/components/redirect-button";

export default function AdopterManagementPage() {
  const router = require('next/navigation').useRouter();
  const [adopters, setAdopters] = useState<Adopter[]>([]);
  const [filteredAdopters, setFilteredAdopters] = useState<Adopter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState('all');
  
  // Add confirmation dialog state
  const [selectedAdopter, setSelectedAdopter] = useState<Adopter | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const adopterService = new AdopterManagementService();
  
  useEffect(() => {
    fetchAdopters();
  }, []);
  
  useEffect(() => {
    // Filter adopters based on search term and active tab
    let result = adopters;
    
    // Apply tab filter
    if (activeTab === 'individuals') {
      result = result.filter(adopter => adopter.jenis_adopter === 'individu');
    } else if (activeTab === 'organizations') {
      result = result.filter(adopter => adopter.jenis_adopter === 'organisasi');
    }
    
    // Apply search filter
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      result = result.filter(adopter => {
        const nameToSearch = adopter.jenis_adopter === 'individu' 
          ? adopter.nama?.toLowerCase() 
          : adopter.nama_organisasi?.toLowerCase();
          
        return (
          nameToSearch?.includes(lowercaseSearch) ||
          adopter.username_adopter?.toLowerCase().includes(lowercaseSearch) ||
          adopter.nik?.includes(lowercaseSearch) ||
          adopter.npp?.includes(lowercaseSearch) ||
          adopter.email_adopter?.toLowerCase().includes(lowercaseSearch) ||
          adopter.no_telp_adopter?.includes(lowercaseSearch)
        );
      });
    }
    
    setFilteredAdopters(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, activeTab, adopters]);
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAdopters = filteredAdopters.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAdopters.length / itemsPerPage);
  
  async function fetchAdopters() {
    setLoading(true);
    try {
      const adoptersData = await adopterService.getAllAdopters();
      setAdopters(adoptersData);
      setFilteredAdopters(adoptersData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching adopters:', err);
      setError(err.message || 'Failed to load adopters');
    } finally {
      setLoading(false);
    }
  }
  
  // Replace the direct delete with a dialog opener
  function handleDeleteClick(adopter: Adopter) {
    setSelectedAdopter(adopter);
    setIsDeleteDialogOpen(true);
  }
  
  // Actual delete function now used by the confirmation dialog
  async function handleConfirmDelete() {
    if (!selectedAdopter) return;
    
    setIsDeleting(true);
    try {
      await adopterService.deleteAdopter(selectedAdopter.id_adopter);
      fetchAdopters();
    } catch (err: any) {
      console.error('Error deleting adopter:', err);
      setError(err.message || 'Failed to delete adopter');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  }
  
  function handleEdit(id: string) {
    router.push(`/protected/adoption/adopter-management/edit?id=${id}`);
  }
  
  function handleCreate() {
    router.push('/protected/adoption/adopter-management/create');
  }
  
  function handlePageChange(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }
  
  function handleTabChange(value: string) {
    setActiveTab(value);
  }
  
  function getAdopterName(adopter: Adopter): string {
    if (adopter.jenis_adopter === 'individu') {
      return adopter.nama || 'Unknown Individual';
    } else {
      return adopter.nama_organisasi || 'Unknown Organization';
    }
  }
  
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading adopters...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="p-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  );
  
  const individualCount = adopters.filter(a => a.jenis_adopter === 'individu').length;
  const organizationCount = adopters.filter(a => a.jenis_adopter === 'organisasi').length;
  
  return (
    <div className="container mx-auto py-6 px-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Adopter Management</CardTitle>
              <CardDescription>
                Manage individual and organizational adopters
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Adopter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">
                All Adopters ({adopters.length})
              </TabsTrigger>
              <TabsTrigger value="individuals">
                <UserRound className="h-4 w-4 mr-2" />
                Individuals ({individualCount})
              </TabsTrigger>
              <TabsTrigger value="organizations">
                <Building2 className="h-4 w-4 mr-2" />
                Organizations ({organizationCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Search and filter controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search adopters..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
          
          {filteredAdopters.length === 0 ? (
            <div className="text-center p-12 border rounded-md bg-gray-50">
              <p className="text-muted-foreground">
                {adopters.length === 0 
                  ? "No adopters found in the system." 
                  : "No adopters match your search criteria."}
              </p>
              {adopters.length > 0 && (
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => {
                    setSearchTerm('');
                    setActiveTab('all');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adopter</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Total Contribution</TableHead>
                    <TableHead>Active Adoptions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentAdopters.map((adopter) => (
                    <TableRow key={adopter.id_adopter}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            {adopter.profile?.foto_profil ? (
                              <AvatarImage 
                                src={adopter.profile.foto_profil} 
                                alt={getAdopterName(adopter)} 
                              />
                            ) : null}
                            <AvatarFallback>
                              {adopter.jenis_adopter === 'individu' ? 
                                (adopter.nama?.substring(0, 2).toUpperCase() || 'IN') :
                                (adopter.nama_organisasi?.substring(0, 2).toUpperCase() || 'ORG')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{getAdopterName(adopter)}</p>
                            <p className="text-xs text-muted-foreground">
                              {adopter.email_adopter || 'No email'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={adopter.jenis_adopter === 'individu' ? 'outline' : 'secondary'}>
                          {adopter.jenis_adopter === 'individu' ? (
                            <>
                              <UserRound className="h-3 w-3 mr-1" />
                              Individual
                            </>
                          ) : (
                            <>
                              <Building2 className="h-3 w-3 mr-1" />
                              Organization
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {adopter.jenis_adopter === 'individu' ? 
                            `NIK: ${adopter.nik || '-'}` : 
                            `NPP: ${adopter.npp || '-'}`}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">@{adopter.username_adopter}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">
                          Rp {adopter.total_kontribusi.toLocaleString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={adopter.active_adoptions && adopter.active_adoptions > 0 ? "success" : "outline"}>
                          {adopter.active_adoptions || 0} animal{adopter.active_adoptions !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(adopter.id_adopter)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            <span className="sr-only sm:not-sr-only sm:ml-1">Edit</span>
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteClick(adopter)}
                            disabled={adopter.active_adoptions && adopter.active_adoptions > 0}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            <span className="sr-only sm:not-sr-only sm:ml-1">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination */}
          {filteredAdopters.length > itemsPerPage && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAdopters.length)} of {filteredAdopters.length}
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
                      variant={currentPage === pageNumber ? "default" : "outline"}
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
            Adopters with active adoptions cannot be deleted. Please cancel or transfer their adoptions first.
          </AlertDescription>
        </Alert>

        <div className="flex justify-end">
          <RedirectButton
            href="/protected/adoption"
            variant="default"
            size="icon"
            className="w-full max-w-xs"
          >
            Back to Adoption Page
          </RedirectButton>
        </div>

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
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        title="Delete Adopter"
        description={selectedAdopter ? 
          `Are you sure you want to delete ${getAdopterName(selectedAdopter)}? This action cannot be undone.` : 
          "Are you sure you want to delete this adopter?"}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}