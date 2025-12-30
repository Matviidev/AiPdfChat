import { Button } from "@/components/ui/button";
import useGetFileStatus, { DocumentStatus } from "@/hooks/use-get-file-status";
import { File, Loader2, Upload, CircleX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface PdfUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  onFileStatusChange: (fileStatus: DocumentStatus) => void;
  clearMessages: () => void;
}

const PdfUpload = ({
  onFileSelect,
  selectedFile,
  onFileStatusChange,
  clearMessages,
}: PdfUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isFileUploaded, setIsFileUploaded] = useState(false);

  const getFileStatusQuery = useGetFileStatus(!!selectedFile, isFileUploaded);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.warning("Only PDF files are supported");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.warning("File exceeds 10MB limit");
      return;
    }

    onFileSelect(file);
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    clearMessages();
      toast.success("Document removed");
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const fileStatus = getFileStatusQuery?.data?.status || DocumentStatus.PENDING;

  useEffect(() => {
    onFileStatusChange(fileStatus);
    if (fileStatus === DocumentStatus.SUCCESS) {
      setIsFileUploaded(true);
      toast.success("Upload complete! Ready to chat.");
    }
  }, [fileStatus]);

  return (
    <>
      {selectedFile ? (
        <div className="h-10 flex items-center gap-2 bg-white border border-black rounded-lg px-3 py-2">
          <File className="w-4 h-4 text-black" />
          <span className="text-sm text-black font-medium cursor-pointer hover:underline">
            {selectedFile.name}
          </span>

          {fileStatus === DocumentStatus.PENDING ||
          typeof fileStatus === "undefined" ? (
            <Loader2 className="w-4 h-4 ml-3 text-black animate-spin" />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="h-auto p-1 text-black hover:text-black hover:bg-white"
            >
              <CircleX className="w-3 h-3" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              onClick={triggerFileInput}
              className="h-14 px-8 bg-white text-black font-semibold text-base rounded-lg shadow-lg hover:shadow-xl hover:bg-black hover:text-white transition-all duration-200 flex items-center gap-3 border border-black"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Document</span>
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </>
  );
};

export default PdfUpload;
