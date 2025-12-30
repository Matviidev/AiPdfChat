import { DocumentStatus } from '../enum/documentStatus.enum';

export interface DocumentItem {
  id: string;
  status: DocumentStatus;
  filename: string;
  userEmail: string;
}
