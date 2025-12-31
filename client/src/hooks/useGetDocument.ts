import axiosClient from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export enum DocumentStatus {
  PENDING = "pending",
  SUCCESS = "success",
  ERROR = "error",
}

export interface DocumentResponse {
  url: string;
  document: Document;
}

export interface Document {
  id: string;
  status: DocumentStatus;
  filename: string;
  userEmail: string;
}
const getFileStatus = async (key: string) => {
  await new Promise((res) => setTimeout(res, 500));
  const response = await axiosClient.get<Document>(`/documents/${key}`);

  console.log(JSON.stringify(response.data));
  return response.data;
};

const useGetFileStatus = (isFileSelected: boolean, isFileUploaded: boolean) => {
  const fileKey = localStorage.getItem("fileKey") || "";

  return useQuery({
    queryKey: ["file-status", fileKey],
    queryFn: () => getFileStatus(fileKey),
    refetchInterval: 500,
    enabled: isFileSelected && !!fileKey && !isFileUploaded,
  });
};

export default useGetFileStatus;
