import { describe, it, expect } from "vitest";
import {
  scoreAssessment,
  getAssessmentTemplate,
  ASSESSMENT_TEMPLATES,
} from "./assessments";

describe("scoreAssessment", () => {
  it("sums PHQ-9 answers and maps to the right severity band", () => {
    const phq9 = getAssessmentTemplate("phq9")!;
    const allZeros = new Array(9).fill(0);
    expect(scoreAssessment(phq9, allZeros)).toEqual({
      score: 0,
      maxScore: 27,
      severity: "Mínimo",
    });

    const moderate = [2, 2, 1, 2, 1, 1, 1, 0, 0]; // soma = 10
    expect(scoreAssessment(phq9, moderate)).toEqual({
      score: 10,
      maxScore: 27,
      severity: "Moderado",
    });

    const allMax = new Array(9).fill(3); // soma = 27
    expect(scoreAssessment(phq9, allMax)).toEqual({
      score: 27,
      maxScore: 27,
      severity: "Grave",
    });
  });

  it("sums GAD-7 answers and maps to the right severity band", () => {
    const gad7 = getAssessmentTemplate("gad7")!;
    const severe = new Array(7).fill(3); // soma = 21
    expect(scoreAssessment(gad7, severe).severity).toBe("Grave");
  });

  it("averages Roda da Vida answers instead of summing", () => {
    const wheel = getAssessmentTemplate("roda-da-vida")!;
    const answers = [8, 8, 8, 8, 8, 8, 8, 8]; // média 8
    expect(scoreAssessment(wheel, answers)).toEqual({
      score: 8,
      maxScore: 10,
      severity: "Alta satisfação",
    });
  });

  it("rejects a mismatched number of answers", () => {
    const phq9 = getAssessmentTemplate("phq9")!;
    expect(() => scoreAssessment(phq9, [0, 1, 2])).toThrow();
  });

  it("rejects an out-of-range answer", () => {
    const phq9 = getAssessmentTemplate("phq9")!;
    const answers = new Array(9).fill(0);
    answers[0] = 4; // likert4 só vai até 3
    expect(() => scoreAssessment(phq9, answers)).toThrow();
  });

  it("every template has a severity band covering its full score range", () => {
    for (const template of ASSESSMENT_TEMPLATES) {
      const maxPerQuestion = template.responseType === "likert4" ? 3 : 10;
      const maxTotal =
        template.responseType === "scale0to10"
          ? 10
          : template.questions.length * maxPerQuestion;
      const bandsCoverMax = template.severityBands.some((b) => b.max >= maxTotal);
      const bandsCoverMin = template.severityBands.some((b) => b.min <= 0);
      expect(bandsCoverMax).toBe(true);
      expect(bandsCoverMin).toBe(true);
    }
  });
});
