import { FileText, Download, Trash2, Upload } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { mockDocuments } from '../lib/mock-data';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

export function Documents() {
  const companyDocs = mockDocuments.filter(d => d.uploadedBy === 'company');
  const clientDocs = mockDocuments.filter(d => d.uploadedBy === 'client');

  const getFileIcon = (type: string) => {
    return <FileText className="size-5" />;
  };

  const DocumentsList = ({ documents, canDelete }: { documents: typeof mockDocuments, canDelete: boolean }) => (
    <div className="space-y-2">
      {documents.map(doc => (
        <div 
          key={doc.id}
          className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
        >
          <div className="p-2 rounded-lg bg-primary/10">
            {getFileIcon(doc.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="truncate">{doc.name}</h4>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span>{doc.size}</span>
              <span>•</span>
              <span>{format(new Date(doc.uploadDate), 'dd MMM yyyy', { locale: enUS })}</span>
            </div>
          </div>

          <Badge variant="secondary">{doc.type}</Badge>

          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Download className="size-4" />
            </Button>
            {canDelete && (
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="mb-1">Documents</h2>
          <p className="text-muted-foreground">Project documentation and agreements</p>
        </div>
        <Button className="bg-[#F97316] hover:bg-[#F97316]/90">
          <Upload className="size-4 mr-2" />
          Upload document
        </Button>
      </div>

      {/* Company Documents */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3>From the company</h3>
          <Badge variant="secondary">{companyDocs.length}</Badge>
        </div>
        <Card className="p-6">
          <DocumentsList documents={companyDocs} canDelete={false} />
        </Card>
      </div>

      {/* Client Documents */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3>My documents</h3>
          <Badge variant="secondary">{clientDocs.length}</Badge>
        </div>
        <Card className="p-6">
          {clientDocs.length > 0 ? (
            <DocumentsList documents={clientDocs} canDelete={true} />
          ) : (
            <div className="text-center py-12">
              <FileText className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                You have not uploaded any documents yet
              </p>
              <Button variant="outline">
                <Upload className="size-4 mr-2" />
                Upload your first document
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
