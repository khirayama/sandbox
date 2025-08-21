import { z } from 'zod';

/**
 * 天気取得ツール
 */
export const getWeatherTool = {
  name: "getWeather",
  description: "与えられた場所の天気の情報を取得します。",
  inputSchema: z.object({
    place: z.string().describe("天気を取得したい場所")
  })
};

export function getWeather(place: string): string {
  const weathers = ["晴れ", "晴れ", "雨", "曇り", "曇り", "雪"];
  const randomIndex = Math.floor(Math.random() * weathers.length);
  return weathers[randomIndex];
}

/**
 * 時刻取得ツール
 */
export const getTimeTool = {
  name: "getTime",
  description: "現在時刻を返します",
  inputSchema: z.object({})
};

export function getTime(): string {
  return new Date().toISOString();
}
