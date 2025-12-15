import { useEffect, useState } from 'react';
import { Search, Mail, Phone, Building, Edit, Trash2, Eye, X } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { format } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useDebounce } from "use-debounce";
import { AddNewClientModal } from './AddNewClientModal';
import type { RegisterRequestDto, UpdateRequestDto, UsersDetailsDto } from '../../generated-client';
import { http } from '../../lib/api';
import { useInitializeUsersDetails } from '../../hooks/useInitializeUsersDetails';
import { UsersDetailsAtom } from '../../atoms/admin/UsersDetailsAtom';
import { useAtom } from 'jotai';
import ConfirmationWindowModal from '../../components/ConfirmationWindowModal';
import { PaginationComponent } from '../../components/PaginationComponent';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';

export function ClientManagementPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'uk' ? uk : enUS;
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalMode, setModalMode] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [isActiveFilter, setisActiveFilter] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UsersDetailsDto | null>(null);
  const [usersDetails, setUsersDetails] = useAtom(UsersDetailsAtom);
  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(0);

  const { totalPages } = useInitializeUsersDetails({
    page: currentPage,
    pageSize: 9,
    search: debouncedSearch,
    filter: isActiveFilter,
    reloadFlag
  });

  useEffect(() => {
    setCurrentPage(1); 
  }, [debouncedSearch, isActiveFilter]);

  const handleAddUser = async (userData: RegisterRequestDto) => {
    try {

      await http.userManagement.registerUser(userData).then(r => {
        if (r !== null || r !== undefined) {
          setCurrentPage(1);
          setReloadFlag(prev => prev + 1);
          toast.success(t('clientManagement.userAddedSuccess'));

        } else {
          toast.error(t('clientManagement.failedToRegister', { email: userData.email }));
        }
      });
    } catch (error) {
      toast.error(t('clientManagement.errorPerformingOperation') + error);
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
          toast.success(t('clientManagement.userUpdatedSuccess'));

        } else {
          toast.error(t('clientManagement.failedToUpdate', { email: userData.email }));
        }
      });
    } catch (error) {
      toast.error(t('clientManagement.errorPerformingOperation') + error);
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
            toast.success(t('clientManagement.userDeletedSuccess'));
          } else {
            toast.error(t('clientManagement.errorDeletingUser'));
          }
        }
        else {
          toast.error(t('clientManagement.unexpectedError'));
        }
      }
    } catch (error) {
      toast.error(t('clientManagement.unexpectedError') + ": " + error);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {/* 🔍 Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={t('clientManagement.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 w-64"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* 🧩 Filter toggle */}
          <div className="flex items-center gap-2">
            <Label htmlFor="user-active" className="text-sm text-muted-foreground">
              {t('common.status')}:
            </Label>
            <Switch
              id="user-active"
              checked={isActiveFilter}
              onCheckedChange={(checked) => setisActiveFilter(checked)}
            />
            <span
              className={`text-sm font-medium ${isActiveFilter ? "text-green-600" : "text-gray-500"
                }`}
            >
              {isActiveFilter ? t('common.active') : t('common.inactive')}
            </span>
          </div>
        </div>

        {/* ➕ Add new client button */}
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


      {/* Clients Grid */}
      {usersDetails.length === 0 ? (
        <div className="text-center text-muted-foreground py-10">
          {debouncedSearch
            ? t('clientManagement.noUsersFound')
            : t('clientManagement.noUsersYet')}
        </div>
      ) : (
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
                    {client.projects?.length} {client.projects?.length === 1 ? t('clientManagement.project') : t('clientManagement.projects')}
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
                    {t('clientManagement.registered')}: {format(new Date(client.createdAt!), 'dd MMM yyyy', { locale })}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t">
                <Button variant="outline" className="flex-1" size="sm">
                  <Eye className="size-4 mr-1" />
                  {t('clientManagement.overview')}
                </Button>
                <Button variant="outline" className="flex-1" size="sm" onClick={() => openEditModal(client)}>
                  <Edit className="size-4 mr-1" />
                  {t('common.edit')}
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
      )}

      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <ConfirmationWindowModal
        isOpen={openConfirmDeleteModal}
        title={t('clientManagement.confirmDeletion')}
        message={t('clientManagement.confirmDeleteMessage', { email: selectedUser?.email })}
        onConfirm={handleDeleteUser}
        onCancel={handleConfirmationModalClose}
      />
    </div>
  );
}
