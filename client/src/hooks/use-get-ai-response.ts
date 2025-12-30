import axiosClient from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

const useGetAiResponse = () => {
  const getAiResponse = async (query: string) => {
    const fileKey = localStorage.getItem("fileKey");

    const response = (await axiosClient.post)<{ answer: string }>(
      `/ai/documents/${fileKey}`,
      {
        message: query,
      },
    );

    return response;
  };

  return useMutation({
    mutationFn: (query: string) => getAiResponse(query),
  });
};

export default useGetAiResponse;
