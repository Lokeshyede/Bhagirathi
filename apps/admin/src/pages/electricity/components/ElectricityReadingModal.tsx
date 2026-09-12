import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import { X, Zap } from "lucide-react";
import { Button } from "@bhagirathi/ui";

export const ElectricityReadingModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [selectedHostelId, setSelectedHostelId] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [selectedFloorId, setSelectedFloorId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [previousReading, setPreviousReading] = useState("");
  const [currentReading, setCurrentReading] = useState("");
  const [ratePerUnit, setRatePerUnit] = useState("10.0");
  const [billMonth, setBillMonth] = useState(new Date().getMonth() + 1);
  const [billYear, setBillYear] = useState(new Date().getFullYear());
  const [dueDate] = useState(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10));

  const { data: hostels } = useQuery<any[]>({
    queryKey: ["hostels"],
    queryFn: async () => (await apiClient.get("/api/v1/hostels")).data,
    enabled: isOpen
  });

  const { data: buildings } = useQuery<any[]>({
    queryKey: ["buildings", selectedHostelId],
    queryFn: async () => (await apiClient.get("/api/v1/buildings", { params: { hostel_id: selectedHostelId } })).data,
    enabled: !!selectedHostelId && isOpen
  });

  const { data: floors } = useQuery<any[]>({
    queryKey: ["floors", selectedBuildingId],
    queryFn: async () => (await apiClient.get("/api/v1/floors", { params: { building_id: selectedBuildingId } })).data,
    enabled: !!selectedBuildingId && isOpen
  });

  const { data: rooms } = useQuery<any[]>({
    queryKey: ["rooms", selectedFloorId],
    queryFn: async () => (await apiClient.get("/api/v1/rooms", { params: { floor_id: selectedFloorId } })).data,
    enabled: !!selectedFloorId && isOpen
  });

  const { data: lastReadingData } = useQuery<any>({
    queryKey: ["room-last-reading", selectedRoomId],
    queryFn: async () => (await apiClient.get(`/api/v1/electricity-bills/rooms/${selectedRoomId}/last-reading`, { params: { meter_type: "Electricity" } })).data,
    enabled: !!selectedRoomId && isOpen
  });

  const hasHistoricalReading = lastReadingData?.previous_reading !== undefined && lastReadingData?.previous_reading !== null;

  useEffect(() => {
    if (hasHistoricalReading) {
      setPreviousReading(lastReadingData.current_reading?.toString() || "0");
    } else {
      setPreviousReading("");
    }
  }, [lastReadingData, hasHistoricalReading]);

  // Resets
  useEffect(() => { setSelectedBuildingId(""); setSelectedFloorId(""); setSelectedRoomId(""); setPreviousReading(""); }, [selectedHostelId]);
  useEffect(() => { setSelectedFloorId(""); setSelectedRoomId(""); setPreviousReading(""); }, [selectedBuildingId]);
  useEffect(() => { setSelectedRoomId(""); setPreviousReading(""); }, [selectedFloorId]);

  const generateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiClient.post("/api/v1/electricity-bills/generate", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["electricity-history"] });
      queryClient.invalidateQueries({ queryKey: ["electricity-stats"] });
      alert("Bill Generated Successfully!");
      onClose();
    }
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const curr = parseFloat(currentReading);
    const prev = parseFloat(previousReading);
    if (isNaN(curr) || isNaN(prev) || curr < prev) {
      alert("Invalid readings. Current must be >= Previous.");
      return;
    }

    const formData = new FormData();
    formData.append("hostel_id", selectedHostelId);
    formData.append("building_id", selectedBuildingId);
    formData.append("floor_id", selectedFloorId);
    formData.append("room_id", selectedRoomId);
    formData.append("previous_reading", prev.toString());
    formData.append("current_reading", curr.toString());
    formData.append("unit_rate", ratePerUnit);
    formData.append("bill_month", billMonth.toString());
    formData.append("bill_year", billYear.toString());
    formData.append("due_date", dueDate);
    
    try {
      await generateMutation.mutateAsync(formData);
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to generate bill.");
    }
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-900 border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Log Electricity Reading
          </h2>
          <button onClick={onClose} className="p-1 hover:text-red-500">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label>Hostel *</label>
              <select required value={selectedHostelId} onChange={e => setSelectedHostelId(e.target.value)} className="h-9 px-2 border border-border rounded bg-transparent">
                <option value="">Select Hostel</option>
                {hostels?.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            {selectedHostelId && (
              <div className="flex flex-col gap-1.5">
                <label>Building *</label>
                <select required value={selectedBuildingId} onChange={e => setSelectedBuildingId(e.target.value)} className="h-9 px-2 border border-border rounded bg-transparent">
                  <option value="">Select Building</option>
                  {buildings?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            )}
            {selectedBuildingId && (
              <div className="flex flex-col gap-1.5">
                <label>Floor *</label>
                <select required value={selectedFloorId} onChange={e => setSelectedFloorId(e.target.value)} className="h-9 px-2 border border-border rounded bg-transparent">
                  <option value="">Select Floor</option>
                  {floors?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            )}
            {selectedFloorId && (
              <div className="flex flex-col gap-1.5">
                <label>Room *</label>
                <select required value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)} className="h-9 px-2 border border-border rounded bg-transparent">
                  <option value="">Select Room</option>
                  {rooms?.map(r => <option key={r.id} value={r.id}>Room {r.room_number}</option>)}
                </select>
              </div>
            )}
          </div>

          {selectedRoomId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="flex flex-col gap-1.5">
                <label>{hasHistoricalReading ? "Previous Reading (Locked)" : "Initial Previous Reading *"}</label>
                {hasHistoricalReading ? (
                  <div className="h-9 px-3 border border-border bg-gray-50 dark:bg-gray-800 rounded flex items-center">{previousReading}</div>
                ) : (
                  <input type="number" step="0.01" required value={previousReading} onChange={e => setPreviousReading(e.target.value)} className="h-9 px-2 border border-border rounded bg-transparent" />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label>Current Reading *</label>
                <input type="number" step="0.01" required value={currentReading} onChange={e => setCurrentReading(e.target.value)} className="h-9 px-2 border border-border rounded bg-transparent" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label>Rate / Unit (₹)</label>
                <input type="number" step="0.01" required value={ratePerUnit} onChange={e => setRatePerUnit(e.target.value)} className="h-9 px-2 border border-border rounded bg-transparent" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label>Bill Month & Year</label>
                <div className="flex gap-2">
                  <select value={billMonth} onChange={e => setBillMonth(parseInt(e.target.value))} className="h-9 px-2 border border-border rounded bg-transparent w-full">
                    {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                  </select>
                  <input type="number" value={billYear} onChange={e => setBillYear(parseInt(e.target.value))} className="h-9 px-2 border border-border rounded bg-transparent w-24" />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 gap-2">
            <Button type="button" onClick={onClose} className="bg-transparent border border-border text-primaryText hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</Button>
            <Button type="submit" isLoading={generateMutation.isPending} disabled={!selectedRoomId || generateMutation.isPending} className="bg-primary text-white font-bold">Generate Bill</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
