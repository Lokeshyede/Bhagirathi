import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTenantProfile, useTenantDocumentsList, useUpdateTenantProfileMutation } from "../features/payment/hooks/useTenantDashboard";
import { ChangePassword } from "./auth/ChangePassword";
import { Button } from "@bhagirathi/ui";
import {
  User,
  ShieldAlert,
  FileText,
  Mail,
  Phone,
  Calendar,
  MapPin,
  HeartPulse,
  Briefcase,
  Users,
  AlertTriangle,
  Download,
  KeyRound,
  FileSpreadsheet,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"info" | "security">("info");
  const { data: profile, isLoading: isProfileLoading, isError: isProfileError, refetch } = useTenantProfile();
  const { data: documents, isLoading: isDocsLoading } = useTenantDocumentsList();

  const isLoading = isProfileLoading || isDocsLoading;

  const [isEditing, setIsEditing] = useState(false);
  const updateProfileMutation = useUpdateTenantProfileMutation();

  const [bloodGroup, setBloodGroup] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [occupation, setOccupation] = useState("");
  const [companyCollege, setCompanyCollege] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleEditClick = () => {
    setBloodGroup(profile.blood_group || "");
    setEmergencyContact(profile.emergency_contact || "");
    setGuardianName(profile.guardian_name || "");
    setGuardianPhone(profile.guardian_phone || profile.guardian_mobile || "");
    setOccupation(profile.occupation || "");
    setCompanyCollege(profile.company_college || "");
    setPermanentAddress(profile.permanent_address || "");
    setCurrentAddress(profile.current_address || "");
    setSelectedPhoto(null);
    setPhotoPreview(profile.photo_url || null);
    setIsEditing(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("blood_group", bloodGroup);
      fd.append("emergency_contact", emergencyContact);
      fd.append("guardian_name", guardianName);
      fd.append("guardian_phone", guardianPhone);
      fd.append("occupation", occupation);
      fd.append("company_college", companyCollege);
      fd.append("permanent_address", permanentAddress);
      fd.append("current_address", currentAddress);
      if (selectedPhoto) {
        fd.append("photo", selectedPhoto);
      }
      await updateProfileMutation.mutateAsync(fd);
      setIsEditing(false);
      refetch();
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse select-none max-w-4xl mx-auto">
        <div className="h-10 w-28 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-32 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
        <div className="h-64 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
      </div>
    );
  }

  if (isProfileError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-center shadow-sm select-none max-w-md mx-auto my-12">
        <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-650 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h4 className="font-black text-sm text-stone-900 dark:text-white mb-2 uppercase tracking-wider">Failed to Load Profile</h4>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
          There was an error retrieving your tenant profile details. Please try again.
        </p>
        <Button onClick={() => refetch()} variant="outline" className="font-bold h-10 px-6 cursor-pointer text-stone-700 dark:text-stone-300">
          Retry Request
        </Button>
      </div>
    );
  }

  const formatDocType = (type: string) => {
    return String(type || "").replace("_", " ").toLowerCase();
  };

  const getDocIcon = (type: string) => {
    switch (String(type || "").toUpperCase()) {
      case "AGREEMENT":
        return FileSpreadsheet;
      case "PHOTO":
        return User;
      case "AADHAAR_FRONT":
      case "AADHAAR_BACK":
      default:
        return FileText;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto pb-12"
    >
      {/* Title & Tabs */}
      <div className="flex flex-col gap-5 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4.5 w-4.5 text-stone-700 dark:text-stone-300" />
          </button>
          <div>
            <h1 className="text-lg font-black text-stone-900 dark:text-white uppercase tracking-wider leading-tight">My Profile</h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-normal font-semibold">
              Manage your personal data, emergency contacts, documents, and credentials.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-zinc-900/50 border border-slate-200/60 dark:border-zinc-800 rounded-2xl w-full max-w-md">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeTab === "info"
                ? "bg-red-600 text-white shadow-sm"
                : "text-stone-605 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile details</span>
          </button>
          
          <button
            onClick={() => setActiveTab("security")}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeTab === "security"
                ? "bg-red-600 text-white shadow-sm"
                : "text-stone-605 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            <KeyRound className="h-4 w-4" />
            <span>Portal Security</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "security" ? (
          <motion.div
            key="security"
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm max-w-2xl mx-auto"
          >
            <ChangePassword />
          </motion.div>
        ) : (
          <motion.div
            key="info"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            className="space-y-6"
          >
            {/* 1. Main Info Form */}
            <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-6">
              {/* Header info */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-5 select-none">
                <div className="flex items-center gap-4">
                  {isEditing ? (
                    <div className="relative group shrink-0">
                      <div className="h-14 w-14 rounded-full border border-red-600/20 overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-zinc-850">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-black text-red-600 uppercase">{(profile?.full_name || "Tenant").charAt(0)}</span>
                        )}
                      </div>
                      <label className="absolute inset-0 bg-black/45 text-white text-[8px] font-black uppercase flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                        Upload
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                      </label>
                    </div>
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/35 overflow-hidden flex items-center justify-center font-black text-xl shrink-0 uppercase text-red-650">
                      {profile.photo_url ? (
                        <img src={profile.photo_url} alt="Profile Photo" className="w-full h-full object-cover" />
                      ) : (
                        (profile?.full_name || "Tenant").charAt(0)
                      )}
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-black text-stone-850 dark:text-white leading-tight">{profile?.full_name || "Tenant"}</h3>
                    <p className="text-[9.5px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider mt-1.5">
                      {/* ISSUE-001 fix: tenant_id is now alias for id in backend TenantResponse */}
                      Resident ID: <span className="select-all">{profile.tenant_id || profile.id}</span> | Status:{" "}
                      <span className="text-green-700 dark:text-green-400 font-black">{profile.status}</span>
                    </p>
                  </div>
                </div>

                {!isEditing && (
                  <Button type="button" onClick={handleEditClick} className="btn-primary-tenant h-9 px-4 font-black text-xs uppercase tracking-wider cursor-pointer rounded-xl">
                    Edit Profile
                  </Button>
                )}
              </div>

              {/* Profile Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-xs">
                <div className="flex gap-2.5">
                  <Mail className="h-4.5 w-4.5 text-stone-400 dark:text-stone-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block select-none">Email Address</span>
                    <span className="font-semibold text-stone-800 dark:text-gray-300 mt-1 block select-all text-wrap-safe">{profile.email}</span>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <Phone className="h-4.5 w-4.5 text-stone-400 dark:text-stone-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block select-none">Mobile Number</span>
                    <span className="font-semibold text-stone-800 dark:text-gray-300 mt-1 block select-all">{profile.phone || profile.mobile}</span>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <Calendar className="h-4.5 w-4.5 text-stone-400 dark:text-stone-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block select-none">DOB &amp; Gender</span>
                    <span className="font-semibold text-stone-800 dark:text-gray-300 mt-1 block capitalize select-all">
                      {profile.dob ? new Date(profile.dob).toLocaleDateString("en-IN") : "N/A"} | {String(profile.gender || "UNKNOWN").toLowerCase()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <HeartPulse className="h-4.5 w-4.5 text-stone-400 dark:text-stone-500 shrink-0 mt-0.5" />
                  <div className="w-full">
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block select-none">Blood Group</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full h-10 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-xs font-semibold text-stone-850 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-650 transition-all font-bold mt-1.5"
                        placeholder="e.g. O+"
                      />
                    ) : (
                      <span className="font-semibold text-stone-800 dark:text-gray-300 mt-1 block uppercase select-all">{profile.blood_group || "Not Configured"}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <Briefcase className="h-4.5 w-4.5 text-stone-400 dark:text-stone-500 shrink-0 mt-0.5" />
                  <div className="w-full">
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block select-none">Occupation details</span>
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
                        <input
                          type="text"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          className="h-10 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-xs font-semibold text-stone-850 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-650 transition-all flex-1"
                          placeholder="Occupation"
                        />
                        <input
                          type="text"
                          value={companyCollege}
                          onChange={(e) => setCompanyCollege(e.target.value)}
                          className="h-10 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-xs font-semibold text-stone-850 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-650 transition-all flex-1"
                          placeholder="Company/College"
                        />
                      </div>
                    ) : (
                      <span className="font-semibold text-stone-800 dark:text-gray-300 mt-1 block select-all text-wrap-safe">
                        {profile.occupation} {profile.company_college ? `(${profile.company_college})` : ""}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <Users className="h-4.5 w-4.5 text-stone-400 dark:text-stone-500 shrink-0 mt-0.5" />
                  <div className="w-full">
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block select-none">Guardian Context</span>
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
                        <input
                          type="text"
                          value={guardianName}
                          onChange={(e) => setGuardianName(e.target.value)}
                          className="h-10 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-xs font-semibold text-stone-850 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-650 transition-all flex-1"
                          placeholder="Guardian Name"
                        />
                        <input
                          type="text"
                          value={guardianPhone}
                          onChange={(e) => setGuardianPhone(e.target.value)}
                          className="h-10 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-xs font-semibold text-stone-850 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-650 transition-all flex-1"
                          placeholder="Guardian Phone"
                        />
                      </div>
                    ) : (
                      <span className="font-semibold text-stone-800 dark:text-gray-300 mt-1 block select-all text-wrap-safe">
                        {profile.guardian_name} ({profile.guardian_phone || profile.guardian_mobile || "N/A"})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <ShieldAlert className="h-4.5 w-4.5 text-stone-400 dark:text-stone-500 shrink-0 mt-0.5" />
                  <div className="w-full">
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block select-none">Emergency Contact</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        className="w-full h-10 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-xs font-semibold text-stone-850 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-650 transition-all mt-1.5"
                        placeholder="Emergency Contact Phone"
                      />
                    ) : (
                      <span className="font-semibold text-stone-800 dark:text-gray-300 mt-1 block select-all">{profile.emergency_contact || "N/A"}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <Calendar className="h-4.5 w-4.5 text-stone-400 dark:text-stone-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block select-none">Joining Date</span>
                    <span className="font-semibold text-stone-800 dark:text-gray-300 mt-1 block select-all tabular-nums">
                      {profile.joining_date ? new Date(profile.joining_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address rows */}
              <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-5 space-y-4 text-xs">
                <div className="flex gap-2.5">
                  <MapPin className="h-4.5 w-4.5 text-stone-400 dark:text-stone-500 shrink-0 mt-0.5" />
                  <div className="w-full">
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block select-none">Permanent Address</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={permanentAddress}
                        onChange={(e) => setPermanentAddress(e.target.value)}
                        className="w-full h-10 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-xs font-semibold text-stone-850 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-650 transition-all mt-1.5"
                        placeholder="Permanent Address"
                      />
                    ) : (
                      <p className="text-stone-605 dark:text-stone-300 font-semibold leading-relaxed mt-1 select-all text-wrap-safe">{profile.permanent_address}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <MapPin className="h-4.5 w-4.5 text-stone-400 dark:text-stone-500 shrink-0 mt-0.5" />
                  <div className="w-full">
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block select-none">Current Address</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentAddress}
                        onChange={(e) => setCurrentAddress(e.target.value)}
                        className="w-full h-10 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-955 text-xs font-semibold text-stone-850 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-650 transition-all mt-1.5"
                        placeholder="Current Address"
                      />
                    ) : (
                      <p className="text-stone-605 dark:text-stone-300 font-semibold leading-relaxed mt-1 select-all text-wrap-safe">{profile.current_address || "N/A"}</p>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-4 flex gap-3 select-none justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="font-black text-xs h-10 px-5 cursor-pointer rounded-xl border-slate-200 dark:border-zinc-800 text-stone-700 dark:text-stone-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={updateProfileMutation.isPending}
                    className="btn-primary-tenant font-black text-xs h-10 px-5 cursor-pointer rounded-xl text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </form>

            {/* 2. Identity Documents */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 mb-1 select-none">
                <h4 className="font-black text-xs text-stone-850 dark:text-white uppercase tracking-wider">
                  KYC identity documents
                </h4>
              </div>

              {documents && (documents ?? []).length > 0 ? (
                <div className="space-y-3">
                  {(documents ?? []).map((doc) => {
                    const DocIcon = getDocIcon(doc.document_type);
                    const fullUrl = String(doc.file_path || "").startsWith("http")
                      ? doc.file_path
                      : `http://localhost:8000${doc.file_path}`;

                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-950/20 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 select-none">
                          <span className="h-8.5 w-8.5 rounded-xl bg-red-50 dark:bg-red-955/20 text-red-655 flex items-center justify-center shrink-0">
                            <DocIcon className="h-4.5 w-4.5" />
                          </span>
                          <div className="min-w-0">
                            <span className="font-black text-xs text-stone-800 dark:text-white uppercase block tracking-wider">
                              {formatDocType(doc.document_type)}
                            </span>
                            <span className="text-[9.5px] text-stone-400 dark:text-stone-500 font-bold block truncate mt-0.5 max-w-[200px]">
                              {String(doc.file_path || "").split("/").pop()}
                            </span>
                          </div>
                        </div>

                        <a
                          href={fullUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-850 text-stone-500 hover:text-red-650 rounded-xl transition shrink-0 cursor-pointer"
                          aria-label="Download Document"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-stone-400 dark:text-stone-500 bg-slate-50 dark:bg-zinc-950/20 border border-dashed border-slate-250 dark:border-zinc-800 rounded-2xl p-4 select-none">
                  <FileText className="h-7 w-7 text-stone-300 dark:text-stone-700 mx-auto mb-2" />
                  <span className="font-semibold">No documents verified yet.</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfilePage;
