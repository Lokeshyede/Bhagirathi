# UNUSED CODE / DEAD FILE AUDIT - READ ONLY

This report identifies code files in the Bhagirathi Hostel & PG Management System that are unused, redundant, obsolete, or safe candidates for removal.

**Total Files Scanned:** 614

## 1. Definitely Used (376)
| File | Evidence / References |
|---|---|
| `apps/backend/cleanup.py` | test_admin_2_tenant_management.py, e2e_receipt_notification_audit.py, e2e_electricity_audit_p2.py... |
| `apps/backend/get_tenant.py` | test_admin_2_tenant_management.py, tenant_service.py, payment_submission_service.py, reports_repo... |
| `apps/backend/app/main.py` | test_admin_2_tenant_management.py, security_event_service.py, DashboardLayout.tsx, MaintenanceSta... |
| `apps/backend/app/api/allocations.py` | hostel.py, e2e_electricity_audit_p3.py, analytics_service.py, conftest.py, phase8_advance_rent_re... |
| `apps/backend/app/api/auth.py` | DashboardLayout.tsx, phase8_advance_rent_reminder_test.py, ForceChangePassword.tsx, ChangePasswor... |
| `apps/backend/app/api/beds.py` | hostel.py, test_admin_2_tenant_management.py, RoomCard.tsx, SidebarStats.tsx, TransferBedDialog.t... |
| `apps/backend/app/api/billing.py` | DashboardLayout.tsx, analytics_service.py, e2e_electricity_audit_p1.py, phase8_advance_rent_remin... |
| `apps/backend/app/api/buildings.py` | hostel.py, SidebarStats.tsx, MaintenanceCard.tsx, MaintenanceTable.tsx, DashboardLayout.tsx, Main... |
| `apps/backend/app/api/complaints.py` | dashboard.py, ComplaintSummary.tsx, DashboardLayout.tsx, index.tsx, audit_tenant_api3.py, tenant.... |
| `apps/backend/app/api/contracts.py` | hostel.py, test_admin_2_tenant_management.py, DashboardLayout.tsx, conftest.py, phase8_advance_re... |
| `apps/backend/app/api/dashboard.py` | test_admin_2_tenant_management.py, security_event_service.py, DashboardLayout.tsx, analytics_serv... |
| `apps/backend/app/api/dependencies.py` | dashboard.py, notices.py, hostels.py, test_auth.py, bank_statements.py, auth.py, receipts.py, rep... |
| `apps/backend/app/api/electricity.py` | DashboardLayout.tsx, e2e_electricity_audit_p1.py, e2e_electricity_cash_audit.py, electricity.py, ... |
| `apps/backend/app/api/floors.py` | hostel.py, SidebarStats.tsx, DashboardLayout.tsx, conftest.py, test_payment_foundation.py, Buildi... |
| `apps/backend/app/api/health.py` | main.py, check_health.py, database.py, MaintenanceManagementPage.tsx, phase6_regression.py, index.ts |
| `apps/backend/app/api/hostels.py` | hostel.py, MaintenanceStaffForm.tsx, conftest.py, test_payment_foundation.py, tenant.py, useBillR... |
| `apps/backend/app/api/maintenance.py` | auth.ts, MaintenanceTable.tsx, notices.py, DashboardLayout.tsx, MaintenanceStaffForm.tsx, index.t... |
| `apps/backend/app/api/notices.py` | dashboard.py, DashboardLayout.tsx, analytics_service.py, audit_tenant_api3.py, index.tsx, tenant.... |
| `apps/backend/app/api/notifications.py` | e2e_electricity_audit_p3.py, index.tsx, phase8_advance_rent_reminder_test.py, NotificationCenterP... |
| `apps/backend/app/api/payments.py` | bulk_verification_service.py, security_event_service.py, DashboardLayout.tsx, analytics_service.p... |
| `apps/backend/app/api/receipts.py` | e2e_electricity_audit_p3.py, DashboardLayout.tsx, e2e_electricity_cash_audit.py, UpcomingTasks.ts... |
| `apps/backend/app/api/reconciliation.py` | statement_validation_service.py, bulk_verification_service.py, security_repository.py, DashboardL... |
| `apps/backend/app/api/rents.py` | useRentCollection.ts, DashboardLayout.tsx, analytics_service.py, phase8_advance_rent_reminder_tes... |
| `apps/backend/app/api/rent_collection.py` | analytics_service.py, DashboardCharts.tsx, TenantPreviewDrawer.tsx, RentCollectionAlert.tsx, test... |
| `apps/backend/app/api/reports.py` | export_service.py, useReports.ts, main.py, DashboardLayout.tsx, analytics_service.py, Electricity... |
| `apps/backend/app/api/rooms.py` | f1a2b3c4d5e6_add_room_type_and_amenities_to_rooms.py, hostel.py, SidebarStats.tsx, DashboardLayou... |
| `apps/backend/app/api/security.py` | test_admin_2_tenant_management.py, security_event_service.py, UserManagementPage.tsx, DashboardLa... |
| `apps/backend/app/api/settings.py` | DashboardLayout.tsx, index.tsx, __init__.py, auth_service.py, receipt_number_service.py, auth.py,... |
| `apps/backend/app/api/tenant.py` | f1a2b3c4d5e6_add_room_type_and_amenities_to_rooms.py, bulk_verification_service.py, test_admin_2_... |
| `apps/backend/app/api/tenants.py` | test_admin_2_tenant_management.py, DashboardLayout.tsx, phase8_advance_rent_reminder_test.py, ten... |
| `apps/backend/app/api/transfers.py` | index.ts, allocations.py, main.py, AllocationTimeline.tsx |
| `apps/backend/app/api/verification.py` | test_admin_2_tenant_management.py, bulk_verification_service.py, DashboardLayout.tsx, e2e_electri... |
| `apps/backend/app/core/config.py` | f1a2b3c4d5e6_add_room_type_and_amenities_to_rooms.py, receipt.py, index.tsx, final_verification.p... |
| `apps/backend/app/core/database.py` | test_admin_2_tenant_management.py, bulk_verification_service.py, e2e_electricity_audit_p1.py, fin... |
| `apps/backend/app/core/exceptions.py` | dependencies.py, main.py, service.py, phase7_transaction_fix_test.py, test_500.py, e2e_electricit... |
| `apps/backend/app/core/middleware.py` | main.py |
| `apps/backend/app/core/models.py` | statement_validation_service.py, bulk_verification_service.py, test_admin_2_tenant_management.py,... |
| `apps/backend/app/core/repository.py` | test_admin_2_tenant_management.py, bulk_verification_service.py, service.py, analytics_service.py... |
| `apps/backend/app/core/security.py` | test_admin_2_tenant_management.py, security_event_service.py, UserManagementPage.tsx, DashboardLa... |
| `apps/backend/app/core/service.py` | test_admin_2_tenant_management.py, bulk_verification_service.py, statement_parser_service.py, fin... |
| `apps/backend/app/database/database.py` | test_admin_2_tenant_management.py, bulk_verification_service.py, e2e_electricity_audit_p1.py, fin... |
| `apps/backend/app/database/session.py` | test_admin_2_tenant_management.py, bulk_verification_service.py, e2e_electricity_audit_p1.py, fin... |
| `apps/backend/app/migrations/env.py` | main.py, phase8_advance_rent_reminder_test.py, test_infra.py, scheduler.py, create_admin.py, phas... |
| `apps/backend/app/models/allocation.py` | hostel.py, test_admin_2_tenant_management.py, e2e_electricity_audit_p3.py, analytics_service.py, ... |
| `apps/backend/app/models/base.py` | test_admin_2_tenant_management.py, bulk_verification_service.py, SidebarStats.tsx, e2e_electricit... |
| `apps/backend/app/models/complaint.py` | ComplaintSummary.tsx, DashboardLayout.tsx, analytics_service.py, index.tsx, StatusDialog.tsx, aut... |
| `apps/backend/app/models/contract.py` | test_admin_2_tenant_management.py, DashboardLayout.tsx, e2e_electricity_audit_p1.py, final_verifi... |
| `apps/backend/app/models/document.py` | test_admin_2_tenant_management.py, index.tsx, __init__.py, tenant.py, tenant.py, useTenantDashboa... |
| `apps/backend/app/models/electricity.py` | DashboardLayout.tsx, e2e_electricity_audit_p1.py, e2e_electricity_cash_audit.py, hostel.py, RentD... |
| `apps/backend/app/models/enums.py` | test_admin_2_tenant_management.py, bulk_verification_service.py, analytics_service.py, e2e_electr... |
| `apps/backend/app/models/hostel.py` | test_admin_2_tenant_management.py, DashboardLayout.tsx, analytics_service.py, e2e_electricity_aud... |
| `apps/backend/app/models/maintenance.py` | auth.ts, MaintenanceTable.tsx, notices.py, DashboardLayout.tsx, MaintenanceStaffForm.tsx, index.t... |
| `apps/backend/app/models/notice.py` | dashboard.py, notices.py, DashboardLayout.tsx, analytics_service.py, audit_tenant_api3.py, Dashbo... |
| `apps/backend/app/models/notification.py` | e2e_electricity_audit_p3.py, DashboardLayout.tsx, analytics_service.py, final_verification.py, ph... |
| `apps/backend/app/models/payment.py` | test_admin_2_tenant_management.py, bulk_verification_service.py, security_event_service.py, Dashb... |
| `apps/backend/app/models/receipt.py` | receipt.py, e2e_electricity_audit_p3.py, DashboardLayout.tsx, final_verification.py, __init__.py,... |
| `apps/backend/app/models/reconciliation.py` | statement_validation_service.py, bulk_verification_service.py, security_repository.py, DashboardL... |
| `apps/backend/app/models/rent.py` | f1a2b3c4d5e6_add_room_type_and_amenities_to_rooms.py, test_admin_2_tenant_management.py, Dashboar... |
| `apps/backend/app/models/report.py` | bulk_verification_service.py, e2e_electricity_audit_p3.py, DashboardLayout.tsx, analytics_service... |
| `apps/backend/app/models/role.py` | test_admin_2_tenant_management.py, UserManagementPage.tsx, DashboardLayout.tsx, e2e_electricity_a... |
| `apps/backend/app/models/security.py` | test_admin_2_tenant_management.py, security_event_service.py, UserManagementPage.tsx, DashboardLa... |
| `apps/backend/app/models/settings.py` | DashboardLayout.tsx, index.tsx, __init__.py, auth_service.py, receipt_number_service.py, auth.py,... |
| `apps/backend/app/models/tenant.py` | f1a2b3c4d5e6_add_room_type_and_amenities_to_rooms.py, bulk_verification_service.py, test_admin_2_... |
| `apps/backend/app/models/user.py` | test_admin_2_tenant_management.py, bulk_verification_service.py, UserManagementPage.tsx, Dashboar... |
| `apps/backend/app/models/__init__.py` | init file |
| `apps/backend/app/repositories/admin_payment_repository.py` | admin_payment_service.py, test_admin_payments.py, bank_statement_repository.py, admin_payments.py |
| `apps/backend/app/repositories/auth_repository.py` | tenant_service.py, maintenance.py, auth_service.py, tenants.py, test_phase18.py, auth.py, hostel_... |
| `apps/backend/app/repositories/bank_statement_repository.py` | bank_statements.py, test_bank_statements.py |
| `apps/backend/app/repositories/billing_repository.py` | payment_submission_service.py, billing.py, test_billing_engine.py, billing_engine.py |
| `apps/backend/app/repositories/hostel_repository.py` | test_admin_2_tenant_management.py, beds.py, tenant_service.py, rooms.py, test_hostel_infra.py, ho... |
| `apps/backend/app/repositories/notification_repository.py` | rent_reminder_service.py, phase8_advance_rent_reminder_test.py, notifications.py, notification_se... |
| `apps/backend/app/repositories/receipt_repository.py` | e2e_receipt_notification_audit.py, receipt_service.py, phase7_transaction_fix_test.py, payment_co... |
| `apps/backend/app/repositories/reconciliation_repository.py` | reconciliation_service.py, reconciliation.py |
| `apps/backend/app/repositories/reports_repository.py` | analytics_service.py, reports.py |
| `apps/backend/app/repositories/security_repository.py` | security.py |
| `apps/backend/app/repositories/tenant_repository.py` | test_admin_2_tenant_management.py, test_tenant_dashboard.py, tenant_service.py, test_payment_foun... |
| `apps/backend/app/repositories/user_repository.py` | test_admin_2_tenant_management.py, dependencies.py, tenant_service.py, test_hostel_infra.py, test... |
| `apps/backend/app/repositories/verification_repository.py` | verification.py, bulk_verification_service.py |
| `apps/backend/app/schemas/admin_payment.py` | main.py, test_admin_payments.py, payment_submission_service.py, bank_statement_repository.py, pay... |
| `apps/backend/app/schemas/auth.py` | DashboardLayout.tsx, phase8_advance_rent_reminder_test.py, ForceChangePassword.tsx, ChangePasswor... |
| `apps/backend/app/schemas/bank_statement.py` | main.py, reconciliation_repository.py, test_infra.py, reconciliation.py, test_bank_statements.py,... |
| `apps/backend/app/schemas/hostel.py` | test_admin_2_tenant_management.py, DashboardLayout.tsx, analytics_service.py, e2e_electricity_aud... |
| `apps/backend/app/schemas/notification.py` | e2e_electricity_audit_p3.py, DashboardLayout.tsx, analytics_service.py, final_verification.py, ph... |
| `apps/backend/app/schemas/payment.py` | test_admin_2_tenant_management.py, bulk_verification_service.py, security_event_service.py, Dashb... |
| `apps/backend/app/schemas/receipt.py` | e2e_electricity_audit_p3.py, DashboardLayout.tsx, final_verification.py, __init__.py, RentDetails... |
| `apps/backend/app/schemas/reconciliation.py` | statement_validation_service.py, bulk_verification_service.py, security_repository.py, DashboardL... |
| `apps/backend/app/schemas/reports.py` | export_service.py, useReports.ts, main.py, DashboardLayout.tsx, analytics_service.py, Electricity... |
| `apps/backend/app/schemas/security.py` | test_admin_2_tenant_management.py, security_event_service.py, UserManagementPage.tsx, DashboardLa... |
| `apps/backend/app/schemas/tenant.py` | f1a2b3c4d5e6_add_room_type_and_amenities_to_rooms.py, bulk_verification_service.py, test_admin_2_... |
| `apps/backend/app/schemas/verification.py` | test_admin_2_tenant_management.py, bulk_verification_service.py, DashboardLayout.tsx, e2e_electri... |
| `apps/backend/app/services/admin_payment_service.py` | test_admin_payments.py, admin_payments.py |
| `apps/backend/app/services/analytics_service.py` | reports.py |
| `apps/backend/app/services/auth_service.py` | test_phase18.py, test_auth.py, auth.py |
| `apps/backend/app/services/billing_engine.py` | fix_corrupt_rent_ledgers.py, test_billing_engine.py, rent_config_service.py, billing.py, regressi... |
| `apps/backend/app/services/bulk_reject_service.py` | verification.py |
| `apps/backend/app/services/bulk_verification_service.py` | verification.py |
| `apps/backend/app/services/cloudinary.py` | receipt.py, test_admin_2_tenant_management.py, e2e_electricity_audit_p3.py, payment_submission_se... |
| `apps/backend/app/services/confidence_calculator.py` | reconciliation_service.py |
| `apps/backend/app/services/dashboard_service.py` | dashboard.py, test_admin_2_tenant_management.py, test_phase20_rent_lifecycle.py, test_dashboard.p... |
| `apps/backend/app/services/duplicate_detection_service.py` | reconciliation_service.py |
| `apps/backend/app/services/export_service.py` | reports.py |
| `apps/backend/app/services/fraud_detection_service.py` | reconciliation_service.py |
| `apps/backend/app/services/hostel_service.py` | beds.py, test_hostel_infra.py, rooms.py, hostels.py, floors.py, phase10_room_bed_availability_tes... |
| `apps/backend/app/services/manual_review_service.py` | verification.py |
| `apps/backend/app/services/notification_service.py` | e2e_electricity_audit_p3.py, phase7_transaction_fix_test.py, rents.py, payment_completion_service... |
| `apps/backend/app/services/ocr_service.py` | confidence_calculator.py, reconciliation_service.py |
| `apps/backend/app/services/payment_completion_service.py` | bulk_verification_service.py, e2e_electricity_audit_p3.py, final_smoke_test.py, manual_review_ser... |
| `apps/backend/app/services/payment_service.py` | payments.py, test_payment_foundation.py, test_admin_payments.py, admin_payments.py |
| `apps/backend/app/services/payment_submission_service.py` | payments.py, test_tenant_payments.py, electricity.py |
| `apps/backend/app/services/rapidfuzz_service.py` | confidence_calculator.py, reconciliation_service.py |
| `apps/backend/app/services/receipt_number_service.py` | receipt_service.py |
| `apps/backend/app/services/receipt_pdf_service.py` | receipt_service.py |
| `apps/backend/app/services/receipt_service.py` | final_smoke_test.py, phase7_transaction_fix_test.py, rents.py, payment_completion_service.py, rec... |
| `apps/backend/app/services/recommendation_service.py` | reconciliation_service.py |
| `apps/backend/app/services/reconciliation_service.py` | reconciliation.py |
| `apps/backend/app/services/rent_alert_service.py` | rent_collection.py |
| `apps/backend/app/services/rent_config_service.py` | billing_engine.py, test_anchor_date.py, final_verification.py, phase8_advance_rent_reminder_test.... |
| `apps/backend/app/services/rent_reminder_service.py` | phase8_advance_rent_reminder_test.py, scheduler.py |
| `apps/backend/app/services/risk_scoring_service.py` | test_security_fraud.py, security_analysis_service.py |
| `apps/backend/app/services/scheduler.py` | rent_reminder_service.py, main.py, notification_repository.py |
| `apps/backend/app/services/screenshot_hash_service.py` | test_security_fraud.py, security_analysis_service.py |
| `apps/backend/app/services/security_analysis_service.py` | security.py |
| `apps/backend/app/services/security_event_service.py` | security_hold_service.py, security.py, test_security_fraud.py, security_analysis_service.py |
| `apps/backend/app/services/security_hold_service.py` | security.py, test_security_fraud.py, security_analysis_service.py |
| `apps/backend/app/services/security_rule_engine.py` | risk_scoring_service.py, test_security_fraud.py, security_analysis_service.py |
| `apps/backend/app/services/statement_parser_service.py` | bank_statements.py, test_bank_statements.py |
| `apps/backend/app/services/statement_upload_service.py` | bank_statements.py, test_bank_statements.py |
| `apps/backend/app/services/statement_validation_service.py` | bank_statements.py, test_bank_statements.py |
| `apps/backend/app/services/suspicious_user_service.py` | security.py, test_security_fraud.py |
| `apps/backend/app/services/tenant_dashboard_service.py` | test_phase20_rent_lifecycle.py, test_tenant_dashboard.py, tenant.py |
| `apps/backend/app/services/tenant_service.py` | transfers.py, test_admin_2_tenant_management.py, phase9_audit.py, phase10_room_bed_availability_t... |
| `apps/backend/app/services/transaction_extraction_service.py` | bank_statements.py, test_bank_statements.py |
| `apps/backend/app/services/undo_verification_service.py` | verification.py |
| `apps/backend/app/services/verification_service.py` | verification.py, bulk_verification_service.py, bulk_reject_service.py, manual_review_service.py |
| `apps/backend/app/services/parsers/base_parser.py` | __init__.py, csv_parser.py, excel_parser.py, pdf_parser.py, parser_factory.py |
| `apps/backend/app/services/parsers/csv_parser.py` | pdf_parser.py, excel_parser.py, parser_factory.py |
| `apps/backend/app/services/parsers/excel_parser.py` | parser_factory.py |
| `apps/backend/app/services/parsers/parser_factory.py` | __init__.py, statement_upload_service.py, test_bank_statements.py, statement_parser_service.py |
| `apps/backend/app/services/parsers/pdf_parser.py` | parser_factory.py |
| `apps/backend/app/services/parsers/__init__.py` | init file |
| `apps/admin/src/features/complaint/hooks/useComplaint.ts` | useReports.ts, useTenantComplaint.ts, useComplaintStore.ts, MaintenanceComplaintsPage.tsx, Report... |
| `apps/admin/src/features/dashboard/hooks/api/useDashboard.ts` | DashboardPage.tsx, useDashboardStore.ts, HostelManagementPage.tsx |
| `apps/admin/src/features/dashboard/types/index.ts` | init file |
| `apps/admin/src/features/hostel/hooks/api/useHostel.ts` | NoticeForm.tsx, HostelManagementPage.tsx, MaintenanceStaffForm.tsx, useHostelStore.ts, Verificati... |
| `apps/admin/src/features/hostel/types/index.ts` | init file |
| `apps/admin/src/features/maintenance/hooks/api/useMaintenance.ts` | useMaintenanceStore.ts, ProfilePage.tsx, DashboardPage.tsx, MaintenanceManagementPage.tsx, Mainte... |
| `apps/admin/src/features/notice/hooks/api/useNotice.ts` | useReports.ts, ReadStatistics.tsx, NoticeForm.tsx, NoticeSummary.tsx, useNoticeStore.ts, NoticeMa... |
| `apps/admin/src/features/notification/hooks/api/useNotification.ts` | UnreadCounter.tsx, NotificationBell.tsx, useNotificationStore.ts, NotificationDrawer.tsx, Notific... |
| `apps/admin/src/features/notification/store/useNotificationStore.ts` | NotificationBell.tsx, NotificationDrawer.tsx, useNotificationStore.ts, NotificationDrawer.tsx, No... |
| `apps/admin/src/features/payment/hooks/useBankStatement.ts` | StatementUploadDialog.tsx, StatementPreviewPage.tsx, StatementSummaryCards.tsx, TransactionsTable... |
| `apps/admin/src/features/payment/hooks/usePayment.ts` | useReports.ts, usePaymentFoundation.ts, usePaymentStore.ts, useVerification.ts, RiskAnalysisPanel... |
| `apps/admin/src/features/payment/hooks/useReceipt.ts` | ReceiptCard.tsx, ReceiptDetailPage.tsx, ReceiptHistoryPage.tsx |
| `apps/admin/src/features/payment/hooks/useReconciliation.ts` | ManualReviewQueuePage.tsx, ReconciliationDetailPage.tsx, RuleBreakdownTable.tsx, ReconciliationDa... |
| `apps/admin/src/features/payment/hooks/useVerification.ts` | CashVerificationPage.tsx, VerificationQueuePage.tsx, ComparisonPanel.tsx, SmartVerificationDashbo... |
| `apps/admin/src/features/rent/hooks/api/useRent.ts` | useReports.ts, useRentCollection.ts, RentCollectionPage.tsx, CashCollectionModal.tsx, useVerifica... |
| `apps/admin/src/features/rent/types/index.ts` | init file |
| `apps/admin/src/features/rent_collection/hooks/useRentCollection.ts` | RentCollectionPage.tsx, CashCollectionModal.tsx, useVerification.ts, CashVerificationPage.tsx, fi... |
| `apps/admin/src/features/reports/api/reports.ts` | export_service.py, useReports.ts, main.py, DashboardLayout.tsx, analytics_service.py, Electricity... |
| `apps/admin/src/features/reports/hooks/useReports.ts` | ExportDialog.tsx, ReportsPage.tsx, ReportsDashboard.tsx |
| `apps/admin/src/features/reports/store/filters.ts` | useRentCollection.ts, useAdminPayment.ts, usePayment.ts, useBilling.ts, useBillReading.ts, index.... |
| `apps/admin/src/features/reports/types/index.ts` | init file |
| `apps/admin/src/features/security/hooks/useSecurityHooks.ts` | SuspiciousUsersPage.tsx, SecurityRulesPage.tsx, RiskAnalysisPanel.tsx, PaymentSecurityPage.tsx, S... |
| `apps/admin/src/features/settings/hooks/useSettings.ts` | PaymentSettingsForm.tsx, HostelProfileForm.tsx, PreferencesForm.tsx, AdminProfileForm.tsx |
| `apps/admin/src/features/settings/types/index.ts` | init file |
| `apps/admin/src/features/tenant/hooks/api/useAllocation.ts` | BedGrid.tsx, AllocationTimeline.tsx, HostelManagementPage.tsx, TenantManagementPage.tsx, Allocati... |
| `apps/admin/src/features/tenant/hooks/api/useTenant.ts` | useRentCollection.ts, useRent.ts, useBilling.ts, useTenantDashboard.ts, useTenantNotice.ts, Setti... |
| `apps/admin/src/features/tenant/types/index.ts` | init file |
| `apps/admin/src/store/auth.ts` | DashboardLayout.tsx, phase8_advance_rent_reminder_test.py, ForceChangePassword.tsx, ChangePasswor... |
| `apps/admin/src/store/theme.ts` | index.ts, App.tsx, App.tsx, DashboardLayout.tsx, index.ts, index.tsx, index.tsx, PreferencesForm.... |
| `apps/admin/src/store/useToastStore.ts` | CashCollectionModal.tsx, TenantTable.tsx, App.tsx, ElectricityCashModal.tsx |
| `apps/admin/src/App.tsx` | bulk_verification_service.py, e2e_electricity_audit_p3.py, SuspiciousUsersPage.tsx, PayRentPage.t... |
| `apps/admin/src/main.tsx` | test_admin_2_tenant_management.py, security_event_service.py, DashboardLayout.tsx, MaintenanceSta... |
| `apps/admin/src/features/complaint/components/ComplaintCard.tsx` | ComplaintManagementPage.tsx, index.tsx, Card.tsx |
| `apps/admin/src/features/complaint/components/ComplaintTable.tsx` | ComplaintManagementPage.tsx, ComplaintDetailsDrawer.tsx, ComplaintCard.tsx |
| `apps/admin/src/features/complaint/components/FilterPanel.tsx` | NoticeManagementPage.tsx, ComplaintManagementPage.tsx, FilterPanel.tsx, FilterPanel.tsx |
| `apps/admin/src/features/complaint/components/Pagination.tsx` | Pagination.tsx, Pagination.tsx, NotificationCenterPage.tsx, Pagination.tsx, NotificationCenterPag... |
| `apps/admin/src/features/complaint/components/SearchBar.tsx` | SearchBar.tsx, NotificationCenterPage.tsx, NotificationCenterPage.tsx, SearchBar.tsx, SearchBar.t... |
| `apps/admin/src/features/complaint/components/StatisticsCards.tsx` | HostelManagementPage.tsx, TenantManagementPage.tsx, StatisticsCards.tsx, ReportsPage.tsx, Statist... |
| `apps/admin/src/features/complaint/components/Timeline.tsx` | security_event_service.py, reconciliation.py, PaymentDetailsDrawer.tsx, tenant.py, useAdminPaymen... |
| `apps/admin/src/features/dashboard/components/DashboardCards.tsx` | RentManagementPage.tsx, DashboardPage.tsx, RentDashboardCards.tsx |
| `apps/admin/src/features/dashboard/components/DashboardCharts.tsx` | Charts.tsx, index.ts, index.ts, reports.py, DashboardPage.tsx, useDashboard.ts |
| `apps/admin/src/features/dashboard/components/DashboardSummary.tsx` | DashboardPage.tsx, index.ts, useTenantDashboard.ts, DashboardPage.tsx, useDashboard.ts |
| `apps/admin/src/features/dashboard/components/RecentComplaints.tsx` | DashboardPage.tsx, useDashboard.ts, RecentComplaintsTable.tsx |
| `apps/admin/src/features/dashboard/pages/DashboardPage.tsx` | BillingDashboardPage.tsx, index.tsx, DashboardPage.tsx, DashboardPage.tsx, ReconciliationDashboar... |
| `apps/admin/src/features/hostel/components/DeleteDialog.tsx` | Modal.tsx, TenantManagementPage.tsx, HostelManagementPage.tsx, index.tsx, index.tsx, RentManageme... |
| `apps/admin/src/features/hostel/components/RoomCard.tsx` | Card.tsx, index.tsx, index.tsx, HostelManagementPage.tsx |
| `apps/admin/src/features/hostel/components/StatisticsCards.tsx` | HostelManagementPage.tsx, TenantManagementPage.tsx, StatisticsCards.tsx, ReportsPage.tsx, Statist... |
| `apps/admin/src/features/notice/components/FilterPanel.tsx` | NoticeManagementPage.tsx, ComplaintManagementPage.tsx, FilterPanel.tsx, FilterPanel.tsx |
| `apps/admin/src/features/notice/components/NoticeCard.tsx` | NoticeManagementPage.tsx, index.tsx, Card.tsx |
| `apps/admin/src/features/notice/components/NoticeDashboard.tsx` | useNotice.ts, NoticeSummary.tsx, index.ts, NoticeManagementPage.tsx |
| `apps/admin/src/features/notice/components/NoticeTable.tsx` | NoticeManagementPage.tsx, NoticeDetailsDrawer.tsx, NoticeCard.tsx |
| `apps/admin/src/features/notice/components/ReadStatistics.tsx` | useNotice.ts, NoticeDetailsDrawer.tsx, index.ts |
| `apps/admin/src/features/notice/components/SearchBar.tsx` | SearchBar.tsx, SearchBar.tsx, NotificationCenterPage.tsx, NotificationCenterPage.tsx, SearchBar.t... |
| `apps/admin/src/features/notification/components/EmptyState.tsx` | index.tsx, Table.tsx, DashboardEmptyState.tsx, NotificationList.tsx, NotificationList.tsx, index.... |
| `apps/admin/src/features/notification/components/NotificationBadge.tsx` | NotificationCard.tsx, NotificationCard.tsx, NotificationCard.tsx, NotificationBadge.tsx, Notifica... |
| `apps/admin/src/features/notification/components/NotificationBell.tsx` | DashboardLayout.tsx, NotificationBell.tsx, DashboardLayout.tsx, NotificationBell.tsx, DashboardLa... |
| `apps/admin/src/features/notification/components/NotificationCard.tsx` | NotificationCard.tsx, NotificationCard.tsx, NotificationList.tsx, NotificationList.tsx, Notificat... |
| `apps/admin/src/features/notification/components/NotificationDrawer.tsx` | NotificationDrawer.tsx, DashboardLayout.tsx, DashboardLayout.tsx, NotificationDrawer.tsx, Dashboa... |
| `apps/admin/src/features/notification/components/NotificationFilters.tsx` | useNotificationStore.ts, NotificationFilters.tsx, NotificationCenterPage.tsx, useNotificationStor... |
| `apps/admin/src/features/notification/components/NotificationList.tsx` | NotificationDrawer.tsx, NotificationCenterPage.tsx, NotificationCenterPage.tsx, notification.py, ... |
| `apps/admin/src/features/notification/components/Pagination.tsx` | Pagination.tsx, NotificationCenterPage.tsx, Pagination.tsx, Pagination.tsx, NotificationCenterPag... |
| `apps/admin/src/features/notification/components/SearchBar.tsx` | SearchBar.tsx, SearchBar.tsx, NotificationCenterPage.tsx, NotificationCenterPage.tsx, SearchBar.t... |
| `apps/admin/src/features/notification/components/UnreadCounter.tsx` | UnreadCounter.tsx, NotificationBell.tsx, NotificationBell.tsx, UnreadCounter.tsx, NotificationBel... |
| `apps/admin/src/features/notification/pages/NotificationCenterPage.tsx` | NotificationCenterPage.tsx, index.tsx, index.tsx, index.tsx, NotificationCenterPage.tsx |
| `apps/admin/src/features/payment/components/ComparisonPanel.tsx` | verification.py, VerificationQueuePage.tsx, verification.py, useVerification.ts |
| `apps/admin/src/features/payment/components/ConfidenceMeter.tsx` | ManualReviewQueuePage.tsx, AISummaryPanel.tsx, ComparisonPanel.tsx, VerifyAllReadyDialog.tsx |
| `apps/admin/src/features/payment/components/FilterPanel.tsx` | NoticeManagementPage.tsx, ComplaintManagementPage.tsx, FilterPanel.tsx, FilterPanel.tsx |
| `apps/admin/src/features/payment/components/FraudAlertBadge.tsx` | VerificationQueuePage.tsx, ManualReviewQueuePage.tsx, ReconciliationDetailPage.tsx |
| `apps/admin/src/features/payment/components/Pagination.tsx` | Pagination.tsx, Pagination.tsx, NotificationCenterPage.tsx, Pagination.tsx, NotificationCenterPag... |
| `apps/admin/src/features/payment/components/PaymentReceipt.tsx` | useVerification.ts, usePayment.ts, PaymentReceipt.tsx, index.ts, useTenantPayment.ts |
| `apps/admin/src/features/payment/components/PaymentTimeline.tsx` | PaymentDetailsPage.tsx, PaymentDetailsDrawer.tsx, useAdminPayment.ts, test_admin_payments.py, adm... |
| `apps/admin/src/features/payment/components/RejectDialog.tsx` | PaymentDetailsPage.tsx, VerificationQueuePage.tsx, VerificationDialogs.tsx |
| `apps/admin/src/features/payment/components/SearchBar.tsx` | SearchBar.tsx, NotificationCenterPage.tsx, NotificationCenterPage.tsx, SearchBar.tsx, SearchBar.t... |
| `apps/admin/src/features/payment/components/StatisticsCards.tsx` | HostelManagementPage.tsx, TenantManagementPage.tsx, StatisticsCards.tsx, StatisticsCards.tsx, Rep... |
| `apps/admin/src/features/rent/components/StatisticsCards.tsx` | HostelManagementPage.tsx, TenantManagementPage.tsx, StatisticsCards.tsx, StatisticsCards.tsx, Rep... |
| `apps/admin/src/features/reports/components/Charts.tsx` | DashboardSkeleton.tsx, DashboardCharts.tsx, index.ts, index.ts, reports.py, DashboardPage.tsx, us... |
| `apps/admin/src/features/reports/components/ReportFilters.tsx` | useReports.ts, index.ts, ExportDialog.tsx, ReportsPage.tsx, reports.ts, filters.ts |
| `apps/admin/src/features/reports/components/StatisticsCards.tsx` | HostelManagementPage.tsx, TenantManagementPage.tsx, StatisticsCards.tsx, StatisticsCards.tsx, Rep... |
| `apps/admin/src/features/reports/components/SummaryCards.tsx` | StatementSummaryCards.tsx, ReportsDashboard.tsx, StatementPreviewPage.tsx |
| `apps/admin/src/features/security/components/SecurityTimeline.tsx` | SecurityEventTimelinePage.tsx, RiskAnalysisPanel.tsx, SecurityDashboardPage.tsx |
| `apps/admin/src/features/settings/components/ImageUploader.tsx` | PaymentSettingsForm.tsx, HostelProfileForm.tsx, AdminProfileForm.tsx |
| `apps/admin/src/features/settings/pages/SettingsPage.tsx` | index.tsx, index.tsx, SettingsPage.tsx, phase6_regression.py |
| `apps/admin/src/features/tenant/components/BedStatusGrid.tsx` | TransferBedDialog.tsx, TransferRoomDialog.tsx, AllocationWizard.tsx |
| `apps/admin/src/features/tenant/components/StatisticsCards.tsx` | HostelManagementPage.tsx, TenantManagementPage.tsx, StatisticsCards.tsx, StatisticsCards.tsx, Rep... |
| `apps/admin/src/features/tenant/components/TenantCard.tsx` | Card.tsx, index.tsx, index.tsx, TenantManagementPage.tsx |
| `apps/admin/src/features/tenant/components/TenantProfile.tsx` | TenantManagementPage.tsx, HostelManagementPage.tsx, DashboardPage.tsx, TenantProfilePage.tsx, use... |
| `apps/admin/src/features/tenant/components/TransferRoomDialog.tsx` | TenantManagementPage.tsx, TenantProfilePage.tsx, HostelManagementPage.tsx |
| `apps/admin/src/layouts/DashboardLayout.tsx` | index.tsx, index.tsx, index.tsx, DashboardLayout.tsx, DashboardLayout.tsx |
| `apps/admin/src/pages/auth/ChangePassword.tsx` | ProfilePage.tsx, ForceChangePassword.tsx, index.tsx, ChangePassword.tsx, ForceChangePassword.tsx,... |
| `apps/admin/src/pages/auth/ForceChangePassword.tsx` | index.tsx, ForceChangePassword.tsx, index.tsx, index.tsx, index.ts, ForceChangePassword.tsx |
| `apps/admin/src/pages/auth/ForgotPassword.tsx` | index.tsx, ForgotPassword.tsx, index.tsx, index.tsx, ForgotPassword.tsx, index.ts |
| `apps/admin/src/pages/auth/Login.tsx` | audit_tenant_api2.py, index.tsx, MaintenanceStaffForm.tsx, index.tsx, auth_service.py, test_auth.... |
| `apps/admin/src/pages/auth/ResetPassword.tsx` | ResetPassword.tsx, UserManagementPage.tsx, index.tsx, index.tsx, UserTable.tsx, index.tsx, index.... |
| `apps/admin/src/pages/auth/Unauthorized.tsx` | dependencies.py, App.tsx, App.tsx, index.tsx, Unauthorized.tsx, index.tsx, test_phase18.py, index... |
| `apps/admin/src/pages/electricity/ElectricityPage.tsx` | index.tsx, PayElectricityPage.tsx, index.tsx |
| `apps/admin/src/routes/index.tsx` | init file |
| `apps/tenant/src/features/notification/hooks/api/useNotification.ts` | UnreadCounter.tsx, NotificationBell.tsx, NotificationCenterPage.tsx, useNotificationStore.ts, Not... |
| `apps/tenant/src/features/notification/store/useNotificationStore.ts` | NotificationBell.tsx, useNotificationStore.ts, NotificationDrawer.tsx, useNotificationStore.ts, N... |
| `apps/tenant/src/features/payment/hooks/useTenantDashboard.ts` | MyRoomPage.tsx, DashboardPage.tsx, MyContractPage.tsx, SettingsPage.tsx, DocumentsPage.tsx, RentD... |
| `apps/tenant/src/features/payment/hooks/useTenantPayment.ts` | DashboardPage.tsx, useTenantDashboard.ts, PaymentHistoryPage.tsx, PayRentPage.tsx, RentDetailsPag... |
| `apps/tenant/src/store/auth.ts` | DashboardLayout.tsx, phase8_advance_rent_reminder_test.py, ForceChangePassword.tsx, ChangePasswor... |
| `apps/tenant/src/store/theme.ts` | index.ts, App.tsx, App.tsx, DashboardLayout.tsx, index.ts, index.tsx, index.tsx, PreferencesForm.... |
| `apps/tenant/src/App.tsx` | bulk_verification_service.py, e2e_electricity_audit_p3.py, SuspiciousUsersPage.tsx, PayRentPage.t... |
| `apps/tenant/src/main.tsx` | test_admin_2_tenant_management.py, security_event_service.py, DashboardLayout.tsx, MaintenanceSta... |
| `apps/tenant/src/features/notification/components/EmptyState.tsx` | index.tsx, Table.tsx, DashboardEmptyState.tsx, NotificationList.tsx, NotificationList.tsx, index.... |
| `apps/tenant/src/features/notification/components/NotificationBadge.tsx` | NotificationCard.tsx, NotificationCard.tsx, NotificationBadge.tsx, NotificationCard.tsx, Notifica... |
| `apps/tenant/src/features/notification/components/NotificationBell.tsx` | NotificationBell.tsx, DashboardLayout.tsx, NotificationBell.tsx, DashboardLayout.tsx, DashboardLa... |
| `apps/tenant/src/features/notification/components/NotificationCard.tsx` | NotificationCard.tsx, NotificationCard.tsx, NotificationList.tsx, NotificationList.tsx, Notificat... |
| `apps/tenant/src/features/notification/components/NotificationDrawer.tsx` | DashboardLayout.tsx, NotificationDrawer.tsx, DashboardLayout.tsx, NotificationDrawer.tsx, Dashboa... |
| `apps/tenant/src/features/notification/components/NotificationFilters.tsx` | useNotificationStore.ts, NotificationFilters.tsx, NotificationCenterPage.tsx, useNotificationStor... |
| `apps/tenant/src/features/notification/components/NotificationList.tsx` | NotificationDrawer.tsx, NotificationCenterPage.tsx, NotificationCenterPage.tsx, notification.py, ... |
| `apps/tenant/src/features/notification/components/Pagination.tsx` | Pagination.tsx, Pagination.tsx, NotificationCenterPage.tsx, Pagination.tsx, Pagination.tsx, Notif... |
| `apps/tenant/src/features/notification/components/SearchBar.tsx` | SearchBar.tsx, SearchBar.tsx, NotificationCenterPage.tsx, NotificationCenterPage.tsx, SearchBar.t... |
| `apps/tenant/src/features/notification/components/UnreadCounter.tsx` | NotificationBell.tsx, UnreadCounter.tsx, NotificationBell.tsx, UnreadCounter.tsx, NotificationBel... |
| `apps/tenant/src/features/notification/pages/NotificationCenterPage.tsx` | NotificationCenterPage.tsx, index.tsx, NotificationCenterPage.tsx, index.tsx, index.tsx |
| `apps/tenant/src/features/payment/components/PaymentReceipt.tsx` | PaymentReceipt.tsx, useVerification.ts, usePayment.ts, index.ts, useTenantPayment.ts |
| `apps/tenant/src/layouts/DashboardLayout.tsx` | index.tsx, DashboardLayout.tsx, index.tsx, index.tsx, DashboardLayout.tsx |
| `apps/tenant/src/pages/DashboardPage.tsx` | BillingDashboardPage.tsx, index.tsx, DashboardPage.tsx, ReconciliationDashboardPage.tsx, index.ts... |
| `apps/tenant/src/pages/PayRentPage.tsx` | index.tsx, useTenantDashboard.ts, useTenantPayment.ts |
| `apps/tenant/src/pages/ProfilePage.tsx` | ProfilePage.tsx, index.tsx, TenantProfilePage.tsx, index.tsx, index.tsx |
| `apps/tenant/src/pages/SettingsPage.tsx` | index.tsx, SettingsPage.tsx, index.tsx, phase6_regression.py |
| `apps/tenant/src/pages/auth/ChangePassword.tsx` | ChangePassword.tsx, ProfilePage.tsx, ForceChangePassword.tsx, index.tsx, ChangePassword.tsx, Forc... |
| `apps/tenant/src/pages/auth/ForceChangePassword.tsx` | index.tsx, ForceChangePassword.tsx, ForceChangePassword.tsx, index.tsx, index.tsx, index.ts |
| `apps/tenant/src/pages/auth/ForgotPassword.tsx` | index.tsx, ForgotPassword.tsx, index.tsx, ForgotPassword.tsx, index.tsx, index.ts |
| `apps/tenant/src/pages/auth/Login.tsx` | audit_tenant_api2.py, index.tsx, MaintenanceStaffForm.tsx, index.tsx, Login.tsx, auth_service.py,... |
| `apps/tenant/src/pages/auth/ResetPassword.tsx` | UserManagementPage.tsx, index.tsx, index.tsx, UserTable.tsx, index.tsx, index.ts, ResetPasswordDi... |
| `apps/tenant/src/pages/auth/Unauthorized.tsx` | dependencies.py, App.tsx, App.tsx, index.tsx, Unauthorized.tsx, Unauthorized.tsx, index.tsx, test... |
| `apps/tenant/src/routes/index.tsx` | init file |
| `apps/maintenance/src/features/complaint/hooks/useMaintenanceComplaint.ts` | MaintenanceComplaintsPage.tsx, DashboardPage.tsx, ProfilePage.tsx |
| `apps/maintenance/src/features/notification/hooks/api/useNotification.ts` | UnreadCounter.tsx, NotificationBell.tsx, NotificationCenterPage.tsx, useNotificationStore.ts, Not... |
| `apps/maintenance/src/features/notification/store/useNotificationStore.ts` | NotificationBell.tsx, useNotificationStore.ts, NotificationDrawer.tsx, NotificationDrawer.tsx, No... |
| `apps/maintenance/src/store/auth.ts` | DashboardLayout.tsx, phase8_advance_rent_reminder_test.py, ForceChangePassword.tsx, ChangePasswor... |
| `apps/maintenance/src/store/theme.ts` | index.ts, App.tsx, App.tsx, DashboardLayout.tsx, index.ts, index.tsx, index.tsx, PreferencesForm.... |
| `apps/maintenance/src/App.tsx` | bulk_verification_service.py, e2e_electricity_audit_p3.py, SuspiciousUsersPage.tsx, PayRentPage.t... |
| `apps/maintenance/src/main.tsx` | test_admin_2_tenant_management.py, security_event_service.py, DashboardLayout.tsx, MaintenanceSta... |
| `apps/maintenance/src/features/notification/components/EmptyState.tsx` | index.tsx, Table.tsx, DashboardEmptyState.tsx, NotificationList.tsx, NotificationList.tsx, index.... |
| `apps/maintenance/src/features/notification/components/NotificationBadge.tsx` | NotificationCard.tsx, NotificationCard.tsx, NotificationBadge.tsx, NotificationCard.tsx, Notifica... |
| `apps/maintenance/src/features/notification/components/NotificationBell.tsx` | NotificationBell.tsx, DashboardLayout.tsx, DashboardLayout.tsx, NotificationBell.tsx, DashboardLa... |
| `apps/maintenance/src/features/notification/components/NotificationCard.tsx` | NotificationCard.tsx, NotificationCard.tsx, NotificationList.tsx, NotificationList.tsx, Notificat... |
| `apps/maintenance/src/features/notification/components/NotificationDrawer.tsx` | NotificationDrawer.tsx, DashboardLayout.tsx, NotificationDrawer.tsx, DashboardLayout.tsx, Dashboa... |
| `apps/maintenance/src/features/notification/components/NotificationFilters.tsx` | useNotificationStore.ts, NotificationCenterPage.tsx, useNotificationStore.ts, NotificationFilters... |
| `apps/maintenance/src/features/notification/components/NotificationList.tsx` | NotificationDrawer.tsx, NotificationCenterPage.tsx, NotificationCenterPage.tsx, notification.py, ... |
| `apps/maintenance/src/features/notification/components/Pagination.tsx` | Pagination.tsx, NotificationCenterPage.tsx, Pagination.tsx, Pagination.tsx, NotificationCenterPag... |
| `apps/maintenance/src/features/notification/components/SearchBar.tsx` | SearchBar.tsx, SearchBar.tsx, NotificationCenterPage.tsx, NotificationCenterPage.tsx, SearchBar.t... |
| `apps/maintenance/src/features/notification/components/UnreadCounter.tsx` | UnreadCounter.tsx, NotificationBell.tsx, UnreadCounter.tsx, NotificationBell.tsx, NotificationBel... |
| `apps/maintenance/src/features/notification/pages/NotificationCenterPage.tsx` | index.tsx, NotificationCenterPage.tsx, index.tsx, index.tsx, NotificationCenterPage.tsx |
| `apps/maintenance/src/layouts/DashboardLayout.tsx` | index.tsx, DashboardLayout.tsx, index.tsx, index.tsx, DashboardLayout.tsx |
| `apps/maintenance/src/pages/DashboardPage.tsx` | BillingDashboardPage.tsx, index.tsx, DashboardPage.tsx, ReconciliationDashboardPage.tsx, index.ts... |
| `apps/maintenance/src/pages/ProfilePage.tsx` | index.tsx, TenantProfilePage.tsx, index.tsx, index.tsx, ProfilePage.tsx |
| `apps/maintenance/src/pages/auth/ChangePassword.tsx` | ChangePassword.tsx, ProfilePage.tsx, ForceChangePassword.tsx, index.tsx, ForceChangePassword.tsx,... |
| `apps/maintenance/src/pages/auth/ForceChangePassword.tsx` | index.tsx, ForceChangePassword.tsx, index.tsx, index.tsx, index.ts, ForceChangePassword.tsx |
| `apps/maintenance/src/pages/auth/ForgotPassword.tsx` | index.tsx, index.tsx, ForgotPassword.tsx, index.tsx, ForgotPassword.tsx, index.ts |
| `apps/maintenance/src/pages/auth/Login.tsx` | audit_tenant_api2.py, index.tsx, MaintenanceStaffForm.tsx, index.tsx, Login.tsx, auth_service.py,... |
| `apps/maintenance/src/pages/auth/ResetPassword.tsx` | ResetPassword.tsx, UserManagementPage.tsx, index.tsx, index.tsx, UserTable.tsx, index.tsx, index.... |
| `apps/maintenance/src/pages/auth/Unauthorized.tsx` | dependencies.py, App.tsx, App.tsx, index.tsx, Unauthorized.tsx, index.tsx, test_phase18.py, index... |
| `apps/maintenance/src/routes/index.tsx` | init file |
| `packages/api-client/src/index.ts` | init file |
| `packages/constants/src/index.ts` | init file |
| `packages/types/src/index.ts` | init file |
| `packages/ui/src/index.ts` | init file |
| `packages/ui/src/components/index.ts` | init file |
| `packages/ui/src/design-system/index.ts` | init file |
| `packages/ui/src/design-system/animations/index.ts` | init file |
| `packages/ui/src/design-system/colors/index.ts` | init file |
| `packages/ui/src/design-system/hooks/index.ts` | init file |
| `packages/ui/src/design-system/radius/index.ts` | init file |
| `packages/ui/src/design-system/shadows/index.ts` | init file |
| `packages/ui/src/design-system/spacing/index.ts` | init file |
| `packages/ui/src/design-system/tokens/index.ts` | init file |
| `packages/ui/src/design-system/utils/index.ts` | init file |
| `packages/ui/src/layout/index.ts` | init file |
| `packages/ui/src/layout/hooks/useLayout.ts` | index.ts, DashboardLayout.tsx |
| `packages/ui/src/layout/types/index.ts` | init file |
| `packages/utils/src/index.ts` | init file |
| `packages/validation/src/index.ts` | init file |
| `packages/ui/src/components/Badge.tsx` | RoomCard.tsx, NotificationBadge.tsx, BuildingSummaryCard.tsx, TenantCard.tsx, ComplaintTable.tsx,... |
| `packages/ui/src/components/Button.tsx` | UserManagementPage.tsx, MaintenanceStaffForm.tsx, index.tsx, ForceChangePassword.tsx, ChangePassw... |
| `packages/ui/src/components/Card.tsx` | ComplaintSummary.tsx, DashboardLayout.tsx, TenantCard.tsx, RentDetailsPage.tsx, SettingsPage.tsx,... |
| `packages/ui/src/components/Drawer.tsx` | DashboardLayout.tsx, PaymentDetailsDrawer.tsx, RentDetailsDrawer.tsx, index.tsx, TenantPreviewDra... |
| `packages/ui/src/components/Input.tsx` | ForceChangePassword.tsx, PayRentPage.tsx, MaintenanceStaffForm.tsx, FloorForm.tsx, RentDetailsDra... |
| `packages/ui/src/components/Modal.tsx` | PayRentPage.tsx, MaintenanceStaffForm.tsx, FloorForm.tsx, VerificationDialogs.tsx, RentManagement... |
| `packages/ui/src/components/Spinner.tsx` | ReadStatistics.tsx, NoticeForm.tsx, PaymentDetailsDrawer.tsx, TenantProfilePage.tsx, Availability... |
| `packages/ui/src/components/Table.tsx` | MaintenanceTable.tsx, UserManagementPage.tsx, role.py, HostelTable.tsx, ComplaintTable.tsx, RentM... |
| `packages/ui/src/components/accordion/index.tsx` | init file |
| `packages/ui/src/components/animations/index.tsx` | init file |
| `packages/ui/src/components/avatars/index.tsx` | init file |
| `packages/ui/src/components/badges/index.tsx` | init file |
| `packages/ui/src/components/breadcrumbs/index.tsx` | init file |
| `packages/ui/src/components/buttons/index.tsx` | init file |
| `packages/ui/src/components/cards/index.tsx` | init file |
| `packages/ui/src/components/charts/index.tsx` | init file |
| `packages/ui/src/components/drawers/index.tsx` | init file |
| `packages/ui/src/components/dropdowns/index.tsx` | init file |
| `packages/ui/src/components/empty-state/index.tsx` | init file |
| `packages/ui/src/components/feedback/ErrorBoundary.tsx` | index.tsx, index.tsx, index.tsx, index.tsx |
| `packages/ui/src/components/feedback/index.tsx` | init file |
| `packages/ui/src/components/filters/index.tsx` | init file |
| `packages/ui/src/components/forms/index.tsx` | init file |
| `packages/ui/src/components/inputs/index.tsx` | init file |
| `packages/ui/src/components/layout/index.tsx` | init file |
| `packages/ui/src/components/loading/index.tsx` | init file |
| `packages/ui/src/components/modals/index.tsx` | init file |
| `packages/ui/src/components/pagination/index.tsx` | init file |
| `packages/ui/src/components/search/index.tsx` | init file |
| `packages/ui/src/components/stats/index.tsx` | init file |
| `packages/ui/src/components/stepper/index.tsx` | init file |
| `packages/ui/src/components/tables/index.tsx` | init file |
| `packages/ui/src/components/tooltips/index.tsx` | init file |
| `packages/ui/src/components/tree/index.tsx` | init file |
| `packages/ui/src/components/upload/index.tsx` | init file |
| `packages/ui/src/design-system/badges/index.tsx` | init file |
| `packages/ui/src/design-system/buttons/index.tsx` | init file |
| `packages/ui/src/design-system/cards/index.tsx` | init file |
| `packages/ui/src/design-system/charts/index.tsx` | init file |
| `packages/ui/src/design-system/dialogs/index.tsx` | init file |
| `packages/ui/src/design-system/drawers/index.tsx` | init file |
| `packages/ui/src/design-system/empty/index.tsx` | init file |
| `packages/ui/src/design-system/forms/index.tsx` | init file |
| `packages/ui/src/design-system/icons/index.tsx` | init file |
| `packages/ui/src/design-system/inputs/index.tsx` | init file |
| `packages/ui/src/design-system/layout/index.tsx` | init file |
| `packages/ui/src/design-system/loading/index.tsx` | init file |
| `packages/ui/src/design-system/tables/index.tsx` | init file |
| `packages/ui/src/design-system/theme/index.tsx` | init file |
| `packages/ui/src/design-system/typography/index.tsx` | init file |
| `packages/ui/src/layout/components/ActionBar/index.tsx` | init file |
| `packages/ui/src/layout/components/Breadcrumb/index.tsx` | init file |
| `packages/ui/src/layout/components/Content/index.tsx` | init file |
| `packages/ui/src/layout/components/Footer/index.tsx` | init file |
| `packages/ui/src/layout/components/Header/index.tsx` | init file |
| `packages/ui/src/layout/components/Navigation/index.tsx` | init file |
| `packages/ui/src/layout/components/Notification/index.tsx` | init file |
| `packages/ui/src/layout/components/PageHeader/index.tsx` | init file |
| `packages/ui/src/layout/components/Profile/index.tsx` | init file |
| `packages/ui/src/layout/components/Search/index.tsx` | init file |
| `packages/ui/src/layout/components/Sidebar/index.tsx` | init file |

