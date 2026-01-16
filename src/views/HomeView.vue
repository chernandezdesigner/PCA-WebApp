<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Loading Overlay -->
    <div 
      v-if="assessmentStore.loading" 
      class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl p-8 shadow-xl flex flex-col items-center border border-gray-200 max-w-sm w-full mx-4">
        <div class="relative">
          <div class="h-12 w-12 rounded-full border-4 border-gray-200"></div>
          <div class="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
        <p class="text-gray-700 font-medium mt-4 text-center">Loading assessments...</p>
        <p class="text-gray-500 text-sm mt-2 text-center">Please wait while we fetch your data</p>
      </div>
    </div>

    <!-- Header -->
    <nav class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div class="max-w-[1920px] mx-auto px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-3">
            <h1 class="text-xl font-bold text-gray-900">PCA Report Dashboard</h1>
            <span class="text-xs font-medium text-gray-500 hidden md:inline">
              Commercial Property Assessment Reports
            </span>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600 hidden sm:inline">
              {{ authStore.user?.email }}
            </span>
            <button
              class="form-button form-button-secondary"
              @click="handleLogout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-[1920px] mx-auto px-6 lg:px-8 py-8 space-y-6">
      <!-- Stats Cards -->
      <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Drafts</p>
              <p class="text-2xl font-bold text-gray-900">{{ assessmentStore.draftCount }}</p>
            </div>
            <div class="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
              <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Submitted</p>
              <p class="text-2xl font-bold text-gray-900">{{ assessmentStore.submittedCount }}</p>
            </div>
            <div class="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
              <svg class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Synced</p>
              <p class="text-2xl font-bold text-gray-900">{{ assessmentStore.syncedCount }}</p>
            </div>
            <div class="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <svg class="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <!-- Filters & Actions -->
      <section class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex flex-col lg:flex-row lg:items-end gap-4">
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-900">Assessments</h2>
            <p class="text-sm text-gray-600">
              Property assessments from the mobile app ready for report writing.
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div class="relative w-full sm:w-72">
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                class="form-input pl-10"
                type="text"
                placeholder="Search by address, project, city..."
              />
            </div>
            <select v-model="statusFilter" class="form-input sm:w-44">
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="synced">Synced</option>
            </select>
            <button 
              class="form-button form-button-primary sm:w-auto"
              @click="handleNewAssessment"
              :disabled="assessmentStore.loading"
            >
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              New Assessment
            </button>
          </div>
        </div>
      </section>

      <!-- Error Message -->
      <div v-if="assessmentStore.error" class="bg-red-50 border border-red-200 rounded-xl p-4">
        <div class="flex items-center gap-3">
          <svg class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-red-700 text-sm">{{ assessmentStore.error }}</p>
          <button 
            @click="assessmentStore.fetchAssessments()"
            class="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>

      <!-- Assessments Table -->
      <section class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Assessment Queue
            </h3>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
              {{ filteredAssessments.length }} total
            </span>
          </div>
          <button 
            @click="assessmentStore.fetchAssessments()"
            class="form-button form-button-secondary text-xs"
            :disabled="assessmentStore.loading"
          >
            <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        <!-- Desktop Table -->
        <div class="overflow-x-auto hidden lg:block">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-white">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-[10%]">Status</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-[15%]">Project</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-[25%]">Property Address</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-[15%]">Location</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-[12%]">Inspector</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-[13%]">Updated</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr
                v-for="assessment in filteredAssessments"
                :key="assessment.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <!-- Status -->
                <td class="px-4 py-4">
                  <span
                    :class="[
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                      statusStyles[assessment.status]
                    ]"
                  >
                    <span :class="['h-1.5 w-1.5 rounded-full mr-1.5', statusDotStyles[assessment.status]]"></span>
                    {{ statusLabels[assessment.status] }}
                  </span>
                </td>

                <!-- Project -->
                <td class="px-4 py-4">
                  <div class="text-sm font-semibold text-gray-900 truncate">
                    {{ assessment.project_name || 'Untitled Project' }}
                  </div>
                  <div class="text-xs text-gray-500 truncate">
                    {{ assessment.project_number ? `#${assessment.project_number}` : 'No project number' }}
                  </div>
                </td>

                <!-- Property Address -->
                <td class="px-4 py-4">
                  <div class="text-sm text-gray-900 font-medium truncate" :title="assessment.property_address">
                    {{ assessment.property_address || 'No address provided' }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ assessment.year_built ? `Built ${assessment.year_built}` : '' }}
                    {{ assessment.number_of_buildings ? ` • ${assessment.number_of_buildings} building(s)` : '' }}
                  </div>
                </td>

                <!-- Location -->
                <td class="px-4 py-4 text-sm text-gray-600">
                  <span class="flex items-center gap-1.5">
                    <svg class="h-3 w-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="truncate">
                      {{ assessment.property_city || '-' }}{{ assessment.property_state ? `, ${assessment.property_state}` : '' }}
                    </span>
                  </span>
                </td>

                <!-- Inspector -->
                <td class="px-4 py-4 text-sm text-gray-600 truncate">
                  {{ assessment.inspector_name || '-' }}
                </td>

                <!-- Updated -->
                <td class="px-4 py-4 text-sm text-gray-600" :title="formatDateFull(assessment.updated_at)">
                  {{ formatDateRelative(assessment.updated_at) }}
                </td>

                <!-- Actions -->
                <td class="px-4 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button 
                      class="form-button form-button-primary text-xs"
                      @click="openAssessment(assessment.id)"
                    >
                      Open
                    </button>
                    <button 
                      class="form-button form-button-secondary text-xs"
                      @click="confirmDelete(assessment.id)"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="filteredAssessments.length === 0 && !assessmentStore.loading">
                <td colspan="7" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center">
                    <svg class="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p class="text-gray-500 font-medium text-lg">No assessments found</p>
                    <p class="text-gray-400 text-sm mt-1">
                      {{ searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create a new assessment or sync from the mobile app' }}
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View -->
        <div class="lg:hidden divide-y divide-gray-200">
          <div 
            v-for="assessment in filteredAssessments" 
            :key="assessment.id"
            class="p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="space-y-3">
              <!-- Header: Status -->
              <div class="flex items-center justify-between">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    statusStyles[assessment.status]
                  ]"
                >
                  <span :class="['h-1.5 w-1.5 rounded-full mr-1.5', statusDotStyles[assessment.status]]"></span>
                  {{ statusLabels[assessment.status] }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ formatDateRelative(assessment.updated_at) }}
                </span>
              </div>

              <!-- Project Name -->
              <div>
                <div class="text-base font-semibold text-gray-900">
                  {{ assessment.project_name || 'Untitled Project' }}
                </div>
                <div class="text-sm text-gray-600 mt-0.5">
                  {{ assessment.project_number ? `#${assessment.project_number}` : 'No project number' }}
                </div>
              </div>

              <!-- Address -->
              <div class="text-sm text-gray-700">
                <div class="font-medium">{{ assessment.property_address || 'No address provided' }}</div>
                <div class="flex items-center gap-1.5 mt-1 text-gray-500">
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>{{ assessment.property_city || '-' }}{{ assessment.property_state ? `, ${assessment.property_state}` : '' }}</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between pt-2">
                <div class="text-xs text-gray-500">
                  Inspector: {{ assessment.inspector_name || '-' }}
                </div>
                <div class="flex items-center gap-2">
                  <button 
                    class="form-button form-button-primary text-xs"
                    @click="openAssessment(assessment.id)"
                  >
                    Open
                  </button>
                  <button 
                    class="form-button form-button-secondary text-xs"
                    @click="confirmDelete(assessment.id)"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State Mobile -->
          <div v-if="filteredAssessments.length === 0 && !assessmentStore.loading" class="p-8 text-center">
            <div class="flex flex-col items-center">
              <svg class="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-gray-500 font-medium text-lg">No assessments found</p>
              <p class="text-gray-400 text-sm mt-1">Create a new assessment or sync from mobile</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteModalOpen" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-200">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900">Delete Assessment</h3>
            </div>
          </div>
          <p class="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to delete this assessment? This action cannot be undone and all related data will be permanently removed.
          </p>
        </div>
        <div class="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end gap-3">
          <button 
            @click="deleteModalOpen = false" 
            class="form-button form-button-secondary"
          >
            Cancel
          </button>
          <button 
            @click="handleDelete"
            class="form-button bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useAssessmentStore } from '../stores/assessmentStore';
