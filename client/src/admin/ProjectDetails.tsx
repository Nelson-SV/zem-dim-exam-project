import { useState } from 'react';
import { 
  ArrowLeft, Calendar, MapPin, User, Plus, Upload, Download,
  FileText, MessageSquare, Camera, Box, CheckCircle2, Clock, TrendingUp
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Slider } from '../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { mockProjects, mockPhotos, mockDocuments, mockMessages } from '../lib/mock-data';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { toast } from 'sonner';

interface ProjectDetailsProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectDetails({ projectId, onBack }: ProjectDetailsProps) {
  const project = mockProjects.find(p => p.id === projectId);
  const [isAddStageOpen, setIsAddStageOpen] = useState(false);
  const [stageName, setStageName] = useState('');
  const [stageDescription, setStageDescription] = useState('');
  const [stageProgress, setStageProgress] = useState([0]);
  const [messageText, setMessageText] = useState('');

  if (!project) return <div>Project not found</div>;

  const projectPhotos = mockPhotos.filter(p => p.projectId === projectId);
  const projectDocuments = mockDocuments;

  const handleAddStage = () => {
    toast.success('Stage added successfully');
    setIsAddStageOpen(false);
    setStageName('');
    setStageDescription('');
    setStageProgress([0]);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    toast.success('Message sent');
    setMessageText('');
  };

