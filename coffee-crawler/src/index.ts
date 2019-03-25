import * as sqlite from 'sqlite3';

import { Crawler } from './Crawler';

/*
 * ページとページの関係、もしくはサイトという関係性をどう示し構築するか。
 * それはそもそも別か。となると以下のフローでよい？
 * hostnameが一致するものを内部リンク。それ以外を外部リンク。と定義。
 * - entry pointとなるurlを決める
 * - そのhostnameに紐づけて、管理用内部リクエストキュー、管理用外部リクエストキューを作成
 * - PageView取得
 * - 内部リンクを管理用内部リンクリストに追加(パス解決済)
 * - 外部リンクを管理用外部リンクリストに追加
 * - 内部リンクをクロール
 * - すでにcrawlされており10日以内のリンクはスキップ
 * - 内部リンクリクエストキューが消化されたら外部へ
 *
 * facebook、twitter、instagram、google mapsなどの内部リンクは厳しい気がする
 * 内部が巨大ネットワークになっているタイプは厳しいのか
 */

console.log('Launch a crawler.');
const db = new sqlite.Database('db/development');

(async () => {
  const entryUrl: string = 'https://www.saredocoffee.com/';
  // const entryUrl: string = 'https://www.facebook.com/nocoffeefukjapan/';
  console.log(`entry url: ${entryUrl}`);

  const crawler: Crawler = new Crawler();
  await crawler.start(entryUrl, false);
})();
