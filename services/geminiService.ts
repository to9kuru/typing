import { GoogleGenAI, Type } from "@google/genai";
import { WordItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTypingList = async (input: string): Promise<WordItem[]> => {
  const modelId = "gemini-2.5-flash";

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        display: {
          type: Type.STRING,
          description: "表示する単語（日本語または英語）。",
        },
        romaji: {
          type: Type.STRING,
          description: "タイピングのガイドとして表示する標準的なローマ字（基本はヘボン式）。",
        },
        accepts: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "許容されるすべてのローマ字入力パターンのリスト。ヘボン式、訓令式、その他の一般的な入力ゆらぎ（si/shi, tu/tsu, fu/hu, cci/tchiなど）をすべて含むこと。",
        },
      },
      required: ["display", "romaji", "accepts"],
    },
  };

  const prompt = `
    以下のテキスト入力を分析し、タイピング練習用のデータリストを作成してください。
    
    ルール:
    1. 入力が日本語の場合、'display'は日本語表記、'romaji'は標準的なヘボン式ローマ字としてください。
    2. 'accepts'配列には、その単語を入力する際に考えられるすべてのローマ字の綴りをリストアップしてください。
       - 例: "し" -> ["shi", "si", "ci"]
       - 例: "つ" -> ["tsu", "tu"]
       - 例: "ふ" -> ["fu", "hu"]
       - 例: "ん" -> ["n", "nn"] (文末や次が母音の場合はnnが必要だが、単独のnも許容する入力としては含める)
       - 例: "ちゃ" -> ["cha", "tya", "cya"]
    3. 入力が英語の場合、'display'と同じものを小文字にして'romaji'と'accepts'に入れてください。
    4. 入力が単一のトピック（例：「果物」「寿司」）の場合、そのトピックに関連する単語を10個生成してください。
    5. 入力が長文や箇条書きの場合は、それらを個別のアイテムとして分割してください。
    
    入力テキスト:
    "${input}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "あなたはタイピングゲームのデータを作成するアシスタントです。ユーザーの利便性を考え、入力のゆらぎ（si/shiなど）を完璧に網羅したデータを作成します。",
      },
    });

    const rawData = JSON.parse(response.text || "[]");

    // 一意なIDを付与
    return rawData.map((item: any) => ({
      id: crypto.randomUUID(),
      display: item.display,
      romaji: item.romaji.toLowerCase(),
      accepts: item.accepts.map((s: string) => s.toLowerCase()),
    }));
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw new Error("データ生成に失敗しました。もう一度試してみてください。");
  }
};