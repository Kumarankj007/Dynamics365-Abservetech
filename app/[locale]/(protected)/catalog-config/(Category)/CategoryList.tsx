// "use client";
// import React, { useState } from "react";
// import {
//   Accordion,
//   AccordionItem,
//   AccordionTrigger,
//   AccordionContent,
// } from "@/components/ui/accordion";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import useReactQuery from "@/hooks/useReactQuery";
// import useApiMutation from "@/hooks/Mutations/useApiMutation";
// import { toast } from "sonner";
// import { Plus, Pencil, Trash2 } from "lucide-react";
// import DeleteConfirmModal from "@/components/DeleteModal/DeleteConfirmModal";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { APICONSTANT } from "@/services/config";

// interface Category {
//   id: string;
//   category: string;
//   description: string;
//   createdAt: string;
// }

// interface CategoryApiResponse {
//   error: boolean;
//   data?: {
//     data?: Category[];
//     total: number;
//     page: number;
//     limit: number;
//     totalPages: number;
//   };
// }

// interface Subcategory {
//   id: string;
//   subcategory: string;
//   description: string;
//   categoryId: string;
//   createdAt: string;
// }

// interface SubcategoryApiResponse {
//   error: boolean;
//   data?: {
//     data?: Subcategory[];
//     total: number;
//     page: number;
//     limit: number;
//     totalPages: number;
//   };
// }

// const categorySchema = z.object({
//   category: z.string().min(1, "Category name is required"),
//   description: z.string().optional(),
// });

// const subCategorySchema = z.object({
//   subcategory: z.string().min(1, "Subcategory name is required"),
//   description: z.string().optional(),
//   categoryId: z.string().min(1, "Category ID is required"),
// });

// type CategoryFormValues = z.infer<typeof categorySchema>;
// type SubCategoryFormValues = z.infer<typeof subCategorySchema>;

// const CategoryList: React.FC = () => {
//   const [page] = useState(1);
//   const [limit] = useState(10);

//   const queryString = `?page=${page}&limit=${limit}`;

//   const { data: categoryData, isLoading: categoryLoading, refetch: refetchCategories } =
//     useReactQuery<CategoryApiResponse>("GET_CATEGORY", queryString);

//   const { data: subCategoryData, isLoading: subLoading, refetch: refetchSubCategories } =
//     useReactQuery<SubcategoryApiResponse>("GET_SUBCATEGORY", queryString);

//   const categories = categoryData?.data?.data || [];
//   const subCategories = subCategoryData?.data?.data || [];

//   const [openCategoryModal, setOpenCategoryModal] = useState(false);
//   const [editingCategory, setEditingCategory] = useState<any | null>(null);

//   const [openSubModal, setOpenSubModal] = useState(false);
//   const [editingSub, setEditingSub] = useState<any | null>(null);

//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "category" | "subcategory" } | null>(null);

//   const postMutation = useApiMutation("post");
//   const putMutation = useApiMutation("put");
//   const deleteMutation = useApiMutation("delete");

//   const categoryForm = useForm<CategoryFormValues>({
//     resolver: zodResolver(categorySchema),
//     defaultValues: {
//       category: "",
//       description: "",
//     },
//   });

//   const handleOpenCategory = (item?: any) => {
//     if (item) {
//       setEditingCategory(item);
//       categoryForm.reset({
//         category: item.category,
//         description: item.description || "",
//       });
//     } else {
//       setEditingCategory(null);
//       categoryForm.reset({ category: "", description: "" });
//     }
//     setOpenCategoryModal(true);
//   };

//   const handleSubmitCategory = async (data: CategoryFormValues) => {
//     try {
//       const apiUrl = editingCategory
//         ? `${APICONSTANT.UPDATE_CATEGORY}/${editingCategory.id}`
//         : APICONSTANT.CREATE_CATEGORY;

//       await (editingCategory
//         ? putMutation.mutateAsync({ url: { apiUrl }, body: data })
//         : postMutation.mutateAsync({ url: { apiUrl }, body: data }));

//       toast.success(editingCategory ? "Category updated successfully" : "Category added successfully");
//       setOpenCategoryModal(false);
//       refetchCategories();
//     } catch {
//       toast.error("Failed to save category");
//     }
//   };

//   const subForm = useForm<SubCategoryFormValues>({
//     resolver: zodResolver(subCategorySchema),
//     defaultValues: {
//       subcategory: "",
//       description: "",
//       categoryId: "",
//     },
//   });

//   const handleOpenSub = (catId: string, sub?: any) => {
//     if (sub) {
//       setEditingSub(sub);
//       subForm.reset({
//         subcategory: sub.subcategory,
//         description: sub.description || "",
//         categoryId: sub.categoryId,
//       });
//     } else {
//       setEditingSub(null);
//       subForm.reset({ subcategory: "", description: "", categoryId: catId });
//     }
//     setOpenSubModal(true);
//   };