## 2. Probably Used (157)
| File | Evidence / References |
|---|---|
| `apps/backend/create_admin.py` | setup_tenant_full.py |
| `apps/backend/app/api/admin_payments.py` | main.py |
| `apps/backend/app/api/bank_statements.py` | main.py |
| `apps/backend/app/core/file_validators.py` | cloudinary.py |
| `apps/backend/app/migrations/versions/07d8d7d24d6a_normalize_enums.py` | Loaded by framework or entrypoint |
| `apps/backend/app/migrations/versions/21500e5e48f0_add_missing_enum_values.py` | Loaded by framework or entrypoint |
| `apps/backend/app/migrations/versions/428165f4ddcd_add_agreement_url_to_contract.py` | Loaded by framework or entrypoint |
| `apps/backend/app/migrations/versions/660c018dde32_create_performance_indexes.py` | Loaded by framework or entrypoint |
| `apps/backend/app/migrations/versions/6711f7361973_add_missing_tables.py` | Loaded by framework or entrypoint |
| `apps/backend/app/migrations/versions/6970b22fc35a_initial_migration.py` | Loaded by framework or entrypoint |
| `apps/backend/app/migrations/versions/79668cadcb2f_add_notice_to_notificationtype.py` | Loaded by framework or entrypoint |
| `apps/backend/app/migrations/versions/a1b2c3d4e5f6_add_due_date_to_electricity_bills.py` | Loaded by framework or entrypoint |
| `apps/backend/app/migrations/versions/d90f4ad43b2a_add_new_columns.py` | Loaded by framework or entrypoint |
| `apps/backend/app/migrations/versions/f1a2b3c4d5e6_add_room_type_and_amenities_to_rooms.py` | Loaded by framework or entrypoint |
| `apps/admin/src/features/complaint/store/useComplaintStore.ts` | ComplaintManagementPage.tsx |
| `apps/admin/src/features/dashboard/store/useDashboardStore.ts` | DashboardPage.tsx |
| `apps/admin/src/features/hostel/store/useHostelStore.ts` | HierarchyTree.tsx, HostelManagementPage.tsx |
| `apps/admin/src/features/maintenance/store/useMaintenanceStore.ts` | MaintenanceManagementPage.tsx |
| `apps/admin/src/features/notice/store/useNoticeStore.ts` | NoticeManagementPage.tsx |
| `apps/admin/src/features/payment/hooks/useAdminPayment.ts` | PaymentDetailsPage.tsx, PaymentTimeline.tsx |
| `apps/admin/src/features/payment/hooks/usePaymentFoundation.ts` | PaymentManagementPage.tsx |
| `apps/admin/src/features/rent/hooks/api/useBilling.ts` | BillingDashboardPage.tsx, BillingLedgerDrawer.tsx |
| `apps/admin/src/features/rent/store/useRentStore.ts` | RentManagementPage.tsx |
| `apps/admin/src/features/tenant/store/useTenantStore.ts` | TenantManagementPage.tsx |
| `apps/admin/src/features/user-management/hooks/api/useUserManagement.ts` | UserManagementPage.tsx |
| `apps/admin/src/features/complaint/components/AssignDialog.tsx` | ComplaintManagementPage.tsx, useComplaintStore.ts |
| `apps/admin/src/features/complaint/components/ComplaintDetailsDrawer.tsx` | ComplaintManagementPage.tsx |
| `apps/admin/src/features/complaint/components/PhotoGallery.tsx` | ComplaintDetailsDrawer.tsx |
| `apps/admin/src/features/complaint/components/StatusDialog.tsx` | ComplaintManagementPage.tsx, useComplaintStore.ts |
| `apps/admin/src/features/complaint/pages/ComplaintManagementPage.tsx` | index.tsx |
| `apps/admin/src/features/dashboard/components/ComplaintSummary.tsx` | reports.py, DashboardPage.tsx |
| `apps/admin/src/features/dashboard/components/DashboardEmptyState.tsx` | DashboardPage.tsx |
| `apps/admin/src/features/dashboard/components/DashboardHeader.tsx` | DashboardPage.tsx |
| `apps/admin/src/features/dashboard/components/DashboardSkeleton.tsx` | DashboardPage.tsx |
| `apps/admin/src/features/dashboard/components/FinancialSummary.tsx` | DashboardPage.tsx |
| `apps/admin/src/features/dashboard/components/NoticeSummary.tsx` | reports.py, DashboardPage.tsx |
| `apps/admin/src/features/dashboard/components/OccupancyOverview.tsx` | DashboardPage.tsx |
| `apps/admin/src/features/dashboard/components/QuickActions.tsx` | DashboardPage.tsx |
| `apps/admin/src/features/dashboard/components/RecentPaymentsTable.tsx` | DashboardPage.tsx |
| `apps/admin/src/features/dashboard/components/RecentTenants.tsx` | DashboardPage.tsx |
| `apps/admin/src/features/dashboard/components/RentAlertPopup.tsx` | DashboardPage.tsx |
| `apps/admin/src/features/dashboard/components/RentCollectionAlert.tsx` | DashboardPage.tsx |
| `apps/admin/src/features/dashboard/components/RightSidebar.tsx` | DashboardPage.tsx |
| `apps/admin/src/features/dashboard/components/UpcomingTasks.tsx` | DashboardPage.tsx |
| `apps/admin/src/features/hostel/components/BedForm.tsx` | RoomDetailPage.tsx, HostelManagementPage.tsx |
| `apps/admin/src/features/hostel/components/BedGrid.tsx` | HostelManagementPage.tsx |
| `apps/admin/src/features/hostel/components/BuildingForm.tsx` | HostelManagementPage.tsx |
| `apps/admin/src/features/hostel/components/BuildingSummaryCard.tsx` | HostelManagementPage.tsx |
| `apps/admin/src/features/hostel/components/FloorForm.tsx` | HostelManagementPage.tsx |
| `apps/admin/src/features/hostel/components/FloorSummaryCard.tsx` | HostelManagementPage.tsx |
| `apps/admin/src/features/hostel/components/HierarchyTree.tsx` | HostelManagementPage.tsx |
| `apps/admin/src/features/hostel/components/HostelForm.tsx` | HostelManagementPage.tsx |
| `apps/admin/src/features/hostel/components/HostelSummaryCard.tsx` | HostelManagementPage.tsx |
| `apps/admin/src/features/hostel/components/PropertyActions.tsx` | HostelManagementPage.tsx |
| `apps/admin/src/features/hostel/components/RoomForm.tsx` | RoomDetailPage.tsx, HostelManagementPage.tsx |
| `apps/admin/src/features/hostel/components/RoomSummary.tsx` | HostelManagementPage.tsx |
| `apps/admin/src/features/hostel/components/SearchFilters.tsx` | HostelManagementPage.tsx |
| `apps/admin/src/features/hostel/components/SidebarStats.tsx` | HostelManagementPage.tsx |
| `apps/admin/src/features/hostel/pages/AvailabilityPage.tsx` | index.tsx |
| `apps/admin/src/features/hostel/pages/HostelManagementPage.tsx` | index.tsx |
| `apps/admin/src/features/hostel/pages/RoomDetailPage.tsx` | index.tsx |
| `apps/admin/src/features/maintenance/components/MaintenanceCard.tsx` | MaintenanceManagementPage.tsx |
| `apps/admin/src/features/maintenance/components/MaintenanceStaffForm.tsx` | MaintenanceManagementPage.tsx |
| `apps/admin/src/features/maintenance/components/MaintenanceTable.tsx` | MaintenanceManagementPage.tsx |
| `apps/admin/src/features/maintenance/pages/MaintenanceManagementPage.tsx` | index.tsx |
| `apps/admin/src/features/notice/components/NoticeDetailsDrawer.tsx` | NoticeManagementPage.tsx |
| `apps/admin/src/features/notice/components/NoticeForm.tsx` | NoticeManagementPage.tsx |
| `apps/admin/src/features/notice/pages/NoticeManagementPage.tsx` | index.tsx |
| `apps/admin/src/features/payment/components/AISummaryPanel.tsx` | ReconciliationDetailPage.tsx |
| `apps/admin/src/features/payment/components/BulkActionToolbar.tsx` | VerificationQueuePage.tsx |
| `apps/admin/src/features/payment/components/PaymentCard.tsx` | index.tsx, Card.tsx |
| `apps/admin/src/features/payment/components/PaymentDetailsDrawer.tsx` | PaymentTimeline.tsx |
| `apps/admin/src/features/payment/components/PaymentTable.tsx` | PaymentCard.tsx |
| `apps/admin/src/features/payment/components/PDFPreviewModal.tsx` | ReceiptDetailPage.tsx, ReceiptHistoryPage.tsx |
| `apps/admin/src/features/payment/components/ReceiptCard.tsx` | ReceiptHistoryPage.tsx |
| `apps/admin/src/features/payment/components/RuleBreakdownTable.tsx` | ReconciliationDetailPage.tsx |
| `apps/admin/src/features/payment/components/ScreenshotViewer.tsx` | PaymentDetailsPage.tsx |
| `apps/admin/src/features/payment/components/StatementSummaryCards.tsx` | StatementPreviewPage.tsx |
| `apps/admin/src/features/payment/components/StatementUploadDialog.tsx` | BankStatementPage.tsx |
| `apps/admin/src/features/payment/components/TransactionsTable.tsx` | StatementPreviewPage.tsx |
| `apps/admin/src/features/payment/components/UndoVerificationDialog.tsx` | VerificationQueuePage.tsx |
| `apps/admin/src/features/payment/components/VerificationDialogs.tsx` | PaymentDetailsPage.tsx |
| `apps/admin/src/features/payment/components/VerifyAllReadyDialog.tsx` | SmartVerificationDashboard.tsx |
| `apps/admin/src/features/payment/pages/BankStatementPage.tsx` | index.tsx |
| `apps/admin/src/features/payment/pages/CashVerificationPage.tsx` | index.tsx |
| `apps/admin/src/features/payment/pages/ManualReviewQueuePage.tsx` | index.tsx |
| `apps/admin/src/features/payment/pages/PaymentDetailsPage.tsx` | index.tsx |
| `apps/admin/src/features/payment/pages/PaymentManagementPage.tsx` | index.tsx |
| `apps/admin/src/features/payment/pages/ReceiptDetailPage.tsx` | index.tsx |
| `apps/admin/src/features/payment/pages/ReceiptHistoryPage.tsx` | index.tsx |
| `apps/admin/src/features/payment/pages/ReconciliationDashboardPage.tsx` | index.tsx |
| `apps/admin/src/features/payment/pages/ReconciliationDetailPage.tsx` | index.tsx |
| `apps/admin/src/features/payment/pages/SmartVerificationDashboard.tsx` | index.tsx |
| `apps/admin/src/features/payment/pages/StatementPreviewPage.tsx` | index.tsx |
| `apps/admin/src/features/payment/pages/VerificationQueuePage.tsx` | index.tsx |
| `apps/admin/src/features/rent/components/BillingLedgerDrawer.tsx` | BillingDashboardPage.tsx |
| `apps/admin/src/features/rent/components/RentCard.tsx` | RentManagementPage.tsx |
| `apps/admin/src/features/rent/components/RentDashboardCards.tsx` | RentManagementPage.tsx |
| `apps/admin/src/features/rent/components/RentDetailsDrawer.tsx` | RentManagementPage.tsx |
| `apps/admin/src/features/rent/components/RentForm.tsx` | RentManagementPage.tsx |
| `apps/admin/src/features/rent/components/RentTable.tsx` | RentManagementPage.tsx |
| `apps/admin/src/features/rent/pages/BillingDashboardPage.tsx` | index.tsx |
| `apps/admin/src/features/rent/pages/RentManagementPage.tsx` | index.tsx |
| `apps/admin/src/features/rent_collection/components/CashCollectionModal.tsx` | RentCollectionPage.tsx |
| `apps/admin/src/features/rent_collection/pages/RentCollectionPage.tsx` | index.tsx |
| `apps/admin/src/features/reports/components/ExportDialog.tsx` | ReportsPage.tsx |
| `apps/admin/src/features/reports/components/PrintDialog.tsx` | ReportsPage.tsx |
| `apps/admin/src/features/reports/components/ReportsDashboard.tsx` | useReports.ts, ReportsPage.tsx |
| `apps/admin/src/features/reports/components/ReportTable.tsx` | ReportsPage.tsx |
| `apps/admin/src/features/reports/pages/ReportsPage.tsx` | index.tsx |
| `apps/admin/src/features/security/components/RiskAnalysisPanel.tsx` | PaymentSecurityPage.tsx |
| `apps/admin/src/features/security/components/RiskBadge.tsx` | RiskAnalysisPanel.tsx, HighRiskQueuePage.tsx |
| `apps/admin/src/features/security/components/RiskMeter.tsx` | RiskAnalysisPanel.tsx |
| `apps/admin/src/features/security/components/RiskScoreCard.tsx` | SecurityDashboardPage.tsx |
| `apps/admin/src/features/security/components/SecurityAlerts.tsx` | RiskAnalysisPanel.tsx, HighRiskQueuePage.tsx |
| `apps/admin/src/features/security/components/SecurityDialogs.tsx` | RiskAnalysisPanel.tsx |
| `apps/admin/src/features/security/pages/HighRiskQueuePage.tsx` | index.tsx |
| `apps/admin/src/features/security/pages/PaymentSecurityPage.tsx` | index.tsx |
| `apps/admin/src/features/security/pages/SecurityDashboardPage.tsx` | index.tsx |
| `apps/admin/src/features/security/pages/SecurityEventTimelinePage.tsx` | index.tsx |
| `apps/admin/src/features/security/pages/SecurityRulesPage.tsx` | index.tsx |
| `apps/admin/src/features/security/pages/SuspiciousUsersPage.tsx` | index.tsx |
| `apps/admin/src/features/settings/components/AdminProfileForm.tsx` | SettingsPage.tsx |
| `apps/admin/src/features/settings/components/HostelProfileForm.tsx` | SettingsPage.tsx |
| `apps/admin/src/features/settings/components/PaymentSettingsForm.tsx` | SettingsPage.tsx |
| `apps/admin/src/features/settings/components/PreferencesForm.tsx` | SettingsPage.tsx |
| `apps/admin/src/features/settings/components/SettingsCard.tsx` | SettingsPage.tsx |
| `apps/admin/src/features/tenant/components/AllocationTimeline.tsx` | TenantProfile.tsx |
| `apps/admin/src/features/tenant/components/AllocationWizard.tsx` | TenantManagementPage.tsx, HostelManagementPage.tsx |
| `apps/admin/src/features/tenant/components/DocumentUploader.tsx` | TenantProfile.tsx, TenantProfilePage.tsx |
| `apps/admin/src/features/tenant/components/RoomOccupancyCard.tsx` | TransferRoomDialog.tsx, AllocationWizard.tsx |
| `apps/admin/src/features/tenant/components/TenantForm.tsx` | TenantProfilePage.tsx, TenantManagementPage.tsx |
| `apps/admin/src/features/tenant/components/TenantHistory.tsx` | useTenant.ts |
| `apps/admin/src/features/tenant/components/TenantPreviewDrawer.tsx` | HostelManagementPage.tsx |
| `apps/admin/src/features/tenant/components/TenantTable.tsx` | TenantManagementPage.tsx |
| `apps/admin/src/features/tenant/components/TransferBedDialog.tsx` | TenantManagementPage.tsx |
| `apps/admin/src/features/tenant/pages/TenantManagementPage.tsx` | index.tsx |
| `apps/admin/src/features/tenant/pages/TenantProfilePage.tsx` | index.tsx |
| `apps/admin/src/features/user-management/components/ResetPasswordDialog.tsx` | UserManagementPage.tsx |
| `apps/admin/src/features/user-management/components/UserTable.tsx` | UserManagementPage.tsx |
| `apps/admin/src/features/user-management/pages/UserManagementPage.tsx` | index.tsx |
| `apps/admin/src/pages/electricity/components/ElectricityCashModal.tsx` | ElectricityPage.tsx |
| `apps/tenant/src/features/complaint/hooks/useTenantComplaint.ts` | TenantComplaintsPage.tsx, DashboardPage.tsx |
| `apps/tenant/src/features/notice/hooks/api/useTenantNotice.ts` | TenantNoticesPage.tsx |
| `apps/tenant/src/pages/DocumentsPage.tsx` | index.tsx |
| `apps/tenant/src/pages/ElectricityBillPage.tsx` | a1b2c3d4e5f6_add_due_date_to_electricity_bills.py, index.tsx |
| `apps/tenant/src/pages/MyContractPage.tsx` | index.tsx |
| `apps/tenant/src/pages/MyRoomPage.tsx` | index.tsx |
| `apps/tenant/src/pages/PayElectricityPage.tsx` | index.tsx |
| `apps/tenant/src/pages/PaymentHistoryPage.tsx` | index.tsx |
| `apps/tenant/src/pages/RentDetailsPage.tsx` | useTenantDashboard.ts, index.tsx |
| `apps/tenant/src/pages/SupportPage.tsx` | index.tsx |
| `apps/tenant/src/pages/TenantComplaintsPage.tsx` | index.tsx |
| `apps/tenant/src/pages/TenantNoticesPage.tsx` | tenant_dashboard_service.py, index.tsx |
| `apps/maintenance/src/features/complaint/hooks/useBillReading.ts` | BillReadingPage.tsx |
| `apps/maintenance/src/pages/BillReadingPage.tsx` | index.tsx |
| `apps/maintenance/src/pages/MaintenanceComplaintsPage.tsx` | index.tsx |

