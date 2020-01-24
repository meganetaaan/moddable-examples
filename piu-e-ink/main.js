/*
 * Copyright (c) 2016-2017  Moddable Tech, Inc.
 *
 *   This file is part of the Moddable SDK.
 * 
 *   This work is licensed under the
 *       Creative Commons Attribution 4.0 International License.
 *   To view a copy of this license, visit
 *       <http://creativecommons.org/licenses/by/4.0>.
 *   or send a letter to Creative Commons, PO Box 1866,
 *   Mountain View, CA 94042, USA.
 *
 */
import {Skin, Application, Text, Style} from "piu/MC";

const fluid = {
	top: 0,
	right: 0,
	bottom: 0,
	left: 0
}
const TextStyle = Style.template({
  font: 'k8x12',
  color: 'black',
  horizontal: 'left'
})
function sliceString (string, interval) {
	const len = string.length
	let i = 0
	const arr = []
	while (i < len) {
		arr.push({
			spans: string.slice(i, i + interval)
		})
		i += interval
	}
	return arr
}
const wagahai = 'わが輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。 吾輩はここで始めて人間というものを見た。しかもあとで聞くとそれは書生という人間中で一番どうあくな種族であったそうだ。この書生というのは時々我々を捕まえて煮て食うという話である。しかしその当時は何という考もなかったから別段恐しいとも思わなかった。ただ彼の掌てのひらに載せられてスーと持ち上げられた時何だかフワフワした感じがあったばかりである。 掌の上で少し落ちついて書生の顔を見たのがいわゆる人間というものの見始めであろう。 この時妙なものだと思った感じが今でも残っている。 第一毛をもって装飾されべきはずの顔がつるつるしてまるで薬缶だ。 その後猫にもだいぶ逢ったがこんな片輪には一度も出会した事がない。 のみならず顔の真中があまりに突起している。そうしてその穴の中から時々ぷうぷうと煙を吹く。 どうもむせぽくて実に弱った。これが人間の飲む煙草というものである事はようやくこの頃知った。 この書生の掌の裏でしばらくはよい心持に坐っておったが、しばらくすると非常な速力で運転し始めた。 書生が動くのか自分だけが動くのか分らないが無暗むやみに眼が廻る。胸が悪くなる。 到底助からないと思っていると、どさりと音がして眼から火が出た。それまでは記憶しているがあとは何の事やらいくら考え出そうとしても分らない。 ふと気が付いて見ると書生はいない。たくさんおった兄弟が一ぴきも見えぬ。 肝心の母親さえ姿を隠してしまった。その上今までの所とは違って無暗に明るい。眼を明いていられぬくらいだ。 はてな何でも容子がおかしいと、のそのそ這い出して見ると非常に痛い。わが輩はわらの上から急に笹原の中へ棄てられたのである。'

let LoveApplication = Application.template(_ => ({
	top: 0, bottom: 0, left: 0, right: 0,
	skin: new Skin({
		fill: 'white'
	}),
	contents: [
		new Text(null, {
			...fluid,
			Style: TextStyle,
			blocks: sliceString(wagahai, 50)
		})
	]
}));

export default function () {
	new LoveApplication(null, { displayListLength:4096 * 10, touchCount:0 });
}
