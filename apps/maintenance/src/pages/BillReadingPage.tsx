import React, { useState, useEffect } from "react";
import {
  useHostels,
  useBuildings,
  useFloors,
  useRooms,
  useBillReadings,
  useCreateBillReading,
  useRoomLastReading,
  useGenerateElectricityBill
} from "../features/complaint/hooks/useBillReading";
import { Button } from "@bhagirathi/ui";
import {
  FileText, Upload, Plus, RefreshCw, Eye, X, Zap, Droplet
} from "lucide-react";
import { motion } from "framer-motion";

export const BillReadingPage: React.FC = () => {
  // Cascading state
  const [selectedHostelId, setSelectedHostelId] = useState<string>("");
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [selectedFloorId, setSelectedFloorId] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [meterType, setMeterType] = useState<string>("Electricity");
  
  // Electricity specific states
  const [meterNumber, setMeterNumber] = useState<string>("");
  const [ratePerUnit, setRatePerUnit] = useState<string>("10.0");
  const [billMonth, setBillMonth] = useState<number>(new Date().getMonth() + 1);
  const [billYear] = useState<number>(new Date().getFullYear());
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
  );

  // Readings inputs
  const [previousReading, setPreviousReading] = useState<string>("");
  const [currentReading, setCurrentReading] = useState<string>("");
  const [readingDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [remarks, setRemarks] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  // Submit loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: hostels } = useHostels();
  const { data: buildings, isLoading: loadingBuildings, error: buildingError, refetch: refetchBuildings } = useBuildings(selectedHostelId);
  const { data: floors } = useFloors(selectedBuildingId);
  const { data: rooms } = useRooms(selectedFloorId);

  // Auto fetch previous reading from bill history or last reading endpoint
  const { data: lastReadingData } = useRoomLastReading(selectedRoomId, meterType);

  // List of readings for history
  const [filterHostelId, setFilterHostelId] = useState<string>("");
  const [filterMeterType, setFilterMeterType] = useState<string>("ALL");
  const { data: readingsHistory, isLoading: loadingHistory, refetch: refetchHistory } = useBillReadings({
    hostelId: filterHostelId,
    meterType: filterMeterType
  });

  // Mutators
  const createReadingMutation = useCreateBillReading();
  const generateElectricityBillMutation = useGenerateElectricityBill();

  // Reset cascade steps on change
  useEffect(() => {
    setSelectedBuildingId("");
    setSelectedFloorId("");
    setSelectedRoomId("");
    setPreviousReading("");
  }, [selectedHostelId]);

  useEffect(() => {
    setSelectedFloorId("");
    setSelectedRoomId("");
    setPreviousReading("");
  }, [selectedBuildingId]);

  useEffect(() => {
    setPreviousReading("");
  }, [selectedFloorId]);

  useEffect(() => {
    setPreviousReading("");
  }, [selectedRoomId]);

  const hasHistoricalReading = lastReadingData?.previous_reading !== undefined && lastReadingData?.previous_reading !== null;

  // Autofill previous reading based on meter type and selections
  useEffect(() => {
    if (hasHistoricalReading) {
      setPreviousReading(lastReadingData.current_reading?.toString() || "0");
    } else {
      setPreviousReading("");
    }
  }, [lastReadingData, meterType, hasHistoricalReading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) {
      alert("Please select a room to log the reading.");
      return;
    }
    
    const currentVal = parseFloat(currentReading);
    const prevVal = parseFloat(previousReading);
    if (isNaN(currentVal)) {
      alert("Please specify a valid current meter reading.");
      return;
    }
    if (isNaN(prevVal) || prevVal < 0) {
      alert("Please specify a valid initial previous reading.");
      return;
    }
    if (currentVal < prevVal) {
      alert("Current reading cannot be lower than the previous reading.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("hostel_id", selectedHostelId);
      formData.append("building_id", selectedBuildingId);
      formData.append("floor_id", selectedFloorId);
      formData.append("room_id", selectedRoomId);
      formData.append("previous_reading", prevVal.toString());
      formData.append("current_reading", currentVal.toString());
      formData.append("remarks", remarks);
      if (photoFile) {
        formData.append("meter_photo", photoFile);
      }

      if (meterType === "Electricity") {
        const rateVal = parseFloat(ratePerUnit);
        if (isNaN(rateVal) || rateVal <= 0) {
          alert("Rate must be a positive number greater than zero.");
          setIsSubmitting(false);
          return;
        }

        formData.append("meter_number", meterNumber);
        formData.append("unit_rate", rateVal.toString());
        formData.append("bill_month", billMonth.toString());
        formData.append("bill_year", billYear.toString());
        formData.append("billing_month", months.find(m => m.value === billMonth)?.label + " " + billYear);
        formData.append("due_date", dueDate);

        await generateElectricityBillMutation.mutateAsync(formData);
        alert("Electricity bill generated successfully!");
      } else {
        // Water meter flow
        formData.append("meter_type", "Water");
        formData.append("reading_date", readingDate);
        await createReadingMutation.mutateAsync(formData);
        alert("Water meter reading logged successfully!");
      }
      
      // Reset inputs
      setCurrentReading("");
      setRemarks("");
      setPhotoFile(null);
      
      // Refresh history
      refetchHistory();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to submit meter reading.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentVal = parseFloat(currentReading);
  const prevVal = parseFloat(previousReading);
  const difference = !isNaN(currentVal) && !isNaN(prevVal) ? currentVal - prevVal : 0;
  const rateVal = parseFloat(ratePerUnit);
  const totalAmount = !isNaN(difference) && !isNaN(rateVal) ? difference * rateVal : 0;

  // Lightbox photo
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Title */}
      <div className="select-none">
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight leading-tight uppercase tracking-wider">PG Utility Logger</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-semibold">
          Log room electric/water meter metrics and automatically generate tenant bills.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 select-none">
            <h3 className="text-xs font-black text-stone-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="h-[18px] w-[18px] text-red-600" /> Log Meter Reading
            </h3>
          </div>

          {/* Meter Type Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200/60 dark:border-zinc-800 select-none">
            <button
              type="button"
              onClick={() => {
                setMeterType("Electricity");
                setCurrentReading("");
              }}
              className={`py-2 text-center text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                meterType === "Electricity"
                  ? "bg-white dark:bg-zinc-900 text-red-600 shadow-sm border border-slate-200 dark:border-zinc-800"
                  : "text-stone-450 hover:text-stone-705"
              }`}
            >
              <Zap className="h-4 w-4" /> Electricity
            </button>
            <button
              type="button"
              onClick={() => {
                setMeterType("Water");
                setCurrentReading("");
              }}
              className={`py-2 text-center text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                meterType === "Water"
                  ? "bg-white dark:bg-zinc-900 text-red-600 shadow-sm border border-slate-200 dark:border-zinc-800"
                  : "text-stone-450 hover:text-stone-705"
              }`}
            >
              <Droplet className="h-4 w-4" /> Water
            </button>
          </div>

          {/* Cascading selectors */}
          <div className="space-y-4 text-xs font-semibold">
            {/* Hostel Dropdown */}
            <div className="flex flex-col gap-1.5 select-none">
              <label className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-wider">Select Hostel *</label>
              <select
                required
                value={selectedHostelId}
                onChange={(e) => setSelectedHostelId(e.target.value)}
                className="h-10 px-3.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-stone-700 focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer"
              >
                <option value="">-- Choose Hostel --</option>
                {hostels?.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            {/* Building Dropdown */}
            {selectedHostelId && (
              <div className="flex flex-col gap-1.5 select-none">
                <label className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-wider">Select Building *</label>
                {loadingBuildings ? (
                  <select
                    disabled
                    className="h-10 px-3.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-100 dark:bg-zinc-900/50 text-xs font-bold text-stone-500 cursor-not-allowed focus:outline-none"
                  >
                    <option value="">Loading buildings...</option>
                  </select>
                ) : buildingError ? (
                  <div className="flex items-center gap-2">
                    <select
                      disabled
                      className="flex-1 h-10 px-3.5 border border-red-200 dark:border-red-900/30 rounded-xl bg-red-50 dark:bg-red-900/10 text-xs font-bold text-red-600 cursor-not-allowed focus:outline-none"
                    >
                      <option value="">Unable to load buildings</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => refetchBuildings()}
                      className="h-10 px-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                ) : buildings?.length === 0 ? (
                  <select
                    disabled
                    className="h-10 px-3.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-100 dark:bg-zinc-900/50 text-xs font-bold text-stone-500 cursor-not-allowed focus:outline-none"
                  >
                    <option value="">No buildings available for this hostel.</option>
                  </select>
                ) : (
                  <select
                    required
                    value={selectedBuildingId}
                    onChange={(e) => setSelectedBuildingId(e.target.value)}
                    className="h-10 px-3.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-stone-700 focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer"
                  >
                    <option value="">-- Choose Building --</option>
                    {buildings?.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Floor Dropdown */}
            {selectedBuildingId && (
              <div className="flex flex-col gap-1.5 select-none">
                <label className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-wider">Select Floor *</label>
                <select
                  required
                  value={selectedFloorId}
                  onChange={(e) => setSelectedFloorId(e.target.value)}
                  className="h-10 px-3.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-stone-700 focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer"
                >
                  <option value="">-- Choose Floor --</option>
                  {floors?.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Room Dropdown */}
            {selectedFloorId && (
              <div className="flex flex-col gap-1.5 select-none">
                <label className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-wider">Select Room *</label>
                <select
                  required
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="h-10 px-3.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-stone-700 focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer"
                >
                  <option value="">-- Choose Room --</option>
                  {rooms?.map((r) => (
                    <option key={r.id} value={r.id}>Room {r.room_number}</option>
                  ))}
                </select>
              </div>
            )}



            {/* Electricity specific inputs details */}
            {meterType === "Electricity" && selectedRoomId && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-wider">Meter Number</label>
                  <input
                    type="text"
                    required
                    value={meterNumber}
                    onChange={(e) => setMeterNumber(e.target.value)}
                    className="h-10 px-3.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-red-600"
                    placeholder="e.g. MTR-204"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-wider">Rate / Unit (₹)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={ratePerUnit}
                    onChange={(e) => setRatePerUnit(e.target.value)}
                    className="h-10 px-3.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-wider">Bill Month</label>
                  <select
                    value={billMonth}
                    onChange={(e) => setBillMonth(parseInt(e.target.value))}
                    className="h-10 px-3.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-stone-700 focus:outline-none cursor-pointer"
                  >
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-wider">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-10 px-3.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-xs font-semibold text-stone-800 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Previous & Current Reading details */}
            {selectedRoomId && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 select-none">
                  <label className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                    {hasHistoricalReading ? "Previous Reading" : "Initial Previous Reading *"}
                  </label>
                  {hasHistoricalReading ? (
                    <div className="h-10 px-3.5 border border-slate-200 bg-slate-100 rounded-xl flex justify-between items-center text-xs font-bold text-stone-500 dark:bg-zinc-800 dark:border-zinc-700 select-none">
                      <span>{previousReading}</span>
                      <span title="Automatically populated from last reading">🔒</span>
                    </div>
                  ) : (
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={previousReading}
                      onChange={(e) => setPreviousReading(e.target.value)}
                      className="h-10 px-3.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-stone-800 focus:outline-none focus:ring-1 focus:ring-red-600"
                      placeholder="Enter initial reading..."
                    />
                  )}
                  {!hasHistoricalReading && (
                    <p className="text-[9px] text-stone-400 font-semibold leading-tight">
                      This meter was already in use. Enter the current meter's last known reading as the initial previous reading.
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-wider">Current Reading *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={currentReading}
                    onChange={(e) => setCurrentReading(e.target.value)}
                    className="h-10 px-3.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-stone-800 focus:outline-none focus:ring-1 focus:ring-red-600"
                    placeholder="Enter units..."
                  />
                </div>
              </div>
            )}

            {/* Live calculation preview metrics */}
            {selectedRoomId && !isNaN(currentVal) && !isNaN(prevVal) && currentVal >= prevVal && (
              <div className="p-3 bg-red-50/20 dark:bg-red-900/5 border border-red-200/50 dark:border-red-900/30 rounded-2xl space-y-2 select-none">
                <span className="text-[9px] font-black text-red-600 uppercase tracking-wider block">Real-time Calculation Summary</span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[8px] text-stone-400 block font-black">UNITS</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{difference.toFixed(1)} Units</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-stone-400 block font-black">RATE</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">₹{rateVal.toFixed(1)}/Unit</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-stone-400 block font-black">TOTAL</span>
                    <span className="font-bold text-red-600">₹{totalAmount.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Remarks */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-wider select-none">Remarks (Optional)</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="h-10 px-3.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-red-600"
                placeholder="Comments / meter warnings..."
              />
            </div>

            {/* Meter Photo Snapshot Upload */}
            <div>
              <label className="block text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1.5 select-none">
                Attach Meter Snapshot Photo (Optional)
              </label>
              <div className="relative group border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-red-500 hover:bg-red-50/5 dark:hover:bg-zinc-950 bg-white dark:bg-zinc-950 rounded-xl p-4 text-center cursor-pointer transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="h-6 w-6 mx-auto text-stone-400 mb-1" />
                <p className="text-[10px] font-bold text-stone-850 dark:text-stone-300">
                  {photoFile ? photoFile.name : "Click to select snapshot image"}
                </p>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting || !selectedRoomId || !currentReading || previousReading === ""}
              className="w-full font-black h-11 text-white cursor-pointer bg-red-600 hover:bg-red-700 rounded-xl uppercase tracking-wider text-xs disabled:opacity-50"
            >
              {meterType === "Electricity" ? "Generate Electricity Bill" : "Save Meter Reading"}
            </Button>
          </div>
        </form>

        {/* History Column */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3 select-none">
            <h3 className="text-xs font-black text-stone-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-[18px] w-[18px] text-red-600" /> Readings Log History
            </h3>
            <button
              onClick={() => refetchHistory()}
              className="p-1 text-stone-400 hover:text-red-600 flex items-center gap-1 text-[9px] font-black cursor-pointer uppercase tracking-wider"
            >
              <RefreshCw className="h-3 w-3" /> Refresh
            </button>
          </div>

          {/* History Filters */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-zinc-950/20 border border-slate-200 dark:border-zinc-800 rounded-2xl select-none">
            <div>
              <label className="block text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Hostel Filter</label>
              <select
                value={filterHostelId}
                onChange={(e) => setFilterHostelId(e.target.value)}
                className="w-full h-[34px] px-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-[10px] font-bold text-stone-600 dark:text-stone-300 focus:outline-none cursor-pointer"
              >
                <option value="">All Hostels</option>
                {(hostels ?? []).map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Meter Type</label>
              <select
                value={filterMeterType}
                onChange={(e) => setFilterMeterType(e.target.value)}
                className="w-full h-[34px] px-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-[10px] font-bold text-stone-605 dark:text-stone-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Meters</option>
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
              </select>
            </div>
          </div>

          {loadingHistory ? (
            <div className="space-y-4 animate-pulse select-none">
              <div className="h-20 bg-slate-200 dark:bg-zinc-800 rounded-2xl" />
              <div className="h-20 bg-slate-200 dark:bg-zinc-800 rounded-2xl" />
            </div>
          ) : (readingsHistory ?? []).length > 0 ? (
            <div className="space-y-3">
              {(readingsHistory ?? []).map((item) => {
                const roomInfo = `Room ${item.room_number || "Common"} (${item.building_name || "N/A"})`;
                return (
                  <div
                    key={item.id}
                    className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl flex justify-between items-center shadow-xs"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-stone-850 dark:text-white">{roomInfo}</h4>
                      <p className="text-[9px] text-stone-400 font-semibold mt-0.5 select-none">{item.hostel_name}</p>
                      <div className="flex gap-2 mt-2 select-none">
                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase border ${
                          item.meter_type === "Electricity" ? "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/15" : "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/15"
                        }`}>
                          {item.meter_type}
                        </span>
                        <span className="text-[9px] text-stone-400 font-semibold mt-0.5 tabular-nums">
                          {new Date(item.reading_date || item.created_at).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-2.5">
                      <div>
                        <span className="text-[8px] text-stone-400 uppercase font-black block select-none">Reading units</span>
                        <span className="font-mono font-black text-xs text-stone-850 dark:text-white mt-0.5 block select-all tabular-nums">
                          {item.previous_reading} ➔ {item.current_reading}
                        </span>
                      </div>
                      
                      {item.meter_photo || item.meter_image_url ? (
                        <button
                          type="button"
                          onClick={() => {
                            const photo = item.meter_photo || item.meter_image_url;
                            const url = String(photo || "").startsWith("http") ? photo : `http://localhost:8000${photo}`;
                            setLightboxUrl(url || null);
                          }}
                          className="p-1 bg-red-600/5 hover:bg-red-600/10 text-red-600 border border-red-600/20 rounded-md cursor-pointer transition-colors"
                          title="View Snapshot Proof"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <span className="text-[9px] text-stone-400 italic select-none">No Proof</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-center select-none">
              <FileText className="h-8 w-8 text-stone-300 dark:text-stone-700 mb-2 animate-pulse" />
              <p className="text-xs font-semibold text-stone-400">No meter reading history found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox photo view */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setLightboxUrl(null)} />
          <div className="relative max-w-4xl w-full max-h-[80vh] bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl flex flex-col z-10">
            <div className="flex h-12 items-center justify-between px-4 bg-stone-900 border-b border-stone-800 select-none">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Meter Snapshot Proof</span>
              <button onClick={() => setLightboxUrl(null)} className="p-1.5 text-stone-450 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              <img src={lightboxUrl} alt="Expanded Snapshot" className="max-w-full max-h-[65vh] object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BillReadingPage;