//   const handleSubmitSub = async (data: SubCategoryFormValues) => {
//     try {
//       const apiUrl = editingSub
//         ? `${APICONSTANT.UPDATE_SUBCATEGORY}/${editingSub.id}`
//         : APICONSTANT.CREATE_SUBCATEGORY;

//       await (editingSub
//         ? putMutation.mutateAsync({ url: { apiUrl }, body: data })
//         : postMutation.mutateAsync({ url: { apiUrl }, body: data }));

//       toast.success(editingSub ? "Subcategory updated successfully" : "Subcategory added successfully");
//       setOpenSubModal(false);
//       refetchSubCategories();
//     } catch {
//       toast.error("Failed to save subcategory");
//     }
//   };

//   const handleDelete = async () => {
//     if (!deleteTarget) return;
//     try {
//       const { id, type } = deleteTarget;
//       await deleteMutation.mutateAsync({ url: { apiUrl: `admins/${type}/delete/${id}` } });
//       refetchCategories();
//       refetchSubCategories();
//       toast.success(`${type === "category" ? "Category" : "Subcategory"} deleted successfully`);
//     } catch {
//       toast.error("Delete failed");
//     } finally {
//       setDeleteModalOpen(false);
//       setDeleteTarget(null);
//     }
//   };

//   return (
//     <div className="p-12 space-y-4">
//       <div className="flex justify-between items-center">
//         <h3 className="text-lg font-semibold">Categories</h3>
//         <Button onClick={() => handleOpenCategory()} className="gap-2">
//           <Plus size={16} /> Add Category
//         </Button>
//       </div>

//       {categoryLoading ? (
//         <p>Loading...</p>
//       ) : categories.length === 0 ? (
//         <p className="text-sm text-gray-500">No categories found</p>
//       ) : (
//         <Accordion type="single" collapsible className="w-full">
//           {categories.map((cat: any) => (
//             <AccordionItem key={cat.id} value={cat?.id}>
//               <AccordionTrigger>
//                 <div className="flex justify-between w-full items-center">
//                   <span>{cat.category}</span>
//                   <div className="flex gap-2">
//                     <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenCategory(cat); }}>
//                       <Pencil size={16} />
//                     </Button>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setDeleteTarget({ id: cat.id!, type: "category" });
//                         setDeleteModalOpen(true);
//                       }}
//                     >
//                       <Trash2 size={16} className="text-red-500" />
//                     </Button>
//                   </div>
//                 </div>
//               </AccordionTrigger>

//               <AccordionContent>
//                 <div className="pl-4 space-y-2">
//                   <div className="flex justify-between items-center">
//                     <h4 className="font-medium text-sm text-gray-700">Subcategories:</h4>
//                     <Button size="sm" onClick={() => handleOpenSub(cat.id!)}>
//                       <Plus size={14} className="mr-1" /> Add Subcategory
//                     </Button>
//                   </div>

//                   {subLoading ? (
//                     <p>Loading subcategories...</p>
//                   ) : (
//                     subCategories
//                       .filter((sub: any) => sub.categoryId === cat.id)
//                       .map((sub: any) => (
//                         <div key={sub.id} className="flex justify-between items-center border-b py-2">
//                           <span>{sub.subcategory}</span>
//                           <div className="flex gap-2">
//                             <Button variant="ghost" size="icon" onClick={() => handleOpenSub(cat.id!, sub)}>
//                               <Pencil size={16} />
//                             </Button>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               onClick={() => {
//                                 setDeleteTarget({ id: sub.id, type: "subcategory" });
//                                 setDeleteModalOpen(true);
//                               }}
//                             >
//                               <Trash2 size={16} className="text-red-500" />
//                             </Button>
//                           </div>
//                         </div>
//                       ))
//                   )}

//                   {subCategories.filter((s: any) => s.categoryId === cat.id).length === 0 && (
//                     <p className="text-sm text-gray-400">No subcategories available</p>
//                   )}
//                 </div>
//               </AccordionContent>
//             </AccordionItem>
//           ))}
//         </Accordion>
//       )}

