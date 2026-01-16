import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/services/supabase';
import type { AssessmentListItem, AssessmentStatus } from '@/types/database';

export const useAssessmentStore = defineStore('assessment', () => {
  const assessments = ref<AssessmentListItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Fetch all assessments with project summary data for the dashboard
  async function fetchAssessments() {
    loading.value = true;
    error.value = null;

    try {
      // Query assessments joined with project_summaries for display data
      const { data, error: fetchError } = await supabase
        .from('assessments')
        .select(`
          id,
          status,
          created_at,
          updated_at,
          project_summaries (
            project_name,
            project_number,
            property_address,
            property_city,
            property_state,
            inspector_name,
            year_built,
            number_of_buildings
          )
        `)
        .order('updated_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transform the data to flatten project_summaries into the assessment
      assessments.value = (data || []).map((item: any) => ({
        id: item.id,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
        project_name: item.project_summaries?.project_name,
        project_number: item.project_summaries?.project_number,
        property_address: item.project_summaries?.property_address,
        property_city: item.project_summaries?.property_city,
        property_state: item.project_summaries?.property_state,
        inspector_name: item.project_summaries?.inspector_name,
        year_built: item.project_summaries?.year_built,
        number_of_buildings: item.project_summaries?.number_of_buildings,
      }));

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch assessments';
      console.error('Error fetching assessments:', err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Get a single assessment by ID with all related data
  async function fetchAssessmentById(id: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('assessments')
        .select(`
          *,
          project_summaries (*),
          site_grounds (*),
          building_envelope (*),
          mechanical_systems (*),
          photos (*)
        `)
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch assessment';
      console.error('Error fetching assessment:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Create a new assessment
  async function createAssessment() {
    loading.value = true;
    error.value = null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create the main assessment record
      const { data: assessment, error: createError } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          status: 'draft' as AssessmentStatus,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Create empty related records
      const assessmentId = assessment.id;

      await Promise.all([
        supabase.from('project_summaries').insert({ assessment_id: assessmentId }),
        supabase.from('site_grounds').insert({ assessment_id: assessmentId }),
        supabase.from('building_envelope').insert({ assessment_id: assessmentId }),
        supabase.from('mechanical_systems').insert({ assessment_id: assessmentId }),
      ]);

      // Refresh the list
      await fetchAssessments();

      return assessment;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create assessment';
      console.error('Error creating assessment:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Update assessment status
  async function updateAssessmentStatus(id: string, status: AssessmentStatus) {
    loading.value = true;
    error.value = null;

    try {
      const { error: updateError } = await supabase
        .from('assessments')
        .update({ status })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      const index = assessments.value.findIndex(a => a.id === id);
      if (index !== -1) {
        assessments.value[index].status = status;
      }

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update assessment';
      console.error('Error updating assessment:', err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Delete an assessment
  async function deleteAssessment(id: string) {
    loading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from('assessments')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Remove from local state
      assessments.value = assessments.value.filter(a => a.id !== id);

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete assessment';
      console.error('Error deleting assessment:', err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Computed: count by status
  const draftCount = computed(() => 
    assessments.value.filter(a => a.status === 'draft').length
  );
  
  const submittedCount = computed(() => 
    assessments.value.filter(a => a.status === 'submitted').length
  );
  
  const syncedCount = computed(() => 
    assessments.value.filter(a => a.status === 'synced').length
  );

  return {
    assessments,
    loading,
    error,
    draftCount,
    submittedCount,
    syncedCount,
    fetchAssessments,
    fetchAssessmentById,
    createAssessment,
    updateAssessmentStatus,
    deleteAssessment,
  };
});
