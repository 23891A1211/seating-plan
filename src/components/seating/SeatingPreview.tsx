import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Users, Shuffle, Filter } from 'lucide-react';
import { Student, Room, SeatingPlan, SeatingAssignment } from '@/types/seating';

interface SeatingPreviewProps {
  students: Student[];
  rooms: Room[];
  examInfo: { name: string; shift: 'Morning' | 'Evening' };
  onSeatingGenerated: (plan: SeatingPlan) => void;
}

export const SeatingPreview: React.FC<SeatingPreviewProps> = ({
  students,
  rooms,
  examInfo,
  onSeatingGenerated
}) => {
  const [seatingPlan, setSeatingPlan] = useState<SeatingPlan | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  // Generate seating arrangement
  const generateSeatingArrangement = (): SeatingPlan => {
    const assignments: SeatingAssignment[] = [];
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5); // Shuffle for randomization
    
    let studentIndex = 0;
    let totalBenches = 0;

    // Calculate total benches
    rooms.forEach(room => {
      totalBenches += room.benches;
    });

    // Distribute students across rooms and benches
    for (const room of rooms) {
      for (let benchNum = 1; benchNum <= room.benches; benchNum++) {
        if (studentIndex < shuffledStudents.length) {
          assignments.push({
            roomNumber: room.roomNumber,
            benchNumber: benchNum,
            student: shuffledStudents[studentIndex]
          });
          studentIndex++;
        }
      }
    }

    const summary = {
      totalStudents: students.length,
      totalRooms: rooms.length,
      totalBenches: totalBenches,
      occupiedBenches: students.length,
      emptyBenches: totalBenches - students.length
    };

    return { assignments, summary };
  };

  useEffect(() => {
    if (students.length > 0 && rooms.length > 0) {
      const plan = generateSeatingArrangement();
      setSeatingPlan(plan);
    }
  }, [students, rooms]);

  const handleRegenerateSeating = () => {
    const plan = generateSeatingArrangement();
    setSeatingPlan(plan);
  };

  const handleProceedToGenerate = () => {
    if (seatingPlan) {
      onSeatingGenerated(seatingPlan);
    }
  };

  if (!seatingPlan) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Generating seating arrangement...</div>
        </CardContent>
      </Card>
    );
  }

  const branches = Array.from(new Set(students.map(s => s.branch)));
  const filteredAssignments = seatingPlan.assignments.filter(assignment => {
    const roomMatch = selectedRoom === 'all' || assignment.roomNumber === selectedRoom;
    const branchMatch = selectedBranch === 'all' || assignment.student.branch === selectedBranch;
    return roomMatch && branchMatch;
  });

  const groupedByRoom = filteredAssignments.reduce((acc, assignment) => {
    if (!acc[assignment.roomNumber]) {
      acc[assignment.roomNumber] = [];
    }
    acc[assignment.roomNumber].push(assignment);
    return acc;
  }, {} as Record<string, SeatingAssignment[]>);

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Seating Arrangement Preview
          </CardTitle>
          <CardDescription>
            Review the generated seating plan for {examInfo.name} ({examInfo.shift} Shift)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  {rooms.map(room => (
                    <SelectItem key={room.roomNumber} value={room.roomNumber}>
                      Room {room.roomNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map(branch => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleRegenerateSeating}>
              <Shuffle className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">{seatingPlan.summary.totalStudents}</div>
              <div className="text-sm text-muted-foreground">Students Assigned</div>
            </div>
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success">{seatingPlan.summary.occupiedBenches}</div>
              <div className="text-sm text-muted-foreground">Occupied Benches</div>
            </div>
            <div className="text-center p-4 bg-warning/10 rounded-lg">
              <div className="text-2xl font-bold text-warning">{seatingPlan.summary.emptyBenches}</div>
              <div className="text-sm text-muted-foreground">Empty Benches</div>
            </div>
            <div className="text-center p-4 bg-academic/10 rounded-lg">
              <div className="text-2xl font-bold text-academic">{seatingPlan.summary.totalRooms}</div>
              <div className="text-sm text-muted-foreground">Rooms Used</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {Object.entries(groupedByRoom).map(([roomNumber, assignments]) => (
          <Card key={roomNumber} className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Room {roomNumber}
                </CardTitle>
                <Badge variant="outline">
                  {assignments.length} students
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {assignments
                  .sort((a, b) => a.benchNumber - b.benchNumber)
                  .map((assignment) => (
                    <div
                      key={`${assignment.roomNumber}-${assignment.benchNumber}`}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                        {assignment.benchNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {assignment.student.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {assignment.student.rollNumber}
                        </div>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {assignment.student.branch}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {assignment.student.class}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          <Button 
            variant="academic" 
            size="lg" 
            onClick={handleProceedToGenerate}
            className="w-full"
          >
            Generate Reports & Download
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};