## 3. Possibly Unused
| File | Evidence | Why uncertain |
|---|---|---|

## 4. Probably Dead Code (9)
| File | Evidence / References |
|---|---|
| `apps/admin/src/features/dashboard/components/ActivityTimeline.tsx` | 0 refs, likely dead frontend code |
| `apps/admin/src/features/dashboard/components/RecentComplaintsTable.tsx` | 0 refs, likely dead frontend code |
| `apps/admin/src/features/dashboard/components/RecentNoticesTable.tsx` | 0 refs, likely dead frontend code |
| `apps/admin/src/features/hostel/components/BedTable.tsx` | 0 refs, likely dead frontend code |
| `apps/admin/src/features/hostel/components/BuildingTable.tsx` | 0 refs, likely dead frontend code |
| `apps/admin/src/features/hostel/components/FloorTable.tsx` | 0 refs, likely dead frontend code |
| `apps/admin/src/features/hostel/components/HostelTable.tsx` | 0 refs, likely dead frontend code |
| `apps/admin/src/features/hostel/components/RoomTable.tsx` | 0 refs, likely dead frontend code |
| `apps/admin/src/features/payment/components/PaymentVerificationDialog.tsx` | 0 refs, likely dead frontend code |

## 5. Definitely Unused / Safe Removal Candidates
| File | Evidence | References Found |
|---|---|---|
| `apps/backend/apply_db_indexes.py` | No references found in entire project | 0 |
| `apps/backend/final_verification.py` | No references found in entire project | 0 |
| `apps/backend/print_indexes.py` | No references found in entire project | 0 |
| `apps/backend/print_non_empty_tables.py` | No references found in entire project | 0 |
| `apps/backend/purge_tenants.py` | No references found in entire project | 0 |
| `apps/backend/reset_jay.py` | No references found in entire project | 0 |
| `apps/backend/setup_tenant_full.py` | No references found in entire project | 0 |
| `apps/backend/step1_inventory.py` | No references found in entire project | 0 |
| `apps/backend/step1_inventory2.py` | No references found in entire project | 0 |
| `apps/backend/step1_inventory3.py` | No references found in entire project | 0 |
| `apps/backend/unlock_account.py` | No references found in entire project | 0 |
| `apps/backend/validate_payments.py` | No references found in entire project | 0 |
| `apps/admin/src/features/payment/store/usePaymentStore.ts` | No references found in entire project | 0 |

