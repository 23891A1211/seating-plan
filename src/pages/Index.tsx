import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileUp, Users, MapPin, FileText, Download, GraduationCap } from 'lucide-react';
import { PdfUploader } from '@/components/seating/PdfUploader';
import { RoomConfiguration } from '@/components/seating/RoomConfiguration';
import { SeatingPreview } from '@/components/seating/SeatingPreview';
import { ReportGeneration } from '@/components/seating/ReportGeneration';
import { Student, Room, SeatingPlan } from '@/types/seating';
import heroImage from '@/assets/exam-seating-hero.png';

const Index = () => {
  const [currentStep, setCurrentStep] = useState('upload');
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [examInfo, setExamInfo] = useState({
    name: '',
    shift: 'Morning' as 'Morning' | 'Evening'
  });
  const [seatingPlan, setSeatingPlan] = useState<SeatingPlan | null>(null);

  const handlePdfProcessed = (extractedStudents: Student[], examName: string, shift: 'Morning' | 'Evening') => {
    setStudents(extractedStudents);
    setExamInfo({ name: examName, shift });
    setCurrentStep('configure');
  };

  const handleRoomsConfigured = (configuredRooms: Room[]) => {
    setRooms(configuredRooms);
    setCurrentStep('preview');
  };

  const handleSeatingGenerated = (plan: SeatingPlan) => {
    setSeatingPlan(plan);
    setCurrentStep('generate');
  };

  const steps = [
    { id: 'upload', label: 'Upload PDF', icon: FileUp, completed: students.length > 0 },
    { id: 'configure', label: 'Configure Rooms', icon: MapPin, completed: rooms.length > 0 },
    { id: 'preview', label: 'Preview Seating', icon: Users, completed: !!seatingPlan },
    { id: 'generate', label: 'Generate Reports', icon: Download, completed: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="bg-gradient-academic shadow-academic relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={heroImage} 
            alt="Exam seating arrangement" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-academic/80"></div>
        </div>
        <div className="container mx-auto px-4 py-8 relative">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-academic-foreground/20 rounded-full">
              <GraduationCap className="w-10 h-10 text-academic-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-academic-foreground mb-2">
                College Exam Seating Arrangement Generator
              </h1>
              <p className="text-academic-foreground/90 text-lg">
                Intelligent PDF-based seating plan generator for exam halls with room-wise distribution
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary" className="bg-academic-foreground/20 text-academic-foreground">
                  PDF Processing
                </Badge>
                <Badge variant="secondary" className="bg-academic-foreground/20 text-academic-foreground">
                  Smart Distribution
                </Badge>
                <Badge variant="secondary" className="bg-academic-foreground/20 text-academic-foreground">
                  Multiple Formats
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Progress
            </CardTitle>
            <CardDescription>
              Follow these steps to generate your seating arrangement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = step.completed;
                
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      isActive
                        ? 'bg-primary/10 border-primary text-primary'
                        : isCompleted
                        ? 'bg-success/10 border-success text-success'
                        : 'bg-muted border-border text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{step.label}</span>
                    {isCompleted && <Badge variant="secondary" className="ml-2">✓</Badge>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={currentStep} onValueChange={setCurrentStep}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload" disabled={false}>Upload PDF</TabsTrigger>
            <TabsTrigger value="configure" disabled={students.length === 0}>Configure</TabsTrigger>
            <TabsTrigger value="preview" disabled={rooms.length === 0}>Preview</TabsTrigger>
            <TabsTrigger value="generate" disabled={!seatingPlan}>Generate</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <PdfUploader onPdfProcessed={handlePdfProcessed} />
          </TabsContent>

          <TabsContent value="configure" className="mt-6">
            <RoomConfiguration
              students={students}
              examInfo={examInfo}
              onRoomsConfigured={handleRoomsConfigured}
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <SeatingPreview
              students={students}
              rooms={rooms}
              examInfo={examInfo}
              onSeatingGenerated={handleSeatingGenerated}
            />
          </TabsContent>

          <TabsContent value="generate" className="mt-6">
            <ReportGeneration
              seatingPlan={seatingPlan}
              examInfo={examInfo}
            />
          </TabsContent>
        </Tabs>

        {/* Stats Summary */}
        {students.length > 0 && (
          <Card className="mt-8 shadow-card">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{students.length}</div>
                  <div className="text-sm text-muted-foreground">Total Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-academic">{rooms.length}</div>
                  <div className="text-sm text-muted-foreground">Exam Rooms</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {rooms.reduce((sum, room) => sum + room.benches, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Benches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">{examInfo.shift}</div>
                  <div className="text-sm text-muted-foreground">Exam Shift</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;