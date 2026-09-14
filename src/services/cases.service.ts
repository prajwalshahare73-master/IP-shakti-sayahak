import { CaseRecord, CaseEvent, useAppStore } from '../store/appStore';
import { supabase, isSupabaseConfigured } from './supabase';

export const casesService = {
  async getCases(): Promise<CaseRecord[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data as CaseRecord[];
        }
      } catch (err) {
        console.warn('Supabase getCases failed, falling back to local store:', err);
      }
    }
    return useAppStore.getState().cases;
  },

  async getCaseById(caseId: string): Promise<CaseRecord | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .eq('id', caseId)
          .single();
        if (!error && data) {
          return data as CaseRecord;
        }
      } catch (err) {
        console.warn(`Supabase getCaseById ${caseId} failed:`, err);
      }
    }
    const local = useAppStore.getState().cases.find((c) => c.id === caseId);
    return local || null;
  },

  async createCase(newCaseData: Partial<CaseRecord>): Promise<CaseRecord> {
    const caseId = newCaseData.id || `IPS-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const createdRecord: CaseRecord = {
      id: caseId,
      title: newCaseData.title || 'Untitled Ayurvedic Inquiry',
      query: newCaseData.query || '',
      domain: newCaseData.domain || 'Ayurveda Intellectual Property',
      jurisdiction: newCaseData.jurisdiction || 'India',
      status: 'SUBMITTED',
      createdAt: now,
      updatedAt: now,
      confidenceLevel: newCaseData.confidenceLevel || 'medium',
      escalated: Boolean(newCaseData.escalated),
      escalationReason: newCaseData.escalationReason,
      assignedExpertCategory: newCaseData.assignedExpertCategory || 'Traditional Knowledge / Patent Specialist',
      assignedExpertName: newCaseData.assignedExpertName || 'Dr. V. Sharma (Empanelled)',
      caseProfile: newCaseData.caseProfile,
      aiAnswer: newCaseData.aiAnswer,
      events: [
        {
          id: `ev-${Date.now()}-1`,
          timestamp: now,
          title: 'Case Dossier Created',
          description: `Citizen submitted inquiry ${caseId} for processing.`,
          actor: 'user',
          status: 'SUBMITTED'
        },
        ...(newCaseData.events || [])
      ]
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('cases').insert([createdRecord]);
      } catch (err) {
        console.warn('Supabase insert failed:', err);
      }
    }

    useAppStore.getState().addCase(createdRecord);
    return createdRecord;
  },

  async updateCase(caseId: string, updates: Partial<CaseRecord>): Promise<CaseRecord | null> {
    const now = new Date().toISOString();
    const updatedPayload = { ...updates, updatedAt: now };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('cases').update(updatedPayload).eq('id', caseId);
      } catch (err) {
        console.warn('Supabase update failed:', err);
      }
    }

    useAppStore.getState().updateCase(caseId, updatedPayload);
    return casesService.getCaseById(caseId);
  },

  async addEvent(caseId: string, event: Omit<CaseEvent, 'id' | 'timestamp'>): Promise<void> {
    const existing = await casesService.getCaseById(caseId);
    if (!existing) return;

    const newEvent: CaseEvent = {
      id: `ev-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...event
    };

    await casesService.updateCase(caseId, {
      events: [...existing.events, newEvent]
    });
  }
};
