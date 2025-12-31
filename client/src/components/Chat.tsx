import { Button } from '@/components/ui/button';
import ChatMessage from '@/components/ui/ChatMessage';
import { Input } from '@/components/ui/input';
import PdfUpload from '@/components/ui/PdfUpload';
import useGetAiResponse from '@/hooks/useGetAiAnswer';
import useGetPresignedUrl, { DocumentStatus } from '@/hooks/useGetPresignedUrl';
import useUploadToS3 from '@/hooks/useUploadToS3';
import { DoorOpen, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export interface Message {
  id: number;
  role: 'user' | 'ai';
  content: string;
}

const Chat = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fileStatus, setFileStatus] = useState<DocumentStatus>(
    DocumentStatus.PENDING,
  );
  const navigate = useNavigate();

  const getPresignedUrlMutation = useGetPresignedUrl();
  const uploadToS3Mutation = useUploadToS3();

  const handleFileUpload = async (file: File | null) => {
    setPdfFile(file);
    if (!file || !file?.name) return;

    const url = await getPresignedUrlMutation.mutateAsync({
      filename: file.name,
    });
    console.log(url);
    if (!url) {
      toast.error('Upload failed. Please retry.');
      return;
    }

    uploadToS3Mutation.mutateAsync({
      url,
      file,
    });
  };

  const [messages, setMessages] = useState<Message[]>([
    // { id: 1, role: "ai", content: "Hello! Upload a PDF to get started." },
  ]);
  const [input, setInput] = useState('');
  const userEmail = localStorage.getItem('userEmail') || '';

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('fileKey');
    navigate('/');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const getAiResponseMutation = useGetAiResponse();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !pdfFile) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const response = await getAiResponseMutation.mutateAsync(input);
    const aiResponse = response.data.answer;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        role: 'ai',
        content: aiResponse,
      },
    ]);
  };

  const canChat = pdfFile && fileStatus === DocumentStatus.SUCCESS;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="border bg-white/80 backdrop-blur-sm sticky top-0 z-10 w-full shadow-[0_6px_16px_-8px_rgba(0,0,0,0.10)] shadow-b">
        <div className="w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-1"></div>
          <div className="flex-1 flex justify-center">
            {pdfFile && (
              <span className="text-sm font-medium text-black truncate max-w-md">
                {pdfFile.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-1 justify-end">
            <span className="text-sm text-black">{userEmail}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-black hover:text-black"
            >
              <DoorOpen className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-80px)]">
        {/* PDF Upload Section */}
        {messages.length > 0 && !canChat && (
          <div className="mb-6">
            <PdfUpload
              onFileSelect={handleFileUpload}
              selectedFile={pdfFile}
              onFileStatusChange={setFileStatus}
              clearMessages={() => setMessages([])}
            />
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6 py-1 px-2">
          {messages.length === 0 && !canChat && (
            <div className="flex items-center justify-center h-full">
              <div className="scale-[2]">
                <PdfUpload
                  onFileSelect={handleFileUpload}
                  selectedFile={pdfFile}
                  onFileStatusChange={setFileStatus}
                  clearMessages={() => setMessages([])}
                />
              </div>
            </div>
          )}

          {messages.length === 0 && canChat && (
            <div className="flex items-center justify-center h-full">
              <div className="bg-white border-2 border-dashed border-black rounded-sm px-8 py-6 max-w-md text-center">
                <p className="text-lg font-medium text-gray-600">
                  Ask AI about your document
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Start a conversation to get answers and insights
                </p>
              </div>
            </div>
          )}

          {messages.map((message: Message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {getAiResponseMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-white border border-black rounded-sm px-4 py-3 max-w-xs">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-black rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-black rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                  <span className="text-sm text-black">Processing...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        {canChat && (
          <div className="bg-white rounded-full shadow-lg border-2 border-black p-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="focus-visible:ring-0 text-base h-12 rounded-full"
                />
              </div>

              <Button
                type="submit"
                disabled={!input.trim() || getAiResponseMutation.isPending}
                className="h-12 aspect-square px-6 bg-black hover:bg-black disabled:opacity-50 text-white rounded-full"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
