'use client';

import React, { createContext, useCallback, useContext, useReducer } from 'react';
import type { AppStep, ProfitOpportunityReport, ScannerAnswers, ScannerAnswerValue, ScannerProfile } from '../types';

type UIState = {
  step: AppStep;
  profileErrors: Partial<Record<keyof ScannerProfile, string>>;
  assessmentError: string | null;
};

export type AppState = {
  profile: ScannerProfile;
  responses: ScannerAnswers;
  ui: UIState;
  results: ProfitOpportunityReport | null;
  scan: { id: string; completedAt: string } | null;
  referralSource: string;
};

const initialState: AppState = {
  profile: { companyName: '', sector: '', revenueBand: '', employeeBand: '', geography: '', revenueModel: '', operatingModel: '' },
  responses: {},
  ui: { step: 'profile', profileErrors: {}, assessmentError: null },
  results: null,
  scan: null,
  referralSource: '',
};

type Action =
  | { type: 'SET_PROFILE_FIELD'; field: keyof ScannerProfile; value: string }
  | { type: 'SET_ANSWER'; questionId: string; value: ScannerAnswerValue }
  | { type: 'SET_STEP'; step: AppStep }
  | { type: 'SET_PROFILE_ERRORS'; errors: Partial<Record<keyof ScannerProfile, string>> }
  | { type: 'SET_ASSESSMENT_ERROR'; error: string | null }
  | { type: 'SET_RESULTS'; results: ProfitOpportunityReport; scan: { id: string; completedAt: string } }
  | { type: 'SET_REFERRAL_SOURCE'; referralSource: string }
  | { type: 'RESET' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PROFILE_FIELD':
      return { ...state, profile: { ...state.profile, [action.field]: action.value }, ui: { ...state.ui, profileErrors: { ...state.ui.profileErrors, [action.field]: undefined } } };
    case 'SET_ANSWER':
      return { ...state, responses: { ...state.responses, [action.questionId]: action.value }, ui: { ...state.ui, assessmentError: null } };
    case 'SET_STEP': return { ...state, ui: { ...state.ui, step: action.step } };
    case 'SET_PROFILE_ERRORS': return { ...state, ui: { ...state.ui, profileErrors: action.errors } };
    case 'SET_ASSESSMENT_ERROR': return { ...state, ui: { ...state.ui, assessmentError: action.error } };
    case 'SET_RESULTS': return { ...state, results: action.results, scan: action.scan };
    case 'SET_REFERRAL_SOURCE': return { ...state, referralSource: action.referralSource };
    case 'RESET': return { ...initialState, referralSource: state.referralSource };
    default: return state;
  }
}

type AssessmentContextValue = { state: AppState; dispatch: React.Dispatch<Action> };
const AssessmentContext = createContext<AssessmentContextValue | null>(null);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AssessmentContext.Provider value={{ state, dispatch }}>{children}</AssessmentContext.Provider>;
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) throw new Error('useAssessment must be used within AssessmentProvider');
  return context;
}

export function useProfile() {
  const { state, dispatch } = useAssessment();
  const setField = useCallback((field: keyof ScannerProfile, value: string) => dispatch({ type: 'SET_PROFILE_FIELD', field, value }), [dispatch]);
  return { profile: state.profile, errors: state.ui.profileErrors, setField };
}

export function useResponses() {
  const { state, dispatch } = useAssessment();
  const setAnswer = useCallback((questionId: string, value: ScannerAnswerValue) => dispatch({ type: 'SET_ANSWER', questionId, value }), [dispatch]);
  return { responses: state.responses, setAnswer };
}
