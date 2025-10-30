import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import type { RegisterRequestDto } from "../../generated-client";

interface AddNewClientModalProps {
    onSave: (userData: RegisterRequestDto) => void | Promise<void>;
}

export function AddNewClientModal({ onSave }: AddNewClientModalProps) {

    const [isAddClientOpen, setIsAddClientOpen] = useState(false);
    const [errors, setErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: ""
    });
    const [dtoData, setDtoData] = useState<RegisterRequestDto>({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        language: "",
    });


    const handleAddClient = () => {
        if (!validateForm()) {
            toast.error('Please fill in all fields');
            return;
        }

        onSave(dtoData);
        setIsAddClientOpen(false);
        clearFields();
    };

    const clearFields = () => {
        setDtoData({
            email: "",
            firstName: "",
            lastName: "",
            phoneNumber: "",
            language: ""
        });
    };

    const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

    const validateForm = () => {
        const newErrors = { firstName: "", lastName: "", email: "", phoneNumber: "" };

        if (!dtoData.firstName) {
            newErrors.firstName = "First Name is required.";
        }
        if (!dtoData.lastName) {
            newErrors.lastName = "Last Name is required.";
        }
        if (!dtoData.email || !validateEmail(dtoData.email)) {
            newErrors.email = "Invalid email.";
        }
        if (!dtoData.phoneNumber || dtoData.phoneNumber.length != 8) {
            newErrors.phoneNumber = "Phone must be numeric with 8 digits.";
        }

        setErrors(newErrors);

        return !newErrors.firstName && !newErrors.lastName && !newErrors.email && !newErrors.phoneNumber;
    };

    return <>
        <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#F97316] hover:bg-[#F97316]/90">
                    <Plus className="size-4 mr-2" />
                    Add client
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add a new client</DialogTitle>
                    <DialogDescription>
                        Enter the new client details to register them in the system
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="client-first-name">First Name</Label>
                        <Input
                            id="client-first-name"
                            value={dtoData.firstName}
                            onChange={(e) => setDtoData((prev) => ({ ...prev, firstName: e.target.value }))}
                            placeholder="Ivan"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="client-last-name">Last Name</Label>
                        <Input
                            id="client-last-name"
                            value={dtoData.lastName}
                            onChange={(e) => setDtoData((prev) => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Ivanenko"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="client-email">Email</Label>
                        <Input
                            id="client-email"
                            type="email"
                            value={dtoData.email}
                            onChange={(e) => setDtoData((prev) => ({ ...prev, email: e.target.value }))}
                            placeholder="ivanov@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="client-phone">Phone</Label>
                        <Input
                            id="client-phone"
                            type="tel"
                            value={dtoData.phoneNumber}
                            onChange={(e) => setDtoData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                            placeholder="+380 67 123 4567"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="client-phone"></Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary">
                                    <span className="hidden sm:inline">
                                        {dtoData.language ? dtoData.language : "Language"}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => setDtoData((prev) => ({ ...prev, language: "ENG" }))}>English</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => setDtoData((prev) => ({ ...prev, language: "UKR" }))}>Ukranian</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => {
                        clearFields();
                        setIsAddClientOpen(false);
                    }}>
                        Cancel
                    </Button>
                    <Button onClick={handleAddClient} className="bg-[#F97316] hover:bg-[#F97316]/90">
                        Add client
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
}
