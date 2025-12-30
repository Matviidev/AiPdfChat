import axiosClient from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export enum DocumentStatus {
  PENDING = "pending",
  SUCCESS = "success",
  ERROR = "error",
}
export interface DocumentResponse {
  url: string;
  document: {
    id: string;
    status: DocumentStatus;
    filename: string;
    userEmail: string;
  };
}

const useGetPresignedUrl = () => {
  const getPresignedUrl = async ({ filename }: { filename: string }) => {
    const email = localStorage.getItem("userEmail");

    console.log("settign fileKey");
    if (!email) {
      toast.warning("Please log in to upload a file.");
      return;
    }

    const response = await axiosClient.post<DocumentResponse>(
      "/documents/upload-url",
      {
        filename,
        email,
      },
    );
    localStorage.setItem("fileKey", response.data.document.id);
    return response.data.url;
  };

  return useMutation({
    mutationFn: ({ filename }: { filename: string }) =>
      getPresignedUrl({ filename }),
  });
};

export default useGetPresignedUrl;
