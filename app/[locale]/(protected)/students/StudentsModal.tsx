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
import { Label } from "@/components/ui/label"
import { z } from "zod"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useApiMutation from '@/hooks/Mutations/useApiMutation'
import { APICONSTANT } from '@/services/config'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Toggle } from "@/components/ui/toggle"
import { PasswordInput } from '@/components/ui/passwordInput'

interface StudentsModalProps {
    mode: "add" | "edit" | "view" | "resetPassword";
    students?: {
        id?: string;
        fullname: string;
        email: string;
        password?: string;
        sendInvitationEmail?: boolean;
    };
    onClose: () => void;
    refetch: () => void;
}

const baseSchema = z.object({
    fullname: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 chars").optional(),
    sendInvitationEmail: z.boolean().optional(),
}).superRefine((data, ctx) => {
    if (!data.sendInvitationEmail && !data.password) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Password is required if not sending an invitation email.",
            path: ["password"],
        });
    }
});

type StudentsFormValues = z.infer<typeof baseSchema>;

const StudentsModal: React.FC<StudentsModalProps> = ({ mode, students, onClose, refetch }) => {
    const [isPending, startTransition] = React.useTransition();
    const queryClient = useQueryClient();
    //   const mutation = useApiMutation(mode === "add" ? "post" : "put", "");
    const mutation = useApiMutation(
        mode === "add" ? "post" : mode === "resetPassword" ? "patch" : "put",
        ""
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<StudentsFormValues>({
        resolver: zodResolver(baseSchema),
        defaultValues: {
            fullname: students?.fullname || "",
            email: students?.email || "",
            password: students?.password || "",
            sendInvitationEmail: students?.sendInvitationEmail ?? false,
        },
    });

    const sendInvitation = watch("sendInvitationEmail");

    const onSubmit = async (data: StudentsFormValues) => {
        let payload: any = {};

        let url =
            mode === "resetPassword"
                ? `${APICONSTANT.RESET_PASSWORD_STUDENTS}/${students?.id}`
                : mode === "add"
                    ? APICONSTANT.GET_STUDENTS
                    : `${APICONSTANT.GET_STUDENTS}/${students?.id}`;

        if (mode === "resetPassword") {
            payload.newPassword = data.password;
        } else {
            payload = {
                fullname: `${data.fullname}`,
                email: data.email,
                sendInvitationEmail: data.sendInvitationEmail,
            };
            if (!data.sendInvitationEmail) payload.password = data.password;
        }

        startTransition(async () => {
            try {
                const response = await mutation.mutateAsync({ url: { apiUrl: url }, body: payload });
                if (!response?.error) {
                    await queryClient.invalidateQueries({ queryKey: ["GET_STUDENTS"] });
                }
                onClose();
                refetch();
            } catch (error) {
                console.error(error);
            }
        });
    };

    return (
        <DialogContent size="sm">
            <DialogHeader>
                <DialogTitle>
                    {mode === "add" && "Add Student"}
                    {mode === "edit" && "Edit Student"}
                    {mode === "view" && "Student Details"}
                    {mode === "resetPassword" && "Reset Password"}
                </DialogTitle>
                <DialogDescription>
                    {mode === "add" && "Fill in details to create a new student."}
                    {mode === "edit" && "Update student details below."}
                    {mode === "view" && "View student details."}
                    {mode === "resetPassword" && "Set a new password for this student."}
                </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {mode === "view" && (
                    <div className="space-y-4">
                        <div>
                            <Label>Full Name</Label>
                            <p className="text-default-900">{students?.fullname}</p>
                        </div>
                        <div>
                            <Label>Email</Label>
                            <p className="text-default-900 lowercase">{students?.email}</p>
                        </div>
                        <div>
                            <Label>Send Invitation Email</Label>
                            <p>{students?.sendInvitationEmail ? "Yes" : "No"}</p>
                        </div>
                        {!students?.sendInvitationEmail && students?.password && (
                            <div>
                                <Label>Password</Label>
                                <p className="text-default-900">••••••••</p>
                            </div>
                        )}

                        <DialogFooter>
                            <Button onClick={onClose}>Close</Button>
                        </DialogFooter>
                    </div>
                )}
                {(mode === "add" || mode === "edit") && (
                    <>
                        <div>
                            <Label>Full Name</Label>
                            <Input {...register("fullname")} />
                            {errors.fullname && (
                                <p className="text-red-500 text-xs">{errors.fullname.message}</p>
                            )}
                        </div>

                        <div>
                            <Label>Email</Label>
                            <Input type="email" {...register("email")} />
                            {errors.email && (
                                <p className="text-red-500 text-xs">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>Send Invitation Email</Label>
                            <Toggle
                                pressed={sendInvitation}
                                onPressedChange={(val) => setValue("sendInvitationEmail", val)}
                                variant="outline"
                                size="sm"
                                className="w-10 h-6 rounded-full bg-gray-300 data-[state=on]:bg-green-500 relative 
                            before:absolute before:top-0.5 before:left-0.5 before:w-5 before:h-5 
                            before:rounded-full before:bg-white before:shadow-md before:transition-transform 
                            data-[state=on]:before:translate-x-full"
                            />
                        </div>

                        {!sendInvitation && (
                            <div>
                                <Label>Password</Label>
                                <PasswordInput {...register("password")} />
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                                )}
                            </div>
                        )}
                    </>
                )}

                {mode === "resetPassword" && (
                    <div>
                        <Label>New Password</Label>
                        <PasswordInput {...register("password")} />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                        )}
                    </div>
                )}

                {mode !== "view" && (
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === "add"
                                ? "Create"
                                : mode === "edit"
                                    ? "Update"
                                    : mode === "resetPassword"
                                        ? "Reset Password"
                                        : ""}
                        </Button>
                    </DialogFooter>
                )}
            </form>
        </DialogContent>
    )
}

export default StudentsModal