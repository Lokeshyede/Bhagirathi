import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { floorSchema, FloorInput } from "@bhagirathi/validation";
import { Modal, Button, Input } from "@bhagirathi/ui";
import { useHostels, useBuildings, useBuildingSummary } from "../hooks/api/useHostel";

interface FloorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FloorInput) => void;
  buildingId?: string;
  hostelId?: string;
  initialData?: any;
  isLoading?: boolean;
}

export const FloorForm: React.FC<FloorFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  buildingId = "",
  hostelId = "",
  initialData,
  isLoading,
}) => {
  const [selectedHostelId, setSelectedHostelId] = useState<string>(hostelId);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(
    initialData?.building_id || buildingId || ""
  );

  const { data: hostels, isLoading: isLoadingHostels } = useHostels();
  const { data: buildings, isLoading: isLoadingBuildings } = useBuildings(selectedHostelId || null);

  // If initial building is passed but no hostelId, resolve parent building summary
  const targetBuildingId = initialData?.building_id || buildingId;
  const { data: buildingSummary } = useBuildingSummary(targetBuildingId || null);

  useEffect(() => {
    if (buildingSummary && !selectedHostelId) {
      setSelectedHostelId(buildingSummary.hostel_id);
    }
  }, [buildingSummary, selectedHostelId]);

  useEffect(() => {
    if (hostels && hostels.length > 0 && !selectedHostelId) {
      setSelectedHostelId(hostels[0].id);
    }
  }, [hostels, selectedHostelId]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FloorInput>({
    resolver: zodResolver(floorSchema),
    defaultValues: {
      building_id: selectedBuildingId,
      floor_number: initialData?.floor_number !== undefined ? initialData.floor_number : 1,
      name: initialData?.name || "",
    },
  });

  useEffect(() => {
    if (selectedBuildingId) {
      setValue("building_id", selectedBuildingId, { shouldValidate: true });
    }
  }, [selectedBuildingId, setValue]);

  const handleHostelChange = (newHostelId: string) => {
    setSelectedHostelId(newHostelId);
    setSelectedBuildingId("");
    setValue("building_id", "", { shouldValidate: true });
  };

  const handleBuildingChange = (newBldId: string) => {
    setSelectedBuildingId(newBldId);
    setValue("building_id", newBldId, { shouldValidate: true });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Floor" : "Add Floor"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* PG / Hostel Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            PG / Hostel <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedHostelId || ""}
            onChange={(e) => handleHostelChange(e.target.value)}
            disabled={isLoadingHostels}
            className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-950 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
          >
            <option value="">-- Choose PG / Hostel --</option>
            {hostels?.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.type})
              </option>
            ))}
          </select>
        </div>

        {/* Building Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Building <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedBuildingId || ""}
            onChange={(e) => handleBuildingChange(e.target.value)}
            disabled={!selectedHostelId || isLoadingBuildings}
            className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-950 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer disabled:opacity-50"
          >
            <option value="">-- Choose Building --</option>
            {buildings?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} {b.code ? `(${b.code})` : ""}
              </option>
            ))}
          </select>
          {errors.building_id?.message && (
            <p className="text-[11px] text-red-500 mt-0.5">{errors.building_id.message}</p>
          )}
        </div>

        <Input
          label="Floor Number"
          type="number"
          placeholder="e.g. 1, 2, 3"
          error={errors.floor_number?.message}
          {...register("floor_number")}
        />

        <Input
          label="Floor Name"
          type="text"
          placeholder="e.g. Ground Floor, First Floor, Floor 1"
          error={errors.name?.message}
          {...register("name")}
        />

        <div className="flex gap-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 cursor-pointer font-semibold"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 font-semibold cursor-pointer"
            isLoading={isLoading}
          >
            {initialData ? "Save Changes" : "Create Floor"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FloorForm;
