import { Button } from "./ui/button";

interface ConfirmationWindowModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export default function ConfirmationWindowModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmationWindowModalProps) {
    if (!isOpen) return null;

    return (
        <dialog className="modal bg-opacity-60 bg-black" open>
            <div className="modal-box">
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="py-4">{message}</p>
                <div className="flex justify-end space-x-4 mt-4">
                    <Button
                        variant="outline"
                        onClick={onConfirm}
                    >
                        Confirm
                    </Button>
                    <Button
                        className="bg-[#F97316] hover:bg-[#F97316]/90"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </dialog>
    );
}