## 6. Test / Debug / One-Time Files
| File | Purpose | Evidence |
|---|---|---|
| `apps/backend/audit_tenant_api.py` | Audit/Test script | 0 refs |
| `apps/backend/audit_tenant_api2.py` | Audit/Test script | 0 refs |
| `apps/backend/audit_tenant_api3.py` | Audit/Test script | 0 refs |
| `apps/backend/check_cols.py` | Audit/Test script | 0 refs |
| `apps/backend/check_extra_missing_cols.py` | Audit/Test script | 0 refs |
| `apps/backend/check_health.py` | Audit/Test script | 0 refs |
| `apps/backend/check_local_db.py` | Audit/Test script | 0 refs |
| `apps/backend/check_lockout.py` | Audit/Test script | auth_service.py |
| `apps/backend/check_locks.py` | Audit/Test script | 0 refs |
| `apps/backend/check_pg.py` | Audit/Test script | 0 refs |
| `apps/backend/check_user.py` | Audit/Test script | 0 refs |
| `apps/backend/concurrency_test.py` | Audit/Test script | phase7_transaction_fix_test.py |
| `apps/backend/e2e_electricity_audit_p1.py` | Audit/Test script | 0 refs |
| `apps/backend/e2e_electricity_audit_p2.py` | Audit/Test script | 0 refs |
| `apps/backend/e2e_electricity_audit_p3.py` | Audit/Test script | 0 refs |
| `apps/backend/e2e_electricity_audit_p4.py` | Audit/Test script | 0 refs |
| `apps/backend/e2e_electricity_audit_p5.py` | Audit/Test script | 0 refs |
| `apps/backend/e2e_electricity_cash_audit.py` | Audit/Test script | 0 refs |
| `apps/backend/e2e_maintenance_audit_p6.py` | Audit/Test script | 0 refs |
| `apps/backend/e2e_receipt_notification_audit.py` | Audit/Test script | 0 refs |
| `apps/backend/e2e_security_audit_p1.py` | Audit/Test script | 0 refs |
| `apps/backend/final_smoke_test.py` | Audit/Test script | 0 refs |
| `apps/backend/fix_corrupt_rent_ledgers.py` | Audit/Test script | 0 refs |
| `apps/backend/phase10_room_bed_availability_test.py` | Audit/Test script | 0 refs |
| `apps/backend/phase6_final_check.py` | Audit/Test script | 0 refs |
| `apps/backend/phase6_regression.py` | Audit/Test script | 0 refs |
| `apps/backend/phase7_transaction_fix_test.py` | Audit/Test script | 0 refs |
| `apps/backend/phase8_advance_rent_reminder_test.py` | Audit/Test script | 0 refs |
| `apps/backend/phase9_audit.py` | Audit/Test script | 0 refs |
| `apps/backend/regression_audit.py` | Audit/Test script | 0 refs |
| `apps/backend/repair_lokesh.py` | Audit/Test script | 0 refs |
| `apps/backend/test_500.py` | Audit/Test script | 0 refs |
| `apps/backend/test_500_async.py` | Audit/Test script | 0 refs |
| `apps/backend/test_anchor_date.py` | Audit/Test script | 0 refs |
| `apps/backend/test_api.py` | Audit/Test script | 0 refs |
| `apps/backend/test_login_final.py` | Audit/Test script | 0 refs |
| `apps/backend/app/api/checkin.py` | Audit/Test script | statement_validation_service.py, test_admin_2_tenant_management.py, phase8_advance_rent_reminder_test.py, tenant.py, test_tenant_flow.py, UpcomingTasks.tsx, ReportsDashboard.tsx, check_pg.py, DashboardCards.tsx, TenantManagementPage.tsx, reports_repository.py, index.ts, setup_tenant_full.py, tenants.py, index.ts, index.ts, regression_audit.py, TenantHistory.tsx, main.py, tenant_service.py, AllocationWizard.tsx, allocations.py, useTenant.ts, index.ts, reports.py, dashboard_service.py, tenant_dashboard_service.py, CheckInDialog.tsx |
| `apps/backend/app/api/checkout.py` | Audit/Test script | test_admin_2_tenant_management.py, tenant.py, e2e_electricity_cash_audit.py, phase10_room_bed_availability_test.py, test_tenant_flow.py, hostel.py, ReportsDashboard.tsx, CheckOutDialog.tsx, DashboardCards.tsx, AllocationTimeline.tsx, phase7_transaction_fix_test.py, TenantManagementPage.tsx, reports_repository.py, test_billing_engine.py, index.ts, phase9_audit.py, tenants.py, index.ts, index.ts, TenantHistory.tsx, e2e_electricity_audit_p4.py, main.py, contract.py, billing_engine.py, tenant_service.py, HostelManagementPage.tsx, allocations.py, 6970b22fc35a_initial_migration.py, billing.py, PaymentSettingsForm.tsx, hostel_service.py, useAllocation.ts, e2e_receipt_notification_audit.py, useTenant.ts, index.ts, test_tenant_payments.py, reports.py, dashboard_service.py, RoomDetailPage.tsx, tenant_dashboard_service.py |
| `apps/backend/app/migrations/versions/3789ebbb4a0c_fix_database_issues.py` | Audit/Test script | 0 refs |
| `apps/backend/app/models/audit.py` | Audit/Test script | test_admin_2_tenant_management.py, bulk_verification_service.py, DashboardLayout.tsx, e2e_electricity_audit_p1.py, usePayment.ts, auth.py, MyRoomPage.tsx, manual_review_service.py, payments.py, base.py, verification_service.py, test_hostel_infra.py, undo_verification_service.py, index.ts, auth_repository.py, PaymentDetailsDrawer.tsx, security_rule_engine.py, test_auth.py, RejectDialog.tsx, ElectricityPage.tsx, reports_repository.py, phase9_audit.py, ReportsPage.tsx, SecurityDashboardPage.tsx, admin_payment_service.py, payment_service.py, e2e_electricity_audit_p2.py, useVerification.ts, bulk_reject_service.py, reports.ts, hostel_service.py, dependencies.py, e2e_receipt_notification_audit.py, purge_tenants.py, rents.py, dashboard_service.py, test_admin_payments.py, payment_submission_service.py, conftest.py, __init__.py, 660c018dde32_create_performance_indexes.py, test_tenant_flow.py, auth_service.py, security_hold_service.py, receipts.py, export_service.py, step1_inventory.py, e2e_electricity_audit_p4.py, test_api.py, payment_completion_service.py, check_extra_missing_cols.py, useReports.ts, receipt_service.py, tenant_service.py, SmartVerificationDashboard.tsx, models.py, 6970b22fc35a_initial_migration.py, print_non_empty_tables.py, test_infra.py, test_tenant_payments.py, e2e_electricity_audit_p5.py, e2e_security_audit_p1.py, Timeline.tsx, maintenance.py, complaints.py, e2e_electricity_audit_p3.py, check_lockout.py, phase10_room_bed_availability_test.py, bank_statements.py, SecurityDialogs.tsx, reconciliation_service.py, reports.py, e2e_maintenance_audit_p6.py, tenants.py, security.py, unlock_account.py, step1_inventory3.py, print_indexes.py, verification.py, check_user.py |
| `apps/backend/app/tests/conftest.py` | Audit/Test script | 0 refs |
| `apps/backend/app/tests/reset_db.py` | Audit/Test script | 0 refs |
| `apps/backend/app/tests/test_admin_2_tenant_management.py` | Audit/Test script | 0 refs |
| `apps/backend/app/tests/test_admin_payments.py` | Audit/Test script | 0 refs |
| `apps/backend/app/tests/test_auth.py` | Audit/Test script | 0 refs |
| `apps/backend/app/tests/test_bank_statements.py` | Audit/Test script | 0 refs |
| `apps/backend/app/tests/test_billing_engine.py` | Audit/Test script | 0 refs |
| `apps/backend/app/tests/test_dashboard.py` | Audit/Test script | 0 refs |
| `apps/backend/app/tests/test_hostel_infra.py` | Audit/Test script | 0 refs |
| `apps/backend/app/tests/test_infra.py` | Audit/Test script | 0 refs |
| `apps/backend/app/tests/test_payment_foundation.py` | Audit/Test script | 0 refs |
| `apps/backend/app/tests/test_phase18.py` | Audit/Test script | 0 refs |
| `apps/backend/app/tests/test_phase20_rent_lifecycle.py` | Audit/Test script | 0 refs |
| `apps/backend/app/tests/test_security_fraud.py` | Audit/Test script | 0 refs |
| `apps/backend/app/tests/test_tenant_dashboard.py` | Audit/Test script | 0 refs |
| `apps/backend/app/tests/test_tenant_flow.py` | Audit/Test script | 0 refs |
| `apps/backend/app/tests/test_tenant_payments.py` | Audit/Test script | 0 refs |
| `apps/admin/src/features/tenant/components/CheckInDialog.tsx` | Audit/Test script | TenantManagementPage.tsx |
| `apps/admin/src/features/tenant/components/CheckOutDialog.tsx` | Audit/Test script | TenantManagementPage.tsx, TenantProfilePage.tsx, HostelManagementPage.tsx |

## Final Safety Report
- Files scanned: 614
- Definitely used: 376
- Probably used: 157
- Possibly unused: 0
- Probably dead: 9
- Definitely unused: 13
- Test/debug files: 59
- Files modified: 0
- Files deleted: 0
- Database modified: 0
