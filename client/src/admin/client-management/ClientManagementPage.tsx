import { useState } from 'react';
import { Search, Mail, Phone, Building, Edit, Trash2, Eye } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { AddNewClientModal } from './AddNewClientModal';
import type { RegisterRequestDto, UpdateRequestDto, UsersDetailsDto } from '../../generated-client';
import { http } from '../../lib/apiV2';
import { useInitializeUsersDetails } from '../../hooks/useInitializeUsersDetails';
import { UsersDetailsAtom } from '../../atoms/admin/UsersDetailsAtom';
import { useAtom } from 'jotai';
import ConfirmationWindowModal from '../../components/ConfirmationWindowModal';

export function ClientManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalMode, setModalMode] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsersDetailsDto | null>(null);
  const [usersDetails, setUsersDetails] = useAtom(UsersDetailsAtom);
  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState(false);

  useInitializeUsersDetails({ page: currentPage });

  const handleAddUser = async (userData: RegisterRequestDto) => {
    try {

      await http.userManagement.registerUser(userData).then(r => {
        if (r !== null || r !== undefined) {
          setUsersDetails((prevUsers) => [...prevUsers, r]);
          toast.success("User added successfully.");

        } else {
          toast.error(`Failed to register the user: ${userData.email}. 
                        Please insert this account again.`);
        }
      });
    } catch (error) {
      toast.error("Error performing operation for the user: " + error);
    } finally {
      setModalOpen(false);
    }
  };

  const handleUpdateUser = async (userData: UpdateRequestDto) => {
    try {

      await http.userManagement.updateUser(userData).then(r => {
        if (r !== null && r !== undefined) {
          setUsersDetails((prevUsers) =>
            prevUsers.map((user) => (user.userId === r.userId ? r : user)));
          toast.success("User updated successfully.");

        } else {
          toast.error(`Failed to update the user: ${userData.email}. 
                        Please try again.`);
        }
      });
    } catch (error) {
      toast.error("Error performing operation for the user: " + error);
    } finally {
      setModalOpen(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      if (selectedUser != null) {
        if (selectedUser.userId != null) {
          const response = await http.userManagement.deleteUser(selectedUser.userId);
          if (response.status === true) {
            setUsersDetails((prevUsers) =>
              prevUsers.filter((user) => user.userId !== selectedUser.userId)
            );
            toast.success("User deleted successfully.");
          } else {
            toast.error("Error deleting user.");
          }
        }
        else {
          toast.error("An unexpected error occurred, please try again later.");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred: " + error);
    } finally {
      handleConfirmationModalClose();
    }
  };

  const openAddModal = () => {
    setModalMode("create");
    setSelectedUser(null);
    setModalOpen(true);
  };

  const openEditModal = (user: UsersDetailsDto) => {
    setModalMode("edit");
    setSelectedUser(user);
    setModalOpen(true);
  };

  const openDeleteModal = (user: UsersDetailsDto) => {
    setSelectedUser(user);
    setOpenConfirmDeleteModal(true);
  };

  const handleConfirmationModalClose = () => {
    setOpenConfirmDeleteModal(false);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2>Total clients: {usersDetails.length}</h2>
        </div>
        <AddNewClientModal
          addUser={handleAddUser}
          mode={modalMode}
          updateUser={handleUpdateUser}
          user={selectedUser ?? ({} as UsersDetailsDto)}
          onOpenAdd={openAddModal}
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search clients by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usersDetails.map(client => (
          <Card key={client.userId} className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="size-12">
                <AvatarImage src={"src/resources/profile.png"} />
                <AvatarFallback>{client.firstName!.split(' ').map(n => n[0]).join('')
                  + client.lastName!.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="mb-1">{client.firstName + " " + client.lastName}</h4>
                <Badge variant="secondary">
                  {client.projects?.length} {client.projects?.length === 1 ? 'project' : 'projects'}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                <span>{client.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Building className="size-4 shrink-0" />
                <span>
                  Registered: {format(new Date(client.createdAt!), 'dd MMM yyyy', { locale: enUS })}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-6 pt-4 border-t">
              <Button variant="outline" className="flex-1" size="sm">
                <Eye className="size-4 mr-1" />
                Overview
              </Button>
              <Button variant="outline" className="flex-1" size="sm" onClick={() => openEditModal(client)}>
                <Edit className="size-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => openDeleteModal(client)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <ConfirmationWindowModal
        isOpen={openConfirmDeleteModal}
        title="Bekræft sletning"
        message={`Er du sikker på, at du vil slette ${selectedUser?.email}? Denne handling kan ikke fortrydes.`}
        onConfirm={handleDeleteUser}
        onCancel={handleConfirmationModalClose}
      />
    </div>
  );
}
