'use client'
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "@/components/navigation";
import { useSearchParams } from "next/navigation";
import useReactQuery from "@/hooks/useReactQuery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import useApiMutation from '@/hooks/Mutations/useApiMutation'
import { APICONSTANT } from '@/services/config'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react';

interface SubMenu {
  menu: string;
  status: boolean;
  subMenu: boolean;
  subMenuList: SubMenu[];
}

interface AdminrolePermissions {
  menu: string;
  status: boolean;
  subMenu: boolean;
  subMenuList: SubMenu[];
}

interface Adminrole {
  _id: string;
  role: string;
  description: string;
  permission: AdminrolePermissions[];
}

interface AdminroleTitle {
  _id: string;
  role: string;
}

interface AdminroleApiResponse {
  error: boolean;
  message: string;
  data: any[];
}

const adminPermissionSchema = z.object({ role: z.string().min(1, "Role is required"), description: z.string().min(1, "Description is required"), })
type AdminFormValues = z.infer<typeof adminPermissionSchema>

const AdminPermission = () => {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const mode = searchParams?.get("mode") ?? "add";
  const id = searchParams?.get("id") ?? null;
  const mutation = useApiMutation(mode === "add" ? "post" : "put", "");

  // const [selectedRole, setSelectedRole] = useState<string | null>(id);
  // const [description, setDescription] = useState<string>("");
  const [permissions, setPermissions] = useState<AdminrolePermissions[]>([]);

  // Fetch role titles
  const { data: previewAdminroleTitle } =
    useReactQuery<AdminroleApiResponse>("GET_ADMINROLETITLE");
  const AdminroleTitle: AdminroleTitle[] = previewAdminroleTitle?.data || [];

  // Fetch default permissions
  const { data: previewAdminrolePermissions } =
    useReactQuery<AdminroleApiResponse>("GET_ADMINROLEPERMISSIONS");
  const defaultPermissions: AdminrolePermissions[] =
    previewAdminrolePermissions?.data || [];

  // Fetch admin roles for edit
  const { data: previewAdminrole } =
    useReactQuery<AdminroleApiResponse>("GET_ADMINROLE");
  const AdminroleData: Adminrole | undefined = previewAdminrole?.data?.find(
    (r) => r._id === id
  );

  // const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<AdminFormValues>({ resolver: zodResolver(adminPermissionSchema), defaultValues: { role: AdminroleData?._id || "", description: AdminroleData?.description || "", }, });
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<AdminFormValues>({
    resolver: zodResolver(adminPermissionSchema),
    defaultValues: {
      role: "",
      description: "",
    },
  });
  // Reset form when data is loaded
  useEffect(() => {
    if (mode === "edit" && AdminroleData) {
      reset({
        role: AdminroleData.role,
        description: AdminroleData.description,
      });
    }
  }, [mode, AdminroleData, reset]);
  // Prefill Add/Edit mode
  useEffect(() => {
    if (mode === "edit" && AdminroleData && defaultPermissions.length) {
      // setSelectedRole(AdminroleData._id);
      // setDescription(AdminroleData.description);

      const mergedPermissions = defaultPermissions.map((dp) => {
        const matched = AdminroleData.permission.find((p) => p.menu === dp.menu);
        if (matched) {
          return {
            ...dp,
            status: matched.status,
            subMenuList: dp.subMenuList.map((sm, i) => ({
              ...sm,
              status: matched.subMenuList[i]?.status ?? sm.status,
            })),
          };
        }
        return dp;
      });
      setPermissions(mergedPermissions);
    }

    if (mode === "add" && defaultPermissions.length) {
      const addPerms = defaultPermissions.map((p) => ({
        ...p,
        status: false,
        subMenuList: p.subMenuList.map((sm) => ({ ...sm, status: false })),
      }));
      setPermissions(addPerms);
    }
  }, [mode, AdminroleData, defaultPermissions]);

  // Toggle permission using path
  const togglePermission = (path: number[]) => {
    setPermissions((prev) => {
      const newPerms = JSON.parse(JSON.stringify(prev)); // deep clone
      let current: any = newPerms;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]].subMenuList;
      }
      current[path[path.length - 1]].status = !current[path[path.length - 1]]
        .status;
      return newPerms;
    });
  };

  // Recursive submenu render
  const renderSubMenu = (subMenus: SubMenu[], path: number[]) => (
    <ul className="pl-4 space-y-1">
      {subMenus.map((sub, subIndex) => {
        const currentPath = [...path, subIndex];
        return (
          <li key={currentPath.join("-")}>
            <div className="flex items-center gap-2">
              <Switch
                checked={sub.status}
                onCheckedChange={() => togglePermission(currentPath)}
              />
              <span>{sub.menu}</span>
            </div>
            {sub.subMenuList.length > 0 &&
              renderSubMenu(sub.subMenuList, currentPath)}
          </li>
        );
      })}
    </ul>
  );

  const onSubmit = (data: AdminFormValues) => {
    startTransition(async () => {
      try {
        const payload = {
          // role: AdminroleTitle.find(r => r._id === selectedRole)?.role ?? "",
          role: data.role,
          description: data.description,
          permission: permissions,
        }

        const response = await mutation.mutateAsync({
          url: { apiUrl: mode === "add" ? APICONSTANT.GET_ADMINROLE : `${APICONSTANT.GET_ADMINROLE}?id=${id}` },
          body: payload,
        });

        if (!response?.error) {
          await queryClient.invalidateQueries({ queryKey: ["GET_ADMINROLE"] })
          router.push("/adminrole")
        }
      } catch (error) {
        console.error(error)
      }
    })
  }

  return (
    <div className="p-6 space-y-6 rounded-lg shadow-md">
      <div className="flex items-center gap-3">
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <Icon icon="mdi:arrow-left" width={24} height={24} />
        </button>

        {/* Title */}
        <h1 className="text-2xl font-semibold">
          {mode === "add" ? "Add Role" : "Edit Role"}
        </h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* <div>
            <Label>Role</Label>
            <Select
              onValueChange={(value) => setValue("role", value)}
              value={selectedRole ?? undefined}
              disabled={mode === "edit"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a Role" />
              </SelectTrigger>
              <SelectContent>
                {AdminroleTitle.map((role) => (
                  <SelectItem key={role._id} value={role._id}>
                    {role.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
          </div> */}

          <div>
            <Label>Role</Label>
            <Input {...register("role")} placeholder="Enter role" />
            {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
          </div>

          <div>
            <Label>Description</Label>
            <Input {...register("description")} placeholder="Enter role description" />
            {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-3">Permissions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {permissions.map((perm, index) => (
              <div key={perm.menu} className="p-3 border border-gray dark:border-white rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Switch
                    checked={perm.status}
                    onCheckedChange={() => togglePermission([index])}
                  />
                  <span className="font-medium">{perm.menu}</span>
                </div>
                {perm.subMenuList.length > 0 && renderSubMenu(perm.subMenuList, [index])}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-end">
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
        </div>
      </form>
    </div>
  );
};

export default AdminPermission;
