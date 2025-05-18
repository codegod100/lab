import { InferenceClient } from "@huggingface/inference";

// Initialize with your Hugging Face token
const hf = new InferenceClient(process.env.HUGGINGFACE_ACCESS_TOKEN);
const MODEL_NAME = "meta-llama/Llama-3.3-70B-Instruct";

// Language map with common language codes and their display names
const LANGUAGE_MAP = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  ar: "Arabic",
  hi: "Hindi",
} as const;

type LanguageCode = keyof typeof LANGUAGE_MAP;

// Function to validate language code
function isValidLanguageCode(code: string): code is LanguageCode {
  return code in LANGUAGE_MAP;
}

// Translation function using Llama 3.3 70B Instruct
async function streamTranslation(
  text: string,
  targetLanguage: LanguageCode = "fr"
): Promise<string> {
  if (!isValidLanguageCode(targetLanguage)) {
    throw new Error(
      `Unsupported language code: ${targetLanguage}. Supported codes: ${Object.keys(LANGUAGE_MAP).join(", ")}`
    );
  }

  const targetLanguageName = LANGUAGE_MAP[targetLanguage];
  const prompt = `Translate the following text to ${targetLanguageName}. Only respond with the translation, nothing else.\n\nText: ${text}`;

  console.log(`Translating to ${targetLanguageName} using ${MODEL_NAME}...`);
  
  try {
    // Using chat API for the model
    const response = await hf.chatCompletion({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content: "You are a helpful translation assistant. You only respond with the translated text, append pronunciation in brackets."
        },
        {
          role: "user",
          content: `Translate the following text to ${targetLanguageName}: ${text}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const translatedText = response.choices?.[0]?.message?.content?.trim();
    if (!translatedText) {
      throw new Error('No translation was generated');
    }

    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error(`Translation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Example usage with all available languages
async function runExamples() {
  const text = "today is a good day";
  
  try {
    console.log("\nTranslating to all available languages:");
    const results: Record<string, string> = {};
    
    // Get all available language codes
    const languageCodes = Object.keys(LANGUAGE_MAP) as LanguageCode[];
    
    // Translate to all available languages
    for (const lang of languageCodes) {
      try {
        const langName = LANGUAGE_MAP[lang];
        console.log(`\nTranslating to ${langName} (${lang}):`);
        results[lang] = await streamTranslation(text, lang);
      } catch (error) {
        console.error(`Error translating to ${lang}:`, error instanceof Error ? error.message : 'Unknown error');
        results[lang] = 'Translation failed';
      }
    }
    
    // Display all results
    console.log("\n\nTranslation Results:");
    console.log(`Original: ${text}`);
    for (const [lang, translation] of Object.entries(results)) {
      const langName = LANGUAGE_MAP[lang as LanguageCode] || lang;
      console.log(`${langName} (${lang}): ${translation}`);
    }
    
  } catch (error) {
    console.error("Translation error:", error);
  }
}

// Run the examples
runExamples().catch(console.error);