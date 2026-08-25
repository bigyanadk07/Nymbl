// market/text-analyzer/text-analyzer.service.js

const AVERAGE_READING_WORDS_PER_MINUTE = 200;

/**
 * Analyzes a block of text and returns descriptive statistics.
 *
 * Assumes `text` has already been validated as a non-empty
 * string by the controller layer.
 */
const analyzeText = (text) => {

  const totalCharacters = text.length;

  const charactersExcludingSpaces =
    text.replace(/\s/g, '').length;


  // ----------------------------------------------------------
  // Word count
  // ----------------------------------------------------------

  const words =
    text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);

  const wordCount = words.length;


  // ----------------------------------------------------------
  // Sentence count
  //
  // Splits on ., !, or ? followed by whitespace/end-of-string,
  // then filters out empty fragments (e.g. trailing punctuation
  // or consecutive delimiters).
  // ----------------------------------------------------------

  const sentences =
    text
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0);

  const sentenceCount = sentences.length;


  // ----------------------------------------------------------
  // Paragraph count
  //
  // Paragraphs are separated by one or more blank lines.
  // ----------------------------------------------------------

  const paragraphs =
    text
      .split(/\n\s*\n/)
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0);

  // Text with no blank-line breaks still counts as one paragraph,
  // as long as it has any non-whitespace content.
  const paragraphCount =
    paragraphs.length > 0
      ? paragraphs.length
      : (text.trim().length > 0 ? 1 : 0);


  // ----------------------------------------------------------
  // Average word length
  // ----------------------------------------------------------

  const totalWordCharacters =
    words.reduce((sum, word) => sum + word.length, 0);

  const averageWordLength =
    wordCount > 0
      ? Number((totalWordCharacters / wordCount).toFixed(2))
      : 0;


  // ----------------------------------------------------------
  // Estimated reading time (seconds)
  // ----------------------------------------------------------

  const estimatedReadingTimeSeconds =
    Math.ceil(
      (wordCount / AVERAGE_READING_WORDS_PER_MINUTE) * 60
    );


  return {
    totalCharacters,
    charactersExcludingSpaces,
    wordCount,
    sentenceCount,
    paragraphCount,
    averageWordLength,
    estimatedReadingTimeSeconds
  };

};

module.exports = {
  analyzeText
};