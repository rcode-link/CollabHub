import { defineStore } from "pinia";
import { ref } from "vue";
import { toast } from "vue3-toastify";

export const useVacationGroupStore = defineStore("vacationGroupStore", () => {
  const groups = ref([]);
  const loading = ref(false);
  const myStats = ref([]);
  const userStats = ref(null);
  const userAllocations = ref([]);

  const loadGroups = async () => {
    loading.value = true;
    try {
      const res = await window.axios.get("/api/v1/vacation-groups");
      groups.value = res.data.data;
    } finally {
      loading.value = false;
    }
  };

  const createGroup = async (data) => {
    await window.axios.post("/api/v1/vacation-groups", data);
    await loadGroups();
  };

  const updateGroup = async (id, data) => {
    await window.axios.put(`/api/v1/vacation-groups/${id}`, data);
    await loadGroups();
  };

  const deleteGroup = async (id) => {
    await window.axios.delete(`/api/v1/vacation-groups/${id}`);
    await loadGroups();
    toast.success("Vacation group deleted");
  };

  const loadAllocations = async (groupId) => {
    const res = await window.axios.get(`/api/v1/vacation-groups/${groupId}/users`);
    userAllocations.value = res.data.data;
  };

  const setAllocation = async (groupId, userId, daysAllocated) => {
    await window.axios.post(`/api/v1/vacation-groups/${groupId}/users`, {
      user_id: userId,
      days_allocated: daysAllocated,
    });
    await loadAllocations(groupId);
  };

  const removeAllocation = async (groupId, userId) => {
    await window.axios.delete(`/api/v1/vacation-groups/${groupId}/users/${userId}`);
    await loadAllocations(groupId);
  };

  const loadMyStats = async () => {
    const res = await window.axios.get("/api/v1/vacation/my-stats");
    myStats.value = res.data.data;
  };

  const loadUserStats = async (userId) => {
    const res = await window.axios.get(`/api/v1/vacation/user-stats/${userId}`);
    userStats.value = res.data.data;
  };

  return {
    groups,
    loading,
    myStats,
    userStats,
    userAllocations,
    loadGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    loadAllocations,
    setAllocation,
    removeAllocation,
    loadMyStats,
    loadUserStats,
  };
});
