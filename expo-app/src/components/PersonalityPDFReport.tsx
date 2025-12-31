import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import { Platform } from "react-native";
import { showToast } from "@/src/components/GlobalToast";

interface CorrectiveAction {
  challenge: string;
  recommendation: string;
  expected_outcome: string;
}

interface PersonalityInsight {
  maritime_title: string;
  big_five_type_code: string;
  big_five_type_full: string;
  famous_individuals: string[];
  description: string;
  personality_traits: Record<string, string> | Record<string, string>[];
  career_path: Record<string, string>;
  red_flags: string[];
  corrective_actions: CorrectiveAction[];
}

interface GeneratePDFProps {
  data: PersonalityInsight;
  userName: string;
  onPdfReady?: (uri: string) => void;
}
const normalizeObjectOrArray = (
  input?: Record<string, string> | Record<string, string>[]
): { title: string; value: string }[] => {
  if (!input) return [];

  // Case 1: Array of objects
  if (Array.isArray(input)) {
    return input.flatMap((obj) =>
      Object.entries(obj).map(([title, value]) => ({
        title,
        value,
      }))
    );
  }

  // Case 2: Single object
  if (typeof input === "object") {
    return Object.entries(input).map(([title, value]) => ({
      title,
      value,
    }));
  }

  return [];
};

export const generateAndSharePersonalityPDF = async ({
  data,
  userName,
  onPdfReady,
}: GeneratePDFProps): Promise<string | null> => {
  const normalizedTraits = normalizeObjectOrArray(data.personality_traits);

  const careerObj = typeof data.career_path === "object" && !Array.isArray(data.career_path) ? data.career_path : {};

  const traitsHtml = normalizedTraits
    .map(
      ({ title, value }) => `
      <div class="trait">
        <span class="traitTitle">${title}</span>
        ${value.replace(/\n/g, "<br>")}
      </div>
    `
    )
    .join("");


  const careerHtml = Object.entries(careerObj)
    .map(([title, value]) => `<div class="trait"><span class="traitTitle">${title}</span><br>${value.replace(/\n/g, "<br>")}</div>`)
    .join("");

  const redFlagsHtml = (data.red_flags || [])
    .map((flag) => `<li style="margin-bottom: 12px; font-size: 16px;">• ${flag}</li>`)
    .join("");

  const recommendationsHtml = (data.corrective_actions || [])
    .map((item) => `
      <div style="margin-bottom: 24px; padding: 16px; background-color: #fff8e1; border-left: 5px solid #ff9800; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #e65100; font-size: 16px;">Challenge:</p>
        <p style="margin: 0 0 14px 0; font-size: 15px;">${item.challenge}</p>
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #2e7d32; font-size: 16px;">Recommendation:</p>
        <p style="margin: 0 0 10px 0; font-size: 15px;">${item.recommendation}</p>
        <p style="margin: 0; font-style: italic; color: #388e3c; font-size: 14px;">Expected Outcome: ${item.expected_outcome}</p>
      </div>
    `)
    .join("");

  const famousHtml = data.famous_individuals?.length
    ? `<div class="section">
        <h2 class="sectionTitle">Famous Individuals</h2>
        <div class="chips">
          ${data.famous_individuals.map((name) => `<span class="chip">${name}</span>`).join("")}
        </div>
       </div>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Personality Report - ${userName}</title>
<style>
  body {font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 60px 40px; background: #fff; color: #333; line-height: 1.6;}
  .container {max-width: 800px; margin: 0 auto;}
  .header {text-align: center; margin-bottom: 60px;}
  .reportFor {font-size: 22px; color: #555; margin-bottom: 6px;}
  .userName {font-size: 38px; font-weight: bold; color: #02130b; margin: 12px 0;}
  .mainTitle {font-size: 34px; font-weight: bold; color: #02130b; margin: 20px 0 10px;}
  .typeCode {font-size: 52px; font-weight: bold; color: #02130b;}
  .typeFull {font-size: 20px; font-style: italic; margin: 20px 0 40px; color: #444;}
  .section {margin-bottom: 50px;}
  .sectionTitle {font-size: 26px; font-weight: bold; color: #02130b; border-bottom: 4px solid #B0DB02; padding-bottom: 10px; margin-bottom: 20px;}
  .chips {display: flex; flex-wrap: wrap; gap: 12px; margin-top: 15px;}
  .chip {background-color: #B0DB02; color: white; padding: 10px 20px; border-radius: 30px; font-size: 16px;}
  .description {font-size: 18px; line-height: 28px;}
  .trait {margin-bottom: 28px; font-size: 17px;}
  .traitTitle {font-weight: bold; display: block; margin-bottom: 8px; color: #000; font-size: 18px;}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <p class="reportFor">Personality Map Result Of</p>
    <h1 class="userName">${userName}</h1>
    <h1 class="mainTitle">${data.maritime_title || "Your Personality Result"}</h1>
    <p class="typeCode">${data.big_five_type_code || ""}</p>
    <p class="typeFull">${data.big_five_type_full || ""}</p>
  </div>

  ${famousHtml}

  <div class="section">
    <h2 class="sectionTitle">Personality Description</h2>
    <div class="description">${(data.description || "").replace(/\n/g, "<br>")}</div>
  </div>

  <div class="section">
    <h2 class="sectionTitle">Personality Traits</h2>
    ${traitsHtml}
  </div>

  <div class="section">
    <h2 class="sectionTitle">Recommended Career Paths</h2>
    ${careerHtml}
  </div>

  <div class="section">
    <h2 class="sectionTitle" style="color: #d32f2f; border-bottom-color: #d32f2f;">Red Flags</h2>
    <ul style="padding-left: 24px; font-size: 16px; line-height: 1.9;">
      ${redFlagsHtml}
    </ul>
  </div>

  <div class="section">
    <h2 class="sectionTitle" style="color: #2e7d32; border-bottom-color: #4caf50;">Corrective Actions & Recommendations</h2>
    ${recommendationsHtml}
  </div>

  <div style="margin-top: 80px; text-align: center; color: #888; font-size: 12px;">
    <p>Generated on ${new Date().toLocaleDateString()} • Powered by SeaBuddy</p>
  </div>
</div>
</body>
</html>`;

  try {
    const { uri } = await Print.printToFileAsync({ html });

    const safeName = userName.replace(/[^a-zA-Z0-9]/g, "_");
    const safeCode = (data.big_five_type_code || "Result").replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `${safeName}_Personality_${safeCode}_${new Date().toISOString().slice(0, 10)}.pdf`;

    const destFile = new File(Paths.document, fileName);
    if (destFile.exists) destFile.delete();

    const sourceFile = new File(uri);
    sourceFile.copy(destFile);

    const finalUri = destFile.uri;
    onPdfReady?.(finalUri);

    // Auto-share
    await Sharing.shareAsync(finalUri, {
      mimeType: "application/pdf",
      dialogTitle: "Personality Assessment Report",
      UTI: Platform.OS === "ios" ? "com.adobe.pdf" : undefined,
    });

    return finalUri;
  } catch (error: any) {
    console.error("PDF Error:", error);
    if (error.message !== "User cancellation.") {
      showToast.error("Error", "Failed to generate or share PDF");
    }
    return null;
  }
};