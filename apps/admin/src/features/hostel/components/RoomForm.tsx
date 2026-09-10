import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roomSchema, RoomInput } from "@bhagirathi/validation";
import { Modal, Button, Input } from "@bhagirathi/ui";
import {
  useHostels,
  useBuildings,
  useFloors,
  useFloorSummary,
  useBuildingSummary
} from "../hooks/api/useHostel";

interface RoomFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoomInput) => void;
  floorId: string;
  initialData?: any;
  isLoading?: boolean;
}

export const RoomForm: React.FC<RoomFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  floorId,
  initialData,
  isLoading
}) => {
  const [selectedHostelId, setSelectedHostelId] = React.useState<string>("");
  const [selectedBuildingId, setSelectedBuildingId] = React.useState<string>("");
  const [selectedFloorId, setSelectedFloorId] = React.useState<string>("");

  // Map initial occupancy helper room_type based on capacity
  let initialOccupancyType = "DOUBLE_SHARE";
  if (initialData?.capacity === 1) initialOccupancyType = "SINGLE";
  else if (initialData?.capacity === 2) initialOccupancyType = "DOUBLE_SHARE";
  else if (initialData?.capacity === 3) initialOccupancyType = "TRIPLE_SHARE";
  else if (initialData?.capacity === 4) initialOccupancyType = "FOUR_SHARE";

  // Parse amenities JSON array back to comma-separated list
  let initialAmenities = "";
  if (initialData?.amenities) {
    try {
      const parsed = JSON.parse(initialData.amenities);
      if (Array.isArray(parsed)) {
        initialAmenities = parsed.join(", ");
      } else {
        initialAmenities = initialData.amenities;
      }
    } catch (e) {
      initialAmenities = initialData.amenities;
    }
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoomInput>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      floor_id: floorId || initialData?.floor_id || "",
      room_number: initialData?.room_number || "",
      room_rent: initialData?.room_rent || 0,
      room_type: initialOccupancyType as any,
      capacity: initialData?.capacity !== undefined ? initialData.capacity : 2,
      status: initialData?.status || "AVAILABLE",
      billing_cycle: initialData?.billing_cycle || "MONTHLY",
      rent_split_type: initialData?.rent_split_type || "EQUAL",
      room_category: initialData?.room_type || "NON_AC",
      amenities: initialAmenities,
    },
  });

  // Queries for hierarchy selection
  const { data: hostels, isLoading: isLoadingHostels } = useHostels();
  const { data: buildings, isLoading: isLoadingBuildings } = useBuildings(selectedHostelId || null);
  const { data: floors, isLoading: isLoadingFloors } = useFloors(selectedBuildingId || null);

  // Summaries to resolve parent hierarchy if floorId or initialData is provided
  const targetFloorId = floorId || initialData?.floor_id;
  const { data: floorSummary } = useFloorSummary(targetFloorId || null);
  const { data: buildingSummary } = useBuildingSummary(floorSummary?.building_id || null);

  // Pre-populate selections based on floor context if available
  React.useEffect(() => {
    if (floorSummary && buildingSummary) {
      setSelectedHostelId(buildingSummary.hostel_id);
      setSelectedBuildingId(floorSummary.building_id);
      setSelectedFloorId(floorSummary.floor_id);
    } else if (floorId) {
      setSelectedFloorId(floorId);
    }
  }, [floorSummary, buildingSummary, floorId]);

  // Sync selectedFloorId to the registered floor_id value in form
  React.useEffect(() => {
    if (selectedFloorId) {
      setValue("floor_id", selectedFloorId);
    }
  }, [selectedFloorId, setValue]);

  const selectedType = watch("room_type");

  // Sync capacity defaults based on room type selections
  React.useEffect(() => {
    if (!initialData) {
      if (selectedType === "SINGLE") setValue("capacity", 1);
      else if (selectedType === "DOUBLE_SHARE") setValue("capacity", 2);
      else if (selectedType === "TRIPLE_SHARE") setValue("capacity", 3);
      else if (selectedType === "FOUR_SHARE") setValue("capacity", 4);
    }
  }, [selectedType, setValue, initialData]);

  const handleFormSubmit = (data: RoomInput) => {
    let amenitiesVal = "";
    if (data.amenities) {
      const arr = data.amenities.split(",").map(item => item.trim()).filter(item => item.length > 0);
      amenitiesVal = JSON.stringify(arr);
    }
    onSubmit({
      ...data,
      amenities: amenitiesVal
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Room" : "Add Room"}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 admin-modal-scroll">
        <input type="hidden" {...register("floor_id")} />

        {/* Location hierarchy — always 1 col */}
        <div className="pg-form-section">
          <div className="pg-form-section-label">
            <span>📍</span>
            <span>Location</span>
          </div>
          <div className="admin-form-grid">
            {/* 1. Select Hostel */}
            <div className="flex flex-col gap-1">
              <label className="admin-label">Select Hostel</label>
              <select
                value={selectedHostelId}
                onChange={(e) => {
                  setSelectedHostelId(e.target.value);
                  setSelectedBuildingId("");
                  setSelectedFloorId("");
                  setValue("floor_id", "");
                }}
                className="admin-select"
                disabled={isLoadingHostels}
              >
                <option value="">-- Select Hostel --</option>
                {hostels?.map((h: any) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            {/* 2. Select Building */}
            <div className="flex flex-col gap-1">
              <label className="admin-label">Select Building</label>
              <select
                value={selectedBuildingId}
                onChange={(e) => {
                  setSelectedBuildingId(e.target.value);
                  setSelectedFloorId("");
                  setValue("floor_id", "");
                }}
                className="admin-select"
                disabled={!selectedHostelId || isLoadingBuildings}
              >
                <option value="">-- Select Building --</option>
                {buildings?.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* 3. Select Floor */}
            <div className="flex flex-col gap-1">
              <label className="admin-label">Select Floor</label>
              <select
                value={selectedFloorId}
                onChange={(e) => {
                  setSelectedFloorId(e.target.value);
                  setValue("floor_id", e.target.value);
                }}
                className="admin-select"
                disabled={!selectedBuildingId || isLoadingFloors}
              >
                <option value="">-- Select Floor --</option>
                {floors?.map((f: any) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              {errors.floor_id?.message && (
                <p className="text-[11px] text-red-500 mt-0.5">{errors.floor_id.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Room Details — 2-col grid on desktop */}
        <div className="pg-form-section">
          <div className="pg-form-section-label">
            <span>🚪</span>
            <span>Room Details</span>
          </div>
          <div className="admin-form-grid">
            <Input
              label="Room Number"
              type="text"
              placeholder="e.g. 101"
              error={errors.room_number?.message}
              {...register("room_number")}
            />

            <Input
              label="Room Rent (₹/month)"
              type="number"
              step="0.01"
              placeholder="e.g. 8000"
              error={errors.room_rent?.message}
              {...register("room_rent")}
            />

            <div className="flex flex-col gap-1">
              <label className="admin-label">Room Type</label>
              <select {...register("room_type")} className="admin-select">
                <option value="SINGLE">Single Occupancy</option>
                <option value="DOUBLE_SHARE">Double Sharing</option>
                <option value="TRIPLE_SHARE">Triple Sharing</option>
                <option value="FOUR_SHARE">Four Sharing</option>
              </select>
              {errors.room_type?.message && (
                <p className="text-[11px] text-red-500 mt-0.5">{errors.room_type.message}</p>
              )}
            </div>

            <Input
              label="Capacity (Beds)"
              type="number"
              placeholder="e.g. 2"
              error={errors.capacity?.message}
              {...register("capacity")}
            />

            <div className="flex flex-col gap-1">
              <label className="admin-label">Billing Cycle</label>
              <select {...register("billing_cycle")} className="admin-select">
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly</option>
              </select>
              {errors.billing_cycle?.message && (
                <p className="text-[11px] text-red-500 mt-0.5">{errors.billing_cycle.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="admin-label">Rent Split Type</label>
              <select {...register("rent_split_type")} className="admin-select">
                <option value="EQUAL">Equal Split</option>
                <option value="CUSTOM">Custom Split</option>
              </select>
              {errors.rent_split_type?.message && (
                <p className="text-[11px] text-red-500 mt-0.5">{errors.rent_split_type.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="admin-label">Room Category (AC/Non-AC)</label>
              <select {...register("room_category")} className="admin-select">
                <option value="NON_AC">Non-AC Room</option>
                <option value="AC">AC Room</option>
                <option value="DORMITORY">Dormitory</option>
              </select>
              {errors.room_category?.message && (
                <p className="text-[11px] text-red-500 mt-0.5">{errors.room_category.message}</p>
              )}
            </div>

            <Input
              label="Amenities (Comma separated)"
              type="text"
              placeholder="e.g. Wi-Fi, AC Cooling, Hot Geyser"
              error={errors.amenities?.message}
              {...register("amenities")}
            />

            <div className="flex flex-col gap-1">
              <label className="admin-label">Room Status</label>
              <select {...register("status")} className="admin-select">
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Under Maintenance</option>
              </select>
              {errors.status?.message && (
                <p className="text-[11px] text-red-500 mt-0.5">{errors.status.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
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
            {initialData ? "Save Changes" : "Create Room"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default RoomForm;
