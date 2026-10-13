'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label"
import { z } from "zod";
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useApiMutation from '@/hooks/Mutations/useApiMutation'
import { APICONSTANT } from '@/services/config'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import useReactQuery from '@/hooks/useReactQuery'

interface Instructors {
    id: string;
    fullname: string;
    email: string;
    courses: string;
}

interface InstructorsApiResponse {
    error: boolean;
    data?: {
        data?: Instructors[];
    }
}

interface InstructorOption {
    id: string;
    fullname: string;
}

interface CommissionModalProps {
    mode: "add" | "edit";

    commission?: {
        instructorId: string;
        platformShare: number;
        instructorShare: number;
        effectiveFrom: string;
    };

    onClose: () => void;
    refetch: () => void;
    instructors?: InstructorOption[];
}

const schema = z.object({
    instructorId: z.string().min(1, "Instructor is required"),
    platformShare: z.coerce.number().min(1, "Required"),
    instructorShare: z.coerce.number().min(1, "Required"),
    effectiveFrom: z.string().min(1, "Date is required"),
});

type FormValues = z.infer<typeof schema>;

const CommissionsModal: React.FC<CommissionModalProps> = ({
    mode,
    commission,
    onClose,
    refetch,
    instructors = [],
}) => {
    const { data: previewInstructors } = useReactQuery<InstructorsApiResponse>("GET_INSTRUCTORS");

    const [isPending, startTransition] = React.useTransition();
    const queryClient = useQueryClient();

    const mutation = useApiMutation(
        mode === "add" ? "post" : "patch",
        ""
    );

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            instructorId: commission?.instructorId || "",
            platformShare: commission?.platformShare || 30,
            instructorShare: commission?.instructorShare || 70,
            effectiveFrom: commission?.effectiveFrom
                ? commission.effectiveFrom.split("T")[0]
                : "",
        },
    });

    const platformShare = watch("platformShare");
    const instructorShare = watch("instructorShare");

    React.useEffect(() => {
        if (platformShare >= 0 && platformShare <= 100) {
            setValue("instructorShare", 100 - platformShare);
        }
    }, [platformShare]);

    React.useEffect(() => {
        if (instructorShare >= 0 && instructorShare <= 100) {
            setValue("platformShare", 100 - instructorShare);
        }
    }, [instructorShare]);

    const onSubmit = async (data: FormValues) => {
        startTransition(async () => {
            try {
                // const payload = { ...data };

                const payload =
                    mode === "edit"
                        ? {
                            platformShare: data.platformShare,
                            instructorShare: data.instructorShare,
                            effectiveFrom: data.effectiveFrom,
                        }
                        : data;

                const response = await mutation.mutateAsync({
                    url: {
                        apiUrl:
                            mode === "add"
                                ? APICONSTANT.ADD_COMMISSION_OVERRIDE
                                : `${APICONSTANT.UPDATE_COMMISSION_OVERRIDE}/${commission?.instructorId}`,
                    },
                    body: payload,
                });

                if (!response?.error) {
                    await queryClient.invalidateQueries({ queryKey: ["GET_COMMISSION"] });
                }

                onClose();
                refetch();
            } catch (error) {
                console.error(error);
            }
        });
    };

    return (
        <DialogContent size="md">
            <DialogHeader>
                <DialogTitle>{mode === "add" ? "Add Override" : "Edit Override"}</DialogTitle>
                <DialogDescription>
                    {mode === "add"
                        ? "Fill details to create a new instructor override."
                        : "Modify the override details below."}
                </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <Label>Instructor</Label>

                    <Select
                        defaultValue={commission?.instructorId || ""}
                        onValueChange={(value) => setValue("instructorId", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select instructor" />
                        </SelectTrigger>

                        <SelectContent>
                            {previewInstructors?.data?.data?.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                    {item.fullname} | {item.email} | {item.courses} courses
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {errors.instructorId && (
                        <p className="text-red-500 text-xs">{errors.instructorId.message}</p>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Platform Share %</Label>
                        <Input type="number" {...register("platformShare")} min={0} max={100} />
                        {errors.platformShare && (
                            <p className="text-red-500 text-xs">{errors.platformShare.message}</p>
                        )}
                    </div>
                    <div>
                        <Label>Instructor Share %</Label>
                        <Input
                            type="number"
                            {...register("instructorShare")}
                            min={0}
                            max={100}
                            disabled
                        />
                        {errors.instructorShare && (
                            <p className="text-red-500 text-xs">{errors.instructorShare.message}</p>
                        )}
                    </div>
                </div>
                <div>
                    <Label>Effective From</Label>
                    <Input type="date" {...register("effectiveFrom")} />
                    {errors.effectiveFrom && (
                        <p className="text-red-500 text-xs">{errors.effectiveFrom.message}</p>
                    )}
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>

                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isPending
                            ? mode === "add"
                                ? "Creating..."
                                : "Updating..."
                            : mode === "add"
                                ? "Create"
                                : "Update"}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
};

export default CommissionsModal;