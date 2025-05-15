export interface AcsCode {
  id: string; // e.g., "CA.I.A.K1"
  description: string;
  area: string | null;
  task: string | null;
  sub_task: string | null;
  knowledge_area: string | null;
  exam_type: string; // e.g., "CAX", "PAR", "IRA"
  // created_at and updated_at are handled by the DB by default
  // and are not part of the data files or seeding script input.
}
