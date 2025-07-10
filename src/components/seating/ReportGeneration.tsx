import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, FileSpreadsheet, Users, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SeatingPlan } from '@/types/seating';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface ReportGenerationProps {
  seatingPlan: SeatingPlan | null;
  examInfo: { name: string; shift: 'Morning' | 'Evening' };
}

export const ReportGeneration: React.FC<ReportGenerationProps> = ({
  seatingPlan,
  examInfo
}) => {
  const { toast } = useToast();

  if (!seatingPlan) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">No seating plan available</div>
        </CardContent>
      </Card>
    );
  }

  const generatePDFReport = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    let yPos = 30;

    // Title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Exam Seating Arrangement Report', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 20;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Exam: ${examInfo.name}`, margin, yPos);
    yPos += 10;
    pdf.text(`Shift: ${examInfo.shift}`, margin, yPos);
    yPos += 10;
    pdf.text(`Date Generated: ${new Date().toLocaleDateString()}`, margin, yPos);
    
    yPos += 20;
    
    // Summary
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Summary', margin, yPos);
    yPos += 15;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Students: ${seatingPlan.summary.totalStudents}`, margin, yPos);
    yPos += 8;
    pdf.text(`Total Rooms: ${seatingPlan.summary.totalRooms}`, margin, yPos);
    yPos += 8;
    pdf.text(`Occupied Benches: ${seatingPlan.summary.occupiedBenches}`, margin, yPos);
    yPos += 8;
    pdf.text(`Empty Benches: ${seatingPlan.summary.emptyBenches}`, margin, yPos);
    
    yPos += 20;

    // Room-wise seating
    const groupedByRoom = seatingPlan.assignments.reduce((acc, assignment) => {
      if (!acc[assignment.roomNumber]) {
        acc[assignment.roomNumber] = [];
      }
      acc[assignment.roomNumber].push(assignment);
      return acc;
    }, {} as Record<string, typeof seatingPlan.assignments>);

    Object.entries(groupedByRoom).forEach(([roomNumber, assignments]) => {
      if (yPos > 250) {
        pdf.addPage();
        yPos = 30;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Room ${roomNumber}`, margin, yPos);
      yPos += 15;

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      
      // Table headers
      const headers = ['Bench', 'Roll Number', 'Name', 'Class', 'Branch'];
      const colWidths = [20, 35, 60, 25, 25];
      let xPos = margin;
      
      headers.forEach((header, index) => {
        pdf.text(header, xPos, yPos);
        xPos += colWidths[index];
      });
      yPos += 8;

      // Draw line under headers
      pdf.line(margin, yPos - 2, margin + 165, yPos - 2);
      yPos += 5;

      assignments
        .sort((a, b) => a.benchNumber - b.benchNumber)
        .forEach((assignment) => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = 30;
          }

          xPos = margin;
          const rowData = [
            assignment.benchNumber.toString(),
            assignment.student.rollNumber,
            assignment.student.name,
            assignment.student.class,
            assignment.student.branch
          ];

          rowData.forEach((data, index) => {
            pdf.text(data, xPos, yPos);
            xPos += colWidths[index];
          });
          yPos += 8;
        });

      yPos += 15;
    });

    pdf.save(`${examInfo.name.replace(/\s+/g, '_')}_Seating_Plan.pdf`);
    
    toast({
      title: 'PDF Generated',
      description: 'Seating plan PDF has been downloaded successfully.',
    });
  };

  const generateExcelReport = () => {
    const workbook = XLSX.utils.book_new();
    
    // Summary Sheet
    const summaryData = [
      ['Exam Seating Arrangement Report'],
      [''],
      ['Exam Name', examInfo.name],
      ['Shift', examInfo.shift],
      ['Date Generated', new Date().toLocaleDateString()],
      [''],
      ['Summary'],
      ['Total Students', seatingPlan.summary.totalStudents],
      ['Total Rooms', seatingPlan.summary.totalRooms],
      ['Total Benches', seatingPlan.summary.totalBenches],
      ['Occupied Benches', seatingPlan.summary.occupiedBenches],
      ['Empty Benches', seatingPlan.summary.emptyBenches]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Complete Seating List
    const seatingData = [
      ['Room Number', 'Bench Number', 'Roll Number', 'Student Name', 'Class', 'Branch']
    ];
    
    seatingPlan.assignments
      .sort((a, b) => {
        if (a.roomNumber !== b.roomNumber) {
          return a.roomNumber.localeCompare(b.roomNumber);
        }
        return a.benchNumber - b.benchNumber;
      })
      .forEach(assignment => {
        seatingData.push([
          assignment.roomNumber,
          assignment.benchNumber.toString(),
          assignment.student.rollNumber,
          assignment.student.name,
          assignment.student.class,
          assignment.student.branch
        ]);
      });

    const seatingSheet = XLSX.utils.aoa_to_sheet(seatingData);
    XLSX.utils.book_append_sheet(workbook, seatingSheet, 'Complete Seating List');

    // Room-wise sheets
    const groupedByRoom = seatingPlan.assignments.reduce((acc, assignment) => {
      if (!acc[assignment.roomNumber]) {
        acc[assignment.roomNumber] = [];
      }
      acc[assignment.roomNumber].push(assignment);
      return acc;
    }, {} as Record<string, typeof seatingPlan.assignments>);

    Object.entries(groupedByRoom).forEach(([roomNumber, assignments]) => {
      const roomData = [
        [`Room ${roomNumber} - Seating List`],
        [''],
        ['Bench Number', 'Roll Number', 'Student Name', 'Class', 'Branch']
      ];

      assignments
        .sort((a, b) => a.benchNumber - b.benchNumber)
        .forEach(assignment => {
          roomData.push([
            assignment.benchNumber.toString(),
            assignment.student.rollNumber,
            assignment.student.name,
            assignment.student.class,
            assignment.student.branch
          ]);
        });

      const roomSheet = XLSX.utils.aoa_to_sheet(roomData);
      XLSX.utils.book_append_sheet(workbook, roomSheet, `Room ${roomNumber}`);
    });

    XLSX.writeFile(workbook, `${examInfo.name.replace(/\s+/g, '_')}_Seating_Plan.xlsx`);
    
    toast({
      title: 'Excel Generated',
      description: 'Seating plan Excel file has been downloaded successfully.',
    });
  };

  const generateAttendanceSheet = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;

    const groupedByRoom = seatingPlan.assignments.reduce((acc, assignment) => {
      if (!acc[assignment.roomNumber]) {
        acc[assignment.roomNumber] = [];
      }
      acc[assignment.roomNumber].push(assignment);
      return acc;
    }, {} as Record<string, typeof seatingPlan.assignments>);

    Object.entries(groupedByRoom).forEach(([roomNumber, assignments], roomIndex) => {
      if (roomIndex > 0) pdf.addPage();
      
      let yPos = 30;

      // Header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Attendance Sheet - Room ${roomNumber}`, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 15;
      pdf.setFontSize(12);
      pdf.text(`Exam: ${examInfo.name} (${examInfo.shift} Shift)`, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 10;
      pdf.text(`Date: _______________`, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 20;

      // Table
      pdf.setFontSize(10);
      const headers = ['S.No.', 'Roll Number', 'Student Name', 'Bench', 'Signature'];
      const colWidths = [15, 35, 60, 20, 40];
      let xPos = margin;

      pdf.setFont('helvetica', 'bold');
      headers.forEach((header, index) => {
        pdf.text(header, xPos, yPos);
        xPos += colWidths[index];
      });
      
      pdf.line(margin, yPos + 2, margin + 170, yPos + 2);
      yPos += 10;

      pdf.setFont('helvetica', 'normal');
      assignments
        .sort((a, b) => a.benchNumber - b.benchNumber)
        .forEach((assignment, index) => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = 30;
          }

          xPos = margin;
          const rowData = [
            (index + 1).toString(),
            assignment.student.rollNumber,
            assignment.student.name,
            assignment.benchNumber.toString(),
            ''
          ];

          rowData.forEach((data, colIndex) => {
            pdf.text(data, xPos, yPos);
            xPos += colWidths[colIndex];
            
            // Draw line for signature in the last column
            if (colIndex === 4) {
              pdf.line(xPos - 35, yPos + 2, xPos - 5, yPos + 2);
            }
          });
          
          yPos += 8;
        });
    });

    pdf.save(`${examInfo.name.replace(/\s+/g, '_')}_Attendance_Sheets.pdf`);
    
    toast({
      title: 'Attendance Sheets Generated',
      description: 'Attendance sheets PDF has been downloaded successfully.',
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Generate Reports
          </CardTitle>
          <CardDescription>
            Download comprehensive seating reports in multiple formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">{seatingPlan.summary.totalStudents}</div>
              <div className="text-sm text-muted-foreground">Students</div>
            </div>
            <div className="text-center p-4 bg-academic/10 rounded-lg">
              <div className="text-2xl font-bold text-academic">{seatingPlan.summary.totalRooms}</div>
              <div className="text-sm text-muted-foreground">Rooms</div>
            </div>
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success">{seatingPlan.summary.occupiedBenches}</div>
              <div className="text-sm text-muted-foreground">Occupied</div>
            </div>
            <div className="text-center p-4 bg-warning/10 rounded-lg">
              <div className="text-2xl font-bold text-warning">{seatingPlan.summary.emptyBenches}</div>
              <div className="text-sm text-muted-foreground">Empty</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-4 h-4" />
                  PDF Report
                </CardTitle>
                <CardDescription className="text-sm">
                  Complete seating plan with room-wise breakdown
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button onClick={generatePDFReport} className="w-full" variant="default">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel Report
                </CardTitle>
                <CardDescription className="text-sm">
                  Spreadsheet with multiple sheets for detailed analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button onClick={generateExcelReport} className="w-full" variant="success">
                  <Download className="w-4 h-4 mr-2" />
                  Download Excel
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="w-4 h-4" />
                  Attendance Sheets
                </CardTitle>
                <CardDescription className="text-sm">
                  Room-wise attendance sheets for invigilators
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button onClick={generateAttendanceSheet} className="w-full" variant="academic">
                  <Download className="w-4 h-4 mr-2" />
                  Download Sheets
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-academic text-academic-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Seating Plan Complete!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-academic-foreground/90 mb-4">
                Your exam seating arrangement has been successfully generated. All reports are ready for download.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-academic-foreground/20 text-academic-foreground">
                  {examInfo.name}
                </Badge>
                <Badge variant="secondary" className="bg-academic-foreground/20 text-academic-foreground">
                  {examInfo.shift} Shift
                </Badge>
                <Badge variant="secondary" className="bg-academic-foreground/20 text-academic-foreground">
                  {seatingPlan.summary.totalStudents} Students
                </Badge>
                <Badge variant="secondary" className="bg-academic-foreground/20 text-academic-foreground">
                  {seatingPlan.summary.totalRooms} Rooms
                </Badge>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};