import test from "node:test";
import assert from "node:assert/strict";
import {
  rankMergedCandidates,
  reorderSourcesByCitation,
  selectDiverseCandidates,
} from "../src/services/retrievalUtils.ts";

test("rankMergedCandidates balances lexical overlap with vector similarity", () => {
  const ranked = rankMergedCandidates(
    [
      {
        key: "a",
        document_id: "doc-1",
        filename: "doc-1.pdf",
        content: "This section defines gradient descent and explains the update rule.",
        page_number: 2,
        chunk_index: 4,
        vectorSimilarity: 0.61,
        queryMatches: ["gradient descent update rule"],
        queryRanks: [2],
      },
      {
        key: "b",
        document_id: "doc-2",
        filename: "doc-2.pdf",
        content: "This page lists historical notes without the relevant algorithm details.",
        page_number: 9,
        chunk_index: 1,
        vectorSimilarity: 0.72,
        queryMatches: ["gradient descent update rule"],
        queryRanks: [1],
      },
    ],
    "What is the gradient descent update rule?"
  );

  assert.equal(ranked[0]?.key, "a");
  assert.ok(ranked[0].lexicalScore > ranked[1].lexicalScore);
});

test("selectDiverseCandidates avoids taking every chunk from the same page", () => {
  const selected = selectDiverseCandidates(
    [
      {
        key: "a",
        document_id: "doc-1",
        filename: "doc-1.pdf",
        content: "Pointer basics and memory address overview.",
        page_number: 4,
        chunk_index: 1,
        vectorSimilarity: 0.8,
        queryMatches: ["pointer basics"],
        queryRanks: [1],
        lexicalScore: 0.8,
        fusionScore: 0.6,
        score: 0.81,
      },
      {
        key: "b",
        document_id: "doc-1",
        filename: "doc-1.pdf",
        content: "Pointer basics and memory address overview with duplicate wording.",
        page_number: 4,
        chunk_index: 2,
        vectorSimilarity: 0.79,
        queryMatches: ["pointer basics"],
        queryRanks: [2],
        lexicalScore: 0.79,
        fusionScore: 0.58,
        score: 0.8,
      },
      {
        key: "c",
        document_id: "doc-2",
        filename: "doc-2.pdf",
        content: "Reference comparison section with different phrasing and another source.",
        page_number: 6,
        chunk_index: 1,
        vectorSimilarity: 0.74,
        queryMatches: ["pointer basics"],
        queryRanks: [3],
        lexicalScore: 0.73,
        fusionScore: 0.5,
        score: 0.75,
      },
    ],
    2,
    true
  );

  assert.equal(selected.length, 2);
  assert.notEqual(selected[0].document_id, selected[1].document_id);
});

test("reorderSourcesByCitation moves cited sources to the front", () => {
  const ordered = reorderSourcesByCitation(
    [
      { sourceId: "S1", label: "first" },
      { sourceId: "S2", label: "second" },
      { sourceId: "S3", label: "third" },
    ],
    "The answer cites [S3] before [S1]."
  );

  assert.deepEqual(
    ordered.map((source) => source.sourceId),
    ["S3", "S1", "S2"]
  );
});
