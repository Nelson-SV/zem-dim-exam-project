import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import type { RegisterRequestDto, UpdateRequestDto, UsersDetailsDto } from "../../generated-client";
import { Switch } from "../../components/ui/switch";

interface AddNewClientModalProps {
    addUser: (userData: RegisterRequestDto) => Promise<void>;
    updateUser: (userData: UpdateRequestDto) => Promise<void>;
    isOpen?: boolean;
    mode: string;
    user: UsersDetailsDto;
    onOpenAdd?: () => void;
    onClose?: () => void;
}

export function AddNewClientModal({ addUser, updateUser, mode, user, isOpen, onOpenAdd, onClose }: AddNewClientModalProps) {
    const { t } = useTranslation();

    const [errors, setErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: ""
    });
    const [formData, setFormData] = useState({
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        language: "",
        isActive: true,
        isDeleted: false,
    });

    useEffect(() => {
        if (!isOpen) return

        if (mode === "edit" && user) {
            setFormData({
                id: user.userId!,
                firstName: user.firstName!,
                lastName: user.lastName!,
                email: user.email!,
                phoneNumber: user.phoneNumber!,
                language: user.language!,
                isActive: user.isActive!,
                isDeleted: user.isDeleted!
            });
        } else {
            setFormData({
                id: "",
                firstName: "",
                lastName: "",
                email: "",
                phoneNumber: "",
                language: "",
                isActive: true,
                isDeleted: false
            });
        }
    }, [isOpen, mode, user]);


    const clearFields = () => {
        setFormData({
            id: "",
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            language: "",
            isActive: true,
            isDeleted: false,
        });
        setErrors({ firstName: "", lastName: "", email: "", phoneNumber: "" });
    };

    const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

    const validatePhoneNumber = (phone: string) => /^\+?\d{8,15}$/.test(phone);


    const validateForm = () => {
        const newErrors = { firstName: "", lastName: "", email: "", phoneNumber: "" };

        if (!formData.firstName) {
            newErrors.firstName = t('clientManagement.firstNameRequired');
        }
        if (!formData.lastName) {
            newErrors.lastName = t('clientManagement.lastNameRequired');
        }
        if (!formData.email || !validateEmail(formData.email)) {
            newErrors.email = t('clientManagement.invalidEmail');
        }
        if (!formData.phoneNumber || !validatePhoneNumber(formData.phoneNumber)) {
            newErrors.phoneNumber = t('clientManagement.invalidPhoneNumber');
        }

        setErrors(newErrors);

        return !newErrors.firstName && !newErrors.lastName && !newErrors.email && !newErrors.phoneNumber;
    };

    const handleSave = () => {
        if (!validateForm()) {
            toast.error(t('clientManagement.fillAllFields'));
            return;
        }

        if (mode === "edit") {
            const updatePayload: UpdateRequestDto = {
                id: formData.id!,
                firstName: formData.firstName!,
                lastName: formData.lastName!,
                email: formData.email!,
                phoneNumber: formData.phoneNumber,
                language: formData.language,
                isActive: formData.isActive,
                isDeleted: formData.isDeleted,
            };
            updateUser(updatePayload)
        } else {
            const registerPayload: RegisterRequestDto = {
                firstName: formData.firstName!,
                lastName: formData.lastName!,
                email: formData.email!,
                phoneNumber: formData.phoneNumber!,
                language: formData.language,
            };
            addUser(registerPayload);
        }
        onClose?.();
        clearFields();
    };

    const handleCancel = () => {
        clearFields();
        onClose?.();
    };

    return <>
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose?.();
                else onOpenAdd?.();
            }}
        >
            <form>
                <DialogTrigger asChild>
                    <Button
                        className="bg-[#F97316] hover:bg-[#F97316]/90"
                        onClick={onOpenAdd}
                    >
                        <Plus className="size-4" />
                        {t('clientManagement.addClient')}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {mode === "edit" ? t('clientManagement.editUser') : t('clientManagement.addNewClient')}
                        </DialogTitle>
                        <DialogDescription>
                            {mode === "edit"
                                ? t('clientManagement.updateClientDetails')
                                : t('clientManagement.enterClientDetails')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="client-first-name">{t('clientManagement.firstName')}</Label>
                            <Input
                                id="client-first-name"
                                value={formData.firstName}
                                onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value.trim() }))}
                                placeholder="Ivan"
                                className="placeholder:text-gray-500"
                            />
                            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="client-last-name">{t('clientManagement.lastName')}</Label>
                            <Input
                                id="client-last-name"
                                value={formData.lastName}
                                onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value.trim() }))}
                                placeholder="Ivanenko"
                                className="placeholder:text-gray-500"
                            />
                            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="client-email">{t('common.email')}</Label>
                            <Input
                                id="client-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value.trim() }))}
                                placeholder="ivan@example.com"
                                className="placeholder:text-gray-500"
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="client-phone">{t('common.phone')}</Label>
                            <Input
                                id="client-phone"
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value.trim() }))}
                                placeholder="+380671234567"
                                className="placeholder:text-gray-500"
                            />
                            {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="client-phone">{t('clientManagement.chooseLanguage')}</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="secondary">
                                        <span className="hidden sm:inline">
                                            {formData.language ? formData.language : t('clientManagement.options')}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuItem onSelect={() => setFormData((prev) => ({ ...prev, language: "ENG" }))}>{t('clientManagement.english')}</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => setFormData((prev) => ({ ...prev, language: "UKR" }))}>{t('clientManagement.ukrainian')}</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        {mode === "edit" &&
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="user-active">{t('common.status')}</Label>
                                <Switch
                                    id="user-active"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            isActive: checked,
                                            isDeleted: !checked,
                                        }))
                                    }
                                />
                                <span className={formData.isActive ? "text-green-600 font-medium" : "text-gray-500"}>
                                    {formData.isActive ? t('common.active') : t('common.inactive')}
                                </span>
                            </div>}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={handleCancel}>
                                {t('common.cancel')}
                            </Button>
                        </DialogClose>
                        <Button onClick={handleSave} className="bg-[#F97316] hover:bg-[#F97316]/90">
                            {mode === "edit" ? t('clientManagement.saveChanges') : t('clientManagement.addClient')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    </>
}