import type { AssessmentStatus, AssessmentListItem } from '../types/database';

const router = useRouter();
const authStore = useAuthStore();
const assessmentStore = useAssessmentStore();

// Filters
const searchQuery = ref('');
const statusFilter = ref<'all' | AssessmentStatus>('all');

// Delete modal
const deleteModalOpen = ref(false);
const assessmentToDelete = ref<string | null>(null);

// Status styling
const statusStyles: Record<AssessmentStatus, string> = {
  draft: 'bg-blue-50 text-blue-700 border-blue-200',
  submitted: 'bg-amber-50 text-amber-700 border-amber-200',
  synced: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const statusDotStyles: Record<AssessmentStatus, string> = {
  draft: 'bg-blue-400',
  submitted: 'bg-amber-400',
  synced: 'bg-emerald-500',
};

const statusLabels: Record<AssessmentStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  synced: 'Synced',
};

// Filtered assessments
const filteredAssessments = computed<AssessmentListItem[]>(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return assessmentStore.assessments.filter((assessment: AssessmentListItem) => {
    const matchesStatus =
      statusFilter.value === 'all' || assessment.status === statusFilter.value;
    const matchesQuery =
      !query ||
      (assessment.project_name?.toLowerCase().includes(query)) ||
      (assessment.project_number?.toLowerCase().includes(query)) ||
      (assessment.property_address?.toLowerCase().includes(query)) ||
      (assessment.property_city?.toLowerCase().includes(query)) ||
      (assessment.inspector_name?.toLowerCase().includes(query));
    return matchesStatus && matchesQuery;
  });
});

// Date formatting
function formatDateRelative(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? 'Just now' : `${diffMins} mins ago`;
    }
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

function formatDateFull(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Actions
async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}

async function handleNewAssessment() {
  const assessment = await assessmentStore.createAssessment();
  if (assessment) {
    // TODO: Navigate to the report editor
    // router.push(`/report/${assessment.id}`);
    console.log('Created new assessment:', assessment.id);
  }
}

function openAssessment(id: string) {
  // TODO: Navigate to the report editor
  // router.push(`/report/${id}`);
  console.log('Open assessment:', id);
}

function confirmDelete(id: string) {
  assessmentToDelete.value = id;
  deleteModalOpen.value = true;
}

async function handleDelete() {
  if (assessmentToDelete.value) {
    await assessmentStore.deleteAssessment(assessmentToDelete.value);
    assessmentToDelete.value = null;
    deleteModalOpen.value = false;
  }
}

// Fetch assessments on mount
onMounted(() => {
  assessmentStore.fetchAssessments();
});
</script>