  const daysRemaining = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="shrink-0">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="mb-2">{project.name}</h2>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>{project.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="size-4" />
                  <span>{project.clientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <span>{format(new Date(project.startDate), 'dd MMM yyyy', { locale: enUS })} - {format(new Date(project.endDate), 'dd MMM yyyy', { locale: enUS })}</span>
                </div>
              </div>
            </div>
            <Badge 
              variant={project.status === 'active' ? 'default' : 'secondary'}
              className="shrink-0"
            >
              {project.status === 'active' ? 'Active' : 'Completed'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-[#F97316] mb-2">{project.progress}%</div>
              <p className="text-muted-foreground">Overall progress</p>
            </div>
            <Progress value={project.progress} className="h-3" />
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Area</span>
              <span>{project.area} m²</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Current stage</span>
              <span>{project.currentStage}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 bg-[#10B981]/10 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#10B981]" />
                <span className="text-muted-foreground">Completed stages</span>
              </div>
              <span>{project.stages.filter(s => s.status === 'completed').length}/{project.stages.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F59E0B]/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-[#F59E0B]" />
                <span className="text-muted-foreground">Days remaining</span>
              </div>
              <span>{daysRemaining}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="stages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="stages">
            <TrendingUp className="size-4 mr-2" />
            Stages
          </TabsTrigger>
          <TabsTrigger value="photos">
            <Camera className="size-4 mr-2" />
            Photos
          </TabsTrigger>
          <TabsTrigger value="3d">
            <Box className="size-4 mr-2" />
            3D Scans
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="size-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="size-4 mr-2" />
            Chat
          </TabsTrigger>
        </TabsList>

        {/* Stages Tab */}
        <TabsContent value="stages" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3>Construction stages</h3>
            <Dialog open={isAddStageOpen} onOpenChange={setIsAddStageOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#F97316] hover:bg-[#F97316]/90">
                  <Plus className="size-4 mr-2" />
                  Add stage
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add a new stage</DialogTitle>
                  <DialogDescription>
                    Create a new construction stage for the project
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="stage-name">Stage name</Label>
                    <Input
                      id="stage-name"
                      value={stageName}
                      onChange={(e) => setStageName(e.target.value)}
                      placeholder="For example: Electrical and plumbing"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stage-description">Description</Label>
                    <Textarea
                      id="stage-description"
                      value={stageDescription}
                      onChange={(e) => setStageDescription(e.target.value)}
                      placeholder="Detailed scope of work..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start date</Label>
                      <Input id="start-date" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End date</Label>
                      <Input id="end-date" type="date" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Progress: {stageProgress[0]}%</Label>
                    <Slider
                      value={stageProgress}
                      onValueChange={setStageProgress}
                      max={100}
                      step={5}
                      className="py-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stage-status">Status</Label>
                    <Select defaultValue="pending">
                      <SelectTrigger id="stage-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddStageOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddStage} className="bg-[#F97316] hover:bg-[#F97316]/90">
                    Save stage
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {project.stages.map((stage, index) => (
              <Card key={stage.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      stage.status === 'completed' ? 'bg-[#10B981] text-white' :
                      stage.status === 'in-progress' ? 'bg-[#F97316] text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="mb-1">{stage.name}</h4>
                        <p className="text-muted-foreground">{stage.description}</p>
                      </div>
                      <Badge variant={
                        stage.status === 'completed' ? 'default' :
                        stage.status === 'in-progress' ? 'secondary' :
                        'outline'
                      }>
                        {stage.status === 'completed' ? 'Completed' :
                         stage.status === 'in-progress' ? 'In progress' :
                         'Pending'}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span>{stage.progress}%</span>
                        </div>
                        <Progress value={stage.progress} className="h-2" />
                      </div>

                      <div className="flex items-center gap-6 text-muted-foreground pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4" />
                          <span>Start: {format(new Date(stage.startDate), 'dd MMM yyyy', { locale: enUS })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4" />
                          <span>Finish: {format(new Date(stage.endDate), 'dd MMM yyyy', { locale: enUS })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3>Project photos</h3>
            <Button className="bg-[#F97316] hover:bg-[#F97316]/90">
              <Upload className="size-4 mr-2" />
              Upload photo
            </Button>
          </div>

          {project.stages.map(stage => {
            const stagePhotos = projectPhotos.filter(p => p.stageId === stage.id);
            if (stagePhotos.length === 0) return null;

            return (
              <div key={stage.id}>
                <h4 className="mb-4">{stage.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stagePhotos.map(photo => (
                    <Card key={photo.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        <img 
                          src={photo.url} 
                          alt={photo.description}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-muted-foreground">
                          {format(new Date(photo.uploadDate), 'dd MMMM yyyy', { locale: enUS })}
                        </p>
                        {photo.description && <p className="mt-1">{photo.description}</p>}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        {/* 3D Scans Tab */}
        <TabsContent value="3d" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3>3D room scans</h3>
            <Button className="bg-[#F97316] hover:bg-[#F97316]/90">
              <Upload className="size-4 mr-2" />
              Upload scan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Living Room', 'Kitchen', 'Bedroom 1', 'Bathroom'].map((room, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#3B82F6]/10 rounded-lg">
                    <Box className="size-6 text-[#3B82F6]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-2">{room}</h4>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span>Date: {format(new Date(), 'dd MMM yyyy', { locale: enUS })}</span>
                      <span>45 m²</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="size-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3>Project documents</h3>
            <Button className="bg-[#F97316] hover:bg-[#F97316]/90">
              <Upload className="size-4 mr-2" />
              Upload document
            </Button>
          </div>

          <Card className="divide-y">
            {projectDocuments.map(doc => (
              <div key={doc.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                <div className="p-3 bg-[#EF4444]/10 rounded-lg">
                  <FileText className="size-6 text-[#EF4444]" />
                </div>
                <div className="flex-1">
                  <h4>{doc.name}</h4>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>{doc.size}</span>
                    <span>{format(new Date(doc.uploadDate), 'dd MMM yyyy', { locale: enUS })}</span>
                    <Badge variant="outline">{doc.uploadedBy === 'company' ? 'Company' : 'Client'}</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="size-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </Card>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-6">Chat with client: {project.clientName}</h3>
            
            <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
              {mockMessages.map(message => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.senderRole === 'admin' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[70%] ${message.senderRole === 'admin' ? 'order-1' : 'order-2'}`}>
                    <div className={`p-4 rounded-lg ${
                      message.senderRole === 'admin' 
                        ? 'bg-muted' 
                        : 'bg-[#F97316] text-white'
                    }`}>
                      <p className={message.senderRole === 'admin' ? 'text-muted-foreground' : 'text-white/70'}>
                        {message.senderName}
                      </p>
                      <p className="mt-1">{message.text}</p>
                    </div>
                    <p className={`text-muted-foreground mt-1 px-2 ${
                      message.senderRole === 'client' ? 'text-right' : ''
                    }`}>
                      {format(new Date(message.timestamp), 'HH:mm', { locale: enUS })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Write a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} className="bg-[#F97316] hover:bg-[#F97316]/90">
                Send
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
