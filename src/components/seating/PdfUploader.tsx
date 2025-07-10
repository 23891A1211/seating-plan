import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileUp, Upload, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/types/seating';

interface PdfUploaderProps {
  onPdfProcessed: (students: Student[], examName: string, shift: 'Morning' | 'Evening') => void;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({ onPdfProcessed }) => {
  const [examName, setExamName] = useState('');
  const [shift, setShift] = useState<'Morning' | 'Evening'>('Morning');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [extractedStudents, setExtractedStudents] = useState<Student[]>([]);
  const { toast } = useToast();

  // Mock PDF processing function (in real implementation, would use pdf parsing libraries)
  const processPdfFile = async (file: File): Promise<Student[]> => {
    // Simulate PDF processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock extracted data - in real implementation, this would parse the actual PDF
    const mockStudents: Student[] = [
      { rollNumber: '2021CSE001', name: 'Aarav Sharma', class: '3rd Year', branch: 'CSE' },
      { rollNumber: '2021CSE002', name: 'Vivaan Singh', class: '3rd Year', branch: 'CSE' },
      { rollNumber: '2021ECE001', name: 'Aditya Kumar', class: '3rd Year', branch: 'ECE' },
      { rollNumber: '2021ECE002', name: 'Vihaan Patel', class: '3rd Year', branch: 'ECE' },
      { rollNumber: '2021ME001', name: 'Arjun Gupta', class: '3rd Year', branch: 'ME' },
      { rollNumber: '2021ME002', name: 'Sai Reddy', class: '3rd Year', branch: 'ME' },
      { rollNumber: '2021CSE003', name: 'Ishaan Verma', class: '3rd Year', branch: 'CSE' },
      { rollNumber: '2021ECE003', name: 'Shivansh Jain', class: '3rd Year', branch: 'ECE' },
      { rollNumber: '2021ME003', name: 'Aryan Mishra', class: '3rd Year', branch: 'ME' },
      { rollNumber: '2021CSE004', name: 'Rudra Agarwal', class: '3rd Year', branch: 'CSE' },
      { rollNumber: '2021ECE004', name: 'Aadhya Sharma', class: '3rd Year', branch: 'ECE' },
      { rollNumber: '2021ME004', name: 'Kiara Singh', class: '3rd Year', branch: 'ME' },
      { rollNumber: '2021CSE005', name: 'Diya Patel', class: '3rd Year', branch: 'CSE' },
      { rollNumber: '2021ECE005', name: 'Ananya Kumar', class: '3rd Year', branch: 'ECE' },
      { rollNumber: '2021ME005', name: 'Saanvi Gupta', class: '3rd Year', branch: 'ME' },
    ];
    
    return mockStudents;
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a PDF file.',
        variant: 'destructive'
      });
      return;
    }

    if (!examName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter the exam name.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    setUploadStatus('idle');

    try {
      const students = await processPdfFile(file);
      setExtractedStudents(students);
      setUploadStatus('success');
      
      toast({
        title: 'PDF Processed Successfully',
        description: `Extracted ${students.length} student records.`,
      });
    } catch (error) {
      setUploadStatus('error');
      toast({
        title: 'Processing Failed',
        description: 'Failed to extract student data from PDF.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [examName, toast]);

  const handleProceedToNext = () => {
    onPdfProcessed(extractedStudents, examName, shift);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="w-5 h-5" />
            Upload Student Data PDF
          </CardTitle>
          <CardDescription>
            Upload a PDF containing student information with Roll Number, Name, Class, and Branch columns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="examName">Exam Name/Title</Label>
              <Input
                id="examName"
                placeholder="e.g., Mid-Term Examination 2024"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift">Exam Shift</Label>
              <Select value={shift} onValueChange={(value: 'Morning' | 'Evening') => setShift(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Morning">Morning</SelectItem>
                  <SelectItem value="Evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="pdfFile">Student Data PDF</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop your PDF file
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF files only, max 10MB
                </p>
              </div>
              <Input
                id="pdfFile"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => document.getElementById('pdfFile')?.click()}
                disabled={isProcessing}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Choose PDF File'}
              </Button>
            </div>
          </div>

          {uploadStatus === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully extracted {extractedStudents.length} student records from the PDF.
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to process the PDF file. Please ensure the PDF contains a properly formatted table with student data.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {extractedStudents.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Extracted Student Data Preview</CardTitle>
            <CardDescription>
              Review the extracted student information below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Total Students: {extractedStudents.length}</Badge>
                <Badge variant="outline">
                  Branches: {Array.from(new Set(extractedStudents.map(s => s.branch))).join(', ')}
                </Badge>
                <Badge variant="outline">
                  Classes: {Array.from(new Set(extractedStudents.map(s => s.class))).join(', ')}
                </Badge>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Roll Number</th>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Class</th>
                      <th className="p-2 text-left">Branch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedStudents.slice(0, 10).map((student) => (
                      <tr key={student.rollNumber} className="border-b">
                        <td className="p-2">{student.rollNumber}</td>
                        <td className="p-2">{student.name}</td>
                        <td className="p-2">{student.class}</td>
                        <td className="p-2">{student.branch}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {extractedStudents.length > 10 && (
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    ... and {extractedStudents.length - 10} more students
                  </p>
                )}
              </div>

              <Button variant="academic" size="lg" onClick={handleProceedToNext} className="w-full">
                Proceed to Room Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};