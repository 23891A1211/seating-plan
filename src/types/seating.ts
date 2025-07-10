export interface Student {
  rollNumber: string;
  name: string;
  class: string;
  branch: string;
}

export interface Room {
  roomNumber: string;
  benches: number;
}

export interface SeatingAssignment {
  roomNumber: string;
  benchNumber: number;
  student: Student;
}

export interface SeatingPlan {
  assignments: SeatingAssignment[];
  summary: {
    totalStudents: number;
    totalRooms: number;
    totalBenches: number;
    occupiedBenches: number;
    emptyBenches: number;
  };
}

export interface ExamInfo {
  name: string;
  shift: 'Morning' | 'Evening';
}