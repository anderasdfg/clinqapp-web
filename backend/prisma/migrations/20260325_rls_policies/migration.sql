CREATE POLICY "users_select_own" ON users FOR SELECT TO authenticated USING (auth_id = auth.uid());

CREATE POLICY "users_update_own" ON users FOR UPDATE TO authenticated USING (auth_id = auth.uid());

CREATE POLICY "organizations_select_own" ON organizations FOR SELECT TO authenticated USING (id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "patients_org_access" ON patients FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "appointments_org_access" ON appointments FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "services_org_access" ON services FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "schedules_org_access" ON schedules FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "treatments_org_access" ON treatments FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "treatment_images_org_access" ON treatment_images FOR ALL TO authenticated USING (treatment_id IN (SELECT t.id FROM treatments t WHERE t.organization_id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid())));

CREATE POLICY "coupons_org_access" ON coupons FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "payments_org_access" ON payments FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "payment_method_configs_org_access" ON payment_method_configs FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "consultation_type_configs_org_access" ON consultation_type_configs FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "invitations_org_access" ON invitations FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid()));
