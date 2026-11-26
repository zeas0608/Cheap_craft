# cheapCraft v1.63 — Bedrock アニメーション・食事実装

## 出典と範囲
Mojang/bedrock-samples の公開リソースパックを基準とする。
- [player_firstperson.animation.json](https://github.com/Mojang/bedrock-samples/blob/main/resource_pack/animations/player_firstperson.animation.json)（取得時のblob SHA: 1b664aa21eae5f2bd994a2fad53a7f42f235af50）
- [player.animation.json](https://github.com/Mojang/bedrock-samples/blob/main/resource_pack/animations/player.animation.json)（blob SHA: ae8bdf3be4ad99791c4ff8a93ad816d9f0aa2209）
- [player.entity.json](https://github.com/Mojang/bedrock-samples/blob/main/resource_pack/entity/player.entity.json)（blob SHA: c5d368d1f32cce943ef4473fb1e75594c8bee222）
- [Molang math](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/molangreference/examples/molangconcepts/mathfunctions/math_sin)
- [Food](https://minecraft.wiki/w/Food) / [Raw Chicken](https://minecraft.wiki/w/Raw_Chicken)
- [Use modifiers](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_use_modifiers)

## 公式RP由来
- sinD/cosD は度数法。bedrockArmDelta(t,f,shortArmOffset)、bedrockItemDelta(t)、bedrockThirdAttack(t)、bedrockWalk(distance,bob)、bedrockSwim(time,side) に公開式を移植。
- 一人称は腕とアイテムの変換を独立して計算。手持ちに応じて合成。呼吸Yは sinD(lifeTime*45)*0.5、交換Yは -10*(1-equipHeight)。
- 三人称は右腕・左腕・胴体攻撃、左右逆位相の歩行、呼吸roll、騎乗腕-36°・脚-81°・yaw±18°、スニーク前傾28°と腕-5.7°、1.3秒の水泳腕キーフレームと脚の17.2°キック。
- 一人称・三人称後方・前方で進行度を共有。
- animationState は attackTime, attackDuration, useType, useTime, useDuration, equipHeight, mainHandItem, renderedItem, walkDistance, handBob, lifeTime, moveDistance, moveSpeed, swimTime を持つ。
- itemBehavior は全アイテムの描画分類（arm/block/shaped/flat/tool/weapon）とアクションを別管理。階段・ハーフ・フェンスなどは手持ち専用の近似立体モデル。ワールド設置未実装の建材に新しい設置機能は追加していない。
- 攻撃の再入力はリセット。採掘ループは照準が外れると現在周期で終了。給餌・骨粉・投擲・設置は既存成功条件を維持。

## 非公開値の近似・現行描画への変換
- native attack_time の生成は非公開。300ms は暫定値で、itemBehavior/swingDuration の経路で将来調整可能。
- first_person_item_rotation_factor のネイティブ値は不明なので公開 first_person_rotation_factor を代用。公式素手基準値は BEDROCK_EMPTY_ARM に記録。既存画面投影に合わせた静止姿勢と1モデル単位=.115の変換、アイテム終端12%のフェードを使用。公式骨階層の完全な移植ではない。
- equipHeight 生成は暫定300msの往復。bobは60Hz相当の .02 平滑化。歩行距離・速度・glidingSpeedは実移動量から推定。独自カメラスウェイは廃止。
- 三人称の水泳・スニークのroot、食事、所持ポーズ、ブロックの手持ち形状は描画系に合わせた近似。公式実機とのフレーム比較未実施。
- 食事口元への0.2秒・戻り0.14秒、食べかす周期0.2秒は暫定。食事音はWeb Audioによる合成音で公式音源ではない。

## 食事
FOOD_RULES は11種を構造体で定義。nutrition, saturation, useDuration, movementModifier, canAlwaysEat, useAnimation, effects を保持。
- 1.6秒で消費。途中キャンセル、スロット変更、インベントリ、死亡、モード変更で中断。連続使用対応。
- Survivalは満腹時不可。Creativeは満腹でも可能、在庫・満腹・状態異常を変えない。難易度選択は現状Normal固定。
- 食事中の移動倍率.35はMicrosoftのApple例を全11食品へ暫定適用。ダッシュ解除・禁止。
- 生鶏肉30%でHunger I 30秒。毎秒.1 exhaustion（30秒で3）。保存互換の hungerEffect を追加、HUD変色。食事パーティクルは不透明テクスチャ画素から採色。
- 既存の自然回復・飢餓ロジックは維持。

## 未実装
弓、クロスボウ、盾、ポーション本体と専用使用アニメーション、ステータス効果によるswing duration補正、難易度設定、公式音源、実機による非公開タイミング校正。今後は別のuseTypeで実装する。
