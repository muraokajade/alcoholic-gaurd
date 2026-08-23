import { AiCheckinRequest, AiCheckinResponse } from '../models/types';
import { RECOMMENDED_ACTION_IDS } from '../constants/alternativeActions';

// AI朝チェックインのサービス境界。
// 実バックエンドが用意でき次第、この interface を満たす実装に差し替える。
export interface AiCheckinService {
  getMorningAdvice(request: AiCheckinRequest): Promise<AiCheckinResponse>;
}

// v1時点ではAI接続基盤がないため、ルールベースのモック応答を返す。
// 診断・医療判断・飲酒可否の判断は行わない。
class MockAiCheckinService implements AiCheckinService {
  async getMorningAdvice(request: AiCheckinRequest): Promise<AiCheckinResponse> {
    const { mood, lightness, refreshment, urge, yesterdayDrank } = request;

    const summaryParts: string[] = [];
    if (urge >= 7) {
      summaryParts.push('今日は飲酒欲求がやや高めのスタートです。');
    } else if (urge <= 3) {
      summaryParts.push('今日は飲酒欲求が落ち着いています。');
    } else {
      summaryParts.push('今日は飲酒欲求は普段どおりです。');
    }
    if (mood <= 4 || lightness <= 4 || refreshment <= 4) {
      summaryParts.push('体調・気分はやや低めなので、無理のない行動から始めましょう。');
    } else {
      summaryParts.push('体調・気分は良さそうです。');
    }

    const situationNotes = yesterdayDrank
      ? '昨日は飲酒がありました。連続させないことを意識できると良さそうです。'
      : '直近で飲酒につながりやすい特別な予定は確認できていません。';

    return {
      summary: summaryParts.join(''),
      situationNotes,
      suggestedActionIds: RECOMMENDED_ACTION_IDS,
    };
  }
}

export const aiCheckinService: AiCheckinService = new MockAiCheckinService();
