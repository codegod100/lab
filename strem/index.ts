import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HUGGINGFACE_ACCESS_TOKEN);

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

// Translation function with multi-language support
async function streamTranslation(
  text: string,
  targetLanguage: LanguageCode = "fr"
): Promise<string> {
  if (!isValidLanguageCode(targetLanguage)) {
    throw new Error(
      `Unsupported language code: ${targetLanguage}. Supported codes: ${Object.keys(LANGUAGE_MAP).join(", ")}`
    );
  }

  // Map language codes to their respective models
  const modelMap = {
    fr: "Helsinki-NLP/opus-mt-en-fr",
    es: "Helsinki-NLP/opus-mt-en-es"
  } as const;
  
  type SupportedLanguage = keyof typeof modelMap;
  
  // Check if the target language is supported
  if (!(targetLanguage in modelMap)) {
    throw new Error(`Unsupported target language: ${targetLanguage}. Supported languages: ${Object.keys(modelMap).join(', ')}`);
  }
  
  const modelName = modelMap[targetLanguage as SupportedLanguage];

  console.log(`Translating to ${LANGUAGE_MAP[targetLanguage]}...`);
  
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${modelName}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text,
          options: {
            wait_for_model: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Translation failed with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    // Handle array response with translation_text field
    if (Array.isArray(result) && result.length > 0) {
      if (result[0].translation_text) {
        return result[0].translation_text.trim();
      }
      if (result[0].generated_text) {
        return result[0].generated_text.trim();
      }
    }
    
    // Handle direct object response
    if (result.translation_text) {
      return result.translation_text.trim();
    }
    if (result.generated_text) {
      return result.generated_text.trim();
    }
    
    // If the response is just a string
    if (typeof result === 'string') {
      return result.trim();
    }
    
    console.error('Unexpected response format:', JSON.stringify(result, null, 2));
    throw new Error('Unexpected response format from translation service');
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

// Example usage with multiple languages
async function runExamples() {
  const text = "Hello world, how are you today?";
  
  try {
    // Translate to French
    console.log("\nTranslating to French:");
    const french = await streamTranslation(text, "fr");
    
    // Translate to Spanish
    console.log("\n\nTranslating to Spanish:");
    const spanish = await streamTranslation(text, "es");
    
    console.log("\n\nTranslation Results:");
    console.log(`Original: ${text}`);
    console.log(`French: ${french}`);
    console.log(`Spanish: ${spanish}`);
    
  } catch (error) {
    console.error("Translation error:", error);
  }
}

// Run the examples
runExamples().catch(console.error);