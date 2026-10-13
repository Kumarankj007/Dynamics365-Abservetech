import { useMutation, UseMutationResult } from "@tanstack/react-query";
// import { useNavigate } from "react-router";
import { useRouter } from '@/components/navigation';
import { loginApiMethod, setToken } from "../../services/authService";
import { showToast } from "@/lib/toastSonner";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginApiProps {
  url: { apiUrl: string };
  body: LoginPayload;
}

interface LoginResponse {
  error: boolean;
  message: string;
  datas: {
    token: string;
    id: string | number;
  }[];
}

interface ErrorResponse {
  message?: string;
}

export default function useLoginMutation(): UseMutationResult<
  LoginResponse,
  unknown,
  LoginApiProps
> {
  // const navigate = useNavigate();
  const router = useRouter();

  return useMutation<LoginResponse, unknown, LoginApiProps>({
    mutationFn: loginApiMethod,

    onSuccess: (data:any) => {
      if (!data?.error) {
        const user = data.data;

        if (user?.token && user?.admin?.id) {
          setToken(user.token, user.admin.id);
        }

        showToast.success(data.message || "Login successful");
        router.push('/dashboard/analytics');
        // router.push('/admin');
      } else {
        console.error("Login failed: Invalid response format", data);
        showToast.error(data.message || "Login failed");
      }
    },

    onError: (error) => {
      const err = error as { response?: { data?: ErrorResponse } };
      const errorMessage = err.response?.data?.message || "Login error";
      showToast.error(errorMessage);
      console.error("Login error:", errorMessage);
    },
  });
}