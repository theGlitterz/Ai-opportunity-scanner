import { QUESTIONS } from '../../data/questions';
import type { Answers, OpportunityTheme, ThemeSignal } from '../../types';

export const OPPORTUNITY_THEMES: OpportunityTheme[] = ['collections', 'inbound', 'workflow'];

function answerToFriction(value: number): number {
  return ((value - 1) / 4) * 100;
}

export function computeThemeSignals(answers: Answers): ThemeSignal[] {
  return OPPORTUNITY_THEMES.map((theme) => {
    const values = QUESTIONS
      .filter((question) => question.opportunityTheme === theme)
      .map((question) => answers[question.id])
      .filter((value): value is NonNullable<typeof value> => value !== undefined)
      .map(answerToFriction);

    const friction = values.length > 0
      ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
      : 0;

    return {
      theme,
      friction,
      // This is the higher-is-better health/readiness view used by the report.
      signal: 100 - friction,
      questionCount: values.length,
      highFrictionQuestionCount: values.filter((value) => value > 50).length,
    };
  });
}
