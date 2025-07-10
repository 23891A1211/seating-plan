import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Trash2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Student, Room } from '@/types/seating';

interface RoomConfigurationProps {
  students: Student[];
  examInfo: { name: string; shift: 'Morning' | 'Evening' };
  onRoomsConfigured: (rooms: Room[]) => void;
}

export const RoomConfiguration: React.FC<RoomConfigurationProps> = ({
  students,
  examInfo,
  onRoomsConfigured
}) => {
  const [numRooms, setNumRooms] = useState<string>('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const { toast } = useToast();

  const handleNumRoomsChange = (value: string) => {
    setNumRooms(value);
    const count = parseInt(value);
    if (count > 0 && count <= 20) {
      const newRooms: Room[] = Array.from({ length: count }, (_, index) => ({
        roomNumber: `${101 + index}`,
        benches: 20
      }));
      setRooms(newRooms);
    } else {
      setRooms([]);
    }
  };

  const updateRoom = (index: number, field: keyof Room, value: string | number) => {
    const updatedRooms = [...rooms];
    updatedRooms[index] = { ...updatedRooms[index], [field]: value };
    setRooms(updatedRooms);
  };

  const addRoom = () => {
    const newRoom: Room = {
      roomNumber: `${Math.max(...rooms.map(r => parseInt(r.roomNumber)), 100) + 1}`,
      benches: 20
    };
    setRooms([...rooms, newRoom]);
    setNumRooms((rooms.length + 1).toString());
  };

  const removeRoom = (index: number) => {
    const updatedRooms = rooms.filter((_, i) => i !== index);
    setRooms(updatedRooms);
    setNumRooms(updatedRooms.length.toString());
  };

  const handleProceedToPreview = () => {
    const totalCapacity = rooms.reduce((sum, room) => sum + room.benches, 0);
    
    if (rooms.length === 0) {
      toast({
        title: 'No Rooms Configured',
        description: 'Please configure at least one room.',
        variant: 'destructive'
      });
      return;
    }

    if (totalCapacity < students.length) {
      toast({
        title: 'Insufficient Capacity',
        description: `Total room capacity (${totalCapacity}) is less than the number of students (${students.length}).`,
        variant: 'destructive'
      });
      return;
    }

    // Validate room numbers are unique
    const roomNumbers = rooms.map(r => r.roomNumber);
    const uniqueRoomNumbers = new Set(roomNumbers);
    if (roomNumbers.length !== uniqueRoomNumbers.size) {
      toast({
        title: 'Duplicate Room Numbers',
        description: 'Please ensure all room numbers are unique.',
        variant: 'destructive'
      });
      return;
    }

    onRoomsConfigured(rooms);
  };

  const totalCapacity = rooms.reduce((sum, room) => sum + room.benches, 0);
  const utilizationPercentage = totalCapacity > 0 ? Math.round((students.length / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Room Configuration
          </CardTitle>
          <CardDescription>
            Configure exam rooms and their seating capacity for {examInfo.name} ({examInfo.shift} Shift)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numRooms">Number of Rooms</Label>
              <Input
                id="numRooms"
                type="number"
                min="1"
                max="20"
                placeholder="e.g., 3"
                value={numRooms}
                onChange={(e) => handleNumRoomsChange(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addRoom} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Room
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Students: {students.length}</Badge>
              <Badge variant="outline">Capacity: {totalCapacity}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {rooms.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Room Details
            </CardTitle>
            <CardDescription>
              Configure individual room numbers and bench counts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rooms.map((room, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`room-${index}`}>Room Number</Label>
                      <Input
                        id={`room-${index}`}
                        value={room.roomNumber}
                        onChange={(e) => updateRoom(index, 'roomNumber', e.target.value)}
                        placeholder="e.g., 101"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`benches-${index}`}>Number of Benches</Label>
                      <Input
                        id={`benches-${index}`}
                        type="number"
                        min="1"
                        max="100"
                        value={room.benches}
                        onChange={(e) => updateRoom(index, 'benches', parseInt(e.target.value) || 0)}
                        placeholder="e.g., 20"
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeRoom(index)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {rooms.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Capacity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{students.length}</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-academic">{totalCapacity}</div>
                <div className="text-sm text-muted-foreground">Total Capacity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{totalCapacity - students.length}</div>
                <div className="text-sm text-muted-foreground">Empty Seats</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${utilizationPercentage > 90 ? 'text-warning' : 'text-success'}`}>
                  {utilizationPercentage}%
                </div>
                <div className="text-sm text-muted-foreground">Utilization</div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                variant="academic" 
                size="lg" 
                onClick={handleProceedToPreview}
                className="w-full"
                disabled={totalCapacity < students.length}
              >
                Generate Seating Arrangement
              </Button>
              {totalCapacity < students.length && (
                <p className="text-sm text-destructive text-center mt-2">
                  Increase room capacity to accommodate all students
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};