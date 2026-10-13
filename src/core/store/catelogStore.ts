import { create } from "zustand";
import { Request } from "../utils/apiTools";
import APICONSTANT from "../utils/ApiConstant";

interface Category {
  id: string;
  category: string;
  description: string;
}

interface SubCategory {
  id: string;
  subcategory: string;
  description: string;
  category: { id: string };
}

interface Duration {
  id: string;
  label: string;
  isActive: boolean;
}

interface Tag {
  id: string;
  tag: string;
}

interface CatelogState {
  categories: Category[];
  subCategories: SubCategory[];
  durations: Duration[];
  suggestedTags: Tag[];
  //   setCategories: (categories: any) => void;
  //   setSubCategories: (subCategories: any) => void;
  //   setDurations: (subCategories: any) => void;
  //   setSuggestedTags: (subCategories: any) => void;
  categoryListApi: () => void;
  subcategoryListAPI: () => void;
  durationBandListAPI: () => void;
  suggestedTagsListAPI: () => void;
}

export const useCatelogStore = create<CatelogState>((set) => ({
  categories: [],
  subCategories: [],
  durations: [],
  suggestedTags: [],
  categoryListApi: async () => {
    try {
      const apiCall = await Request(APICONSTANT.categoryList, "GET");
      if (apiCall?.success && apiCall?.data) {
        set({ categories: apiCall?.data?.data });
      }
      return apiCall;
    } catch (e) {
      console.error("error: ", e);
    }
  },
  subcategoryListAPI: async () => {
    const apiCall = await Request(APICONSTANT.subcategoryList, "GET");
    if (apiCall?.success && apiCall?.data) {
      set({ subCategories: apiCall?.data?.data });
    }
    return apiCall;
  },
  durationBandListAPI: async () => {
    const apiCall = await Request(APICONSTANT.durationBandList, "GET");
    if (apiCall?.success && apiCall?.data) {
      set({ durations: apiCall?.data?.data });
    }
    return apiCall;
  },
  suggestedTagsListAPI: async () => {
    const apiCall = await Request(APICONSTANT.suggestedTagsList, "GET");
    if (apiCall?.success && apiCall?.data) {
      set({ suggestedTags: apiCall?.data?.data });
    }
    return apiCall;
  },
}));
