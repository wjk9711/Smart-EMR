import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Patient, Visit } from '@/types/patient'

export const usePatientStore = defineStore('patient', () => {
  const currentPatient = ref<Patient | null>(null)
  const currentVisit = ref<Visit | null>(null)

  function setCurrentPatient(patient: Patient | null) {
    currentPatient.value = patient
  }

  function setCurrentVisit(visit: Visit | null) {
    currentVisit.value = visit
  }

  function clearCurrent() {
    currentPatient.value = null
    currentVisit.value = null
  }

  return {
    currentPatient,
    currentVisit,
    setCurrentPatient,
    setCurrentVisit,
    clearCurrent,
  }
})