//       <Dialog open={openCategoryModal} onOpenChange={setOpenCategoryModal}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
//           </DialogHeader>
//           <form onSubmit={categoryForm.handleSubmit(handleSubmitCategory)} className="space-y-4">
//             <div>
//               <Label>Category Name</Label>
//               <Input {...categoryForm.register("category")} />
//               {categoryForm.formState.errors.category && (
//                 <p className="text-red-500 text-xs">{categoryForm.formState.errors.category.message}</p>
//               )}
//             </div>
//             <div>
//               <Label>Description</Label>
//               <Input {...categoryForm.register("description")} />
//             </div>
//             <DialogFooter>
//               <Button variant="outline" onClick={() => setOpenCategoryModal(false)}>Cancel</Button>
//               <Button type="submit">{editingCategory ? "Update" : "Save"}</Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       <Dialog open={openSubModal} onOpenChange={setOpenSubModal}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>{editingSub ? "Edit Subcategory" : "Add Subcategory"}</DialogTitle>
//           </DialogHeader>
//           <form onSubmit={subForm.handleSubmit(handleSubmitSub)} className="space-y-4">
//             <div>
//               <Label>Subcategory Name</Label>
//               <Input {...subForm.register("subcategory")} />
//               {subForm.formState.errors.subcategory && (
//                 <p className="text-red-500 text-xs">{subForm.formState.errors.subcategory.message}</p>
//               )}
//             </div>
//             <div>
//               <Label>Description</Label>
//               <Input {...subForm.register("description")} />
//             </div>
//             <DialogFooter>
//               <Button variant="outline" onClick={() => setOpenSubModal(false)}>Cancel</Button>
//               <Button type="submit">{editingSub ? "Update" : "Save"}</Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       <DeleteConfirmModal
//         open={deleteModalOpen}
//         onClose={() => setDeleteModalOpen(false)}
//         onConfirm={handleDelete}
//       />
//     </div>
//   );
// };

// export default CategoryList;

"use client";
import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import useReactQuery from "@/hooks/useReactQuery";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import DeleteConfirmModal from "@/components/DeleteModal/DeleteConfirmModal";
import CategoryModalForm from "./CategoryModalForm";

interface Category {
  id: string;
  category: string;
  description: string;
  createdAt: string;
}

interface CategoryApiResponse {
  error: boolean;
  data?: {
    data?: Category[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface Subcategory {
  id: string;
  subcategory: string;
  description: string;
  categoryId: string;
  createdAt: string;
}

interface SubcategoryApiResponse {
  error: boolean;
  data?: {
    data?: Subcategory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const CategoryList: React.FC = () => {
  const [page] = useState(1);
  const [limit] = useState(10);
  const queryString = `?page=${page}&limit=${limit}`;

    const { data: categoryData, isLoading: categoryLoading, refetch: refetchCategories } =
    useReactQuery<CategoryApiResponse>("GET_CATEGORY", queryString);

  const { data: subCategoryData, isLoading: subLoading, refetch: refetchSubCategories } =
    useReactQuery<SubcategoryApiResponse>("GET_SUBCATEGORY", queryString);

  const categories = categoryData?.data?.data || [];
  const subCategories = subCategoryData?.data?.data || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"category" | "subcategory">("category");
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "category" | "subcategory" } | null>(null);

  const deleteMutation = useApiMutation("delete");

  const handleOpenModal = (type: "category" | "subcategory", item?: any, catId?: string) => {
    setModalType(type);
    setEditingItem(item || null);
    setSelectedCategoryId(catId || "");
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { id, type } = deleteTarget;
      await deleteMutation.mutateAsync({ url: { apiUrl: `admins/${type}/delete/${id}` } });
      refetchCategories();
      refetchSubCategories();
      toast.success(`${type === "category" ? "Category" : "Subcategory"} deleted successfully`);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-12 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Categories & Subcategories</h3>
        <Button onClick={() => handleOpenModal("category")} className="gap-2">
          <Plus size={16} /> Add Category
        </Button>
      </div>

      {categoryLoading ? (
        <p>Loading...</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-gray-500">No categories found</p>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {categories.map((cat: any) => (
            <AccordionItem key={cat.id} value={cat.id}>
              <AccordionTrigger>
                <div className="flex justify-between w-full items-center">
                  <span>{cat.category}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal("category", cat);
                      }}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ id: cat.id!, type: "category" });
                        setDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                <div className="pl-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm text-gray-700">Subcategories:</h4>
                    <Button size="sm" onClick={() => handleOpenModal("subcategory", null, cat.id)}>
                      <Plus size={14} className="mr-1" /> Add Subcategory
                    </Button>
                  </div>

                  {subLoading ? (
                    <p>Loading subcategories...</p>
                  ) : (
                    subCategories
                      .filter((sub: any) => sub.categoryId === cat.id)
                      .map((sub: any) => (
                        <div key={sub.id} className="flex justify-between items-center border-b py-2">
                          <span>{sub.subcategory}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenModal("subcategory", sub, cat.id)}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeleteTarget({ id: sub.id, type: "subcategory" });
                                setDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))
                  )}

                  {subCategories.filter((s: any) => s.categoryId === cat.id).length === 0 && (
                    <p className="text-sm text-gray-400">No subcategories available</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <CategoryModalForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        editingItem={editingItem}
        categoryId={selectedCategoryId}
        refetchCategories={refetchCategories}
        refetchSubCategories={refetchSubCategories}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default CategoryList;