'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { AppStep, CompanyProfile, Answers, ReportResults, ScaleValue } from '../types';

// ─── State ────────────────────────────────────────────────────────────────────

type ProfileState = CompanyProfile;

type UIState = {
  step: AppStep;
  profileErrors: Partial<Record<keyof CompanyProfile, string>>;
  assessmentError: string | null;
};

export type AppState = {
  profile: ProfileState;
  responses: Answers;
  ui: UIState;
  results: ReportResults | null;
};

const initialProfile: ProfileState = {
  companyName: '',
  industryCluster: '',
  revenueBand: '',
  employeeBand: '',
  businessPriority: '',
  operatingModel: '',
  geography: '',
  currentAIUsage: '',
  consultantNotes: '',
};

const initialState: AppState = {
  profile: initialProfile,
  responses: {},
ui: {
  step: 'profile',
  profileErrors: {},
  assessmentError: null,
},
  results: null,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_PROFILE_FIELD'; field: keyof CompanyProfile; value: string }
  | { type: 'SET_ANSWER'; questionId: string; value: ScaleValue }
  | { type: 'SET_STEP'; step: AppStep }
  | { type: 'SET_PROFILE_ERRORS'; errors: Partial<Record<keyof CompanyProfile, string>> }
  | { type: 'SET_ASSESSMENT_ERROR'; error: string | null }
  | { type: 'SET_RESULTS'; results: ReportResults }
  | { type: 'RESET' };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PROFILE_FIELD':
      return {
        ...state,
        profile: { ...state.profile, [action.field]: action.value },
        ui: { ...state.ui, profileErrors: { ...state.ui.profileErrors, [action.field]: undefined } },
      };
    case 'SET_ANSWER':
      return { ...state, responses: { ...state.responses, [action.questionId]: action.value } };
    case 'SET_STEP':
      return { ...state, ui: { ...state.ui, step: action.step } };
    case 'SET_PROFILE_ERRORS':
      return { ...state, ui: { ...state.ui, profileErrors: action.errors } };
    case 'SET_ASSESSMENT_ERROR':
      return { ...state, ui: { ...state.ui, assessmentError: action.error } };
    case 'SET_RESULTS':
      return { ...state, results: action.results };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

type AssessmentContextValue = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
};

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AssessmentContext.Provider value={{ state, dispatch }}>
      {children}
    </AssessmentContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAssessment() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error('useAssessment must be used within AssessmentProvider');
  return ctx;
}

export function useProfile() {
  const { state, dispatch } = useAssessment();
  const setField = useCallback((field: keyof CompanyProfile, value: string) => {
    dispatch({ type: 'SET_PROFILE_FIELD', field, value });
  }, [dispatch]);
  return { profile: state.profile, errors: state.ui.profileErrors, setField };
}

export function useResponses() {
  const { state, dispatch } = useAssessment();
  const setAnswer = useCallback((questionId: string, value: ScaleValue) => {
    dispatch({ type: 'SET_ANSWER', questionId, value });
  }, [dispatch]);
  return { responses: state.responses, setAnswer };
}